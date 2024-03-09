'use server';

import { serverAction } from '@/lib/server-action';
import {
  CreateSubaccountInput,
  CreateSubaccountSchema,
  UpdateSubaccountInput,
  UpdateSubaccountSchema,
} from './input';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  permissionTable,
  pipelineTable,
  subAccountSidebarOptionTable,
  subaccountTable,
  userTable,
} from '@/schema';
import { eq, sql } from 'drizzle-orm';
import { createActivityLogNotification } from '@/lib/queries';

const InputSchema = z.union([
  z.object({ type: z.enum(['create']), data: CreateSubaccountSchema }),
  z.object({
    type: z.enum(['update']),
    data: UpdateSubaccountSchema.extend({ id: z.string().uuid() }),
  }),
]);

export const upsertSubaccountAction = serverAction(
  InputSchema,
  async (formData) => {
    try {
      const [agencyOwner] = await db.select().from(userTable).where(sql`
           ${userTable.agencyId} =  ${formData.data.agencyId} 
           and ${userTable.role} = 'agency-owner'
        `);

      if (!agencyOwner) {
        throw new Error('User not an agency owner');
      }

      const { data } = formData;

      const subaccount = await db.transaction(async () => {
        const [subaccount] = await db
          .insert(subaccountTable)
          .values(data as CreateSubaccountInput)
          .onConflictDoUpdate({
            target: subaccountTable.companyEmail,
            set: data as UpdateSubaccountInput,
            where: eq(subaccountTable.id, data.id as string),
          })
          .returning();

        if (!subaccount) {
          return null;
        }

        await Promise.all([
          db.insert(permissionTable).values({
            subAccountId: subaccount.id,
            email: agencyOwner.email,
            access: true,
          }),
          db
            .insert(pipelineTable)
            .values({ name: 'Lead Cycle', subAccountId: subaccount.id }),

          db.insert(subAccountSidebarOptionTable).values([
            {
              name: 'Launchpad',
              icon: 'clipboardIcon',
              link: `/subaccount/${subaccount.id}/launchpad`,
            },
            {
              name: 'Settings',
              icon: 'settings',
              link: `/subaccount/${subaccount.id}/settings`,
            },
            {
              name: 'Funnels',
              icon: 'pipelines',
              link: `/subaccount/${subaccount.id}/funnels`,
            },
            {
              name: 'Media',
              icon: 'database',
              link: `/subaccount/${subaccount.id}/media`,
            },
            {
              name: 'Automations',
              icon: 'chip',
              link: `/subaccount/${subaccount.id}/automations`,
            },
            {
              name: 'Pipelines',
              icon: 'flag',
              link: `/subaccount/${subaccount.id}/pipelines`,
            },
            {
              name: 'Contacts',
              icon: 'person',
              link: `/subaccount/${subaccount.id}/contacts`,
            },
            {
              name: 'Dashboard',
              icon: 'category',
              link: `/subaccount/${subaccount.id}`,
            },
          ]),
        ]);

        await createActivityLogNotification({
          agencyId: agencyOwner.agencyId as string,
          description: `${agencyOwner.name} | updated sub account | ${subaccount.name}`,
          subaccountId: subaccount.id as never,
        });

        return subaccount;
      });

      if (!subaccount) {
        throw new Error('Subaccount not found');
      }

      return { type: formData.type, data: subaccount };
    } catch (e) {
      console.log(e);
      throw new Error(
        `An error occurred while ${
          formData.type === 'create' ? 'creating' : 'updating'
        } subaccount`
      );
    }
  }
);
