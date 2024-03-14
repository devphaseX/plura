import { UserDetails } from '@/components/forms/user-details';
// export c

import { serverAction } from '@/lib/server-action';
import { PermissionSchema } from './input';
import { currentUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { eq, inArray, or, sql } from 'drizzle-orm';
import {
  agencyTable,
  permissionTable,
  subaccountTable,
  userTable,
} from '@/schema';
import { alias } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { createActivityLogNotification, getUserDetails } from '@/lib/queries';

export const updatePermission = serverAction(
  PermissionSchema.extend({
    type: z.enum(['agency', 'subaccount']).default('agency'),
  }),
  async (data) => {
    try {
      const authUser = await getUserDetails();
      if (!authUser) throw new Error('Unauthorized');

      const subaccountInfo = db
        .$with('user_subaccount')
        .as(
          db
            .select()
            .from(subaccountTable)
            .where(eq(subaccountTable.id, data.subAccountId))
        );

      const currentAgency = alias(agencyTable, 'current_user');

      const [
        { permitted, agencyId, subaccountId, subaccountName } = {
          permitted: false,
          agencyId: '',
          subaccountId: '',
          subaccountName: '',
        },
      ] = await db
        .with(subaccountInfo)
        .select({
          permitted: sql<boolean>`
                case
                    when ${data.type} = 'agency' then (
                        ${authUser.userId} in (
                            select ${userTable.userId} from ${userTable}
                            where ${userTable.agencyId} = ${currentAgency.id}
                        )
                    ) 
                    else exists (
                        select * from ${subaccountInfo}
                        where ${authUser.email}  = ${subaccountInfo.companyEmail}
                    )
                end
        `,
          agencyId: currentAgency.id,
          subaccountId: subaccountInfo.id,
          subaccountName: subaccountInfo.name,
        })
        .from(currentAgency)
        .innerJoin(
          subaccountInfo,
          eq(subaccountInfo.agencyId, currentAgency.id)
        );

      if (!permitted) {
        throw new Error(
          `You don't have the necessary permissions to perform this action`
        );
      }

      const updatedPermission = await db.transaction(async () => {
        const [updatedPermission] = await db
          .insert(permissionTable)
          .values(data)
          .onConflictDoUpdate({
            target: permissionTable.email,
            set: { access: data.access },
            where: inArray(permissionTable.email, [
              data.email ?? null,
              authUser.email,
            ]),
          })
          .returning();

        if (data.type === 'agency') {
          await createActivityLogNotification({
            agencyId,
            description: `Gave ${authUser.name} access to | ${subaccountName}`,
            subaccountId: subaccountId as never,
          });
        }

        return updatedPermission;
      });

      return {
        data: updatedPermission,
      };
    } catch (e) {
      console.log(e);
      throw new Error('An error occurred while updating account permission');
    }
  }
);
