'use server';

import { serverAction } from '@/lib/server-action';
import { CreateSubaccountSchema } from './input';
import { db } from '@/lib/db';
import {
  permissionTable,
  pipelineTable,
  subAccountSidebarOptionTable,
  subaccountTable,
} from '@/schema';
import { sql } from 'drizzle-orm';
import { createActivityLogNotification, getUserDetails } from '@/lib/queries';
import { revalidatePath } from 'next/cache';

export const upsertSubaccountAction = serverAction(
  CreateSubaccountSchema,
  async (formData) => {
    try {
      const authUser = await getUserDetails();
      if (!(authUser && authUser.agencyId)) {
        throw new Error('Unauthorized');
      }

      const subaccount = await db.transaction(async () => {
        const [subaccount] = await db
          .insert(subaccountTable)
          .values({ ...formData, agencyId: authUser.agencyId as string })
          .onConflictDoUpdate({
            target: subaccountTable.companyEmail,
            set: formData,
            where: sql`${subaccountTable.id} = ${formData.id ?? null}::uuid`,
          })
          .returning();

        if (!subaccount) {
          return null;
        }

        await Promise.all([
          db.insert(permissionTable).values({
            subAccountId: subaccount.id,
            email: authUser.email,
            access: true,
          }),
          db
            .insert(pipelineTable)
            .values({ name: 'Lead Cycle', subAccountId: subaccount.id }),

          db.insert(subAccountSidebarOptionTable).values([
            {
              name: 'Media',
              icon: 'database',
              link: `/subaccount/${subaccount.id}/media`,
              subaccountId: subaccount.id,
            },
            {
              name: 'Launchpad',
              icon: 'clipboardIcon',
              link: `/subaccount/${subaccount.id}/launchpad`,
              subaccountId: subaccount.id,
            },
            {
              name: 'Automations',
              icon: 'chip',
              link: `/subaccount/${subaccount.id}/automations`,
              subaccountId: subaccount.id,
            },
            {
              name: 'Pipelines',
              icon: 'flag',
              link: `/subaccount/${subaccount.id}/pipelines`,
              subaccountId: subaccount.id,
            },
            {
              name: 'Dashboard',
              icon: 'category',
              link: `/subaccount/${subaccount.id}`,
              subaccountId: subaccount.id,
            },
            {
              name: 'Settings',
              icon: 'settings',
              link: `/subaccount/${subaccount.id}/settings`,
              subaccountId: subaccount.id,
            },
            {
              name: 'Funnels',
              icon: 'pipelines',
              link: `/subaccount/${subaccount.id}/funnels`,
              subaccountId: subaccount.id,
            },

            {
              name: 'Contacts',
              icon: 'person',
              link: `/subaccount/${subaccount.id}/contacts`,
              subaccountId: subaccount.id,
            },
          ]),
        ]);

        await createActivityLogNotification({
          agencyId: authUser.agencyId as string,
          description: `${authUser.name} | updated sub account | ${subaccount.name}`,
          subaccountId: subaccount.id as never,
        });

        return subaccount;
      });

      if (!subaccount) {
        throw new Error('Subaccount not found');
      }

      revalidatePath(`/agency/${authUser.agencyId}/all-subaccounts`);

      return { data: subaccount };
    } catch (e) {
      console.log(e);
      throw new Error(`An error occurred saving your subaccount details`);
    }
  }
);
