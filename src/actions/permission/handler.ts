'use server';
import { serverAction } from '@/lib/server-action';
import { PermissionSchema } from './input';
import { db } from '@/lib/db';
import { eq, inArray, sql } from 'drizzle-orm';
import {
  agencyTable,
  permissionTable,
  subaccountTable,
  userTable,
} from '@/schema';
import { alias } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { createActivityLogNotification, getUserDetails } from '@/lib/queries';

export const updatePermissionAction = serverAction(
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
                        ${authUser.userId} in (
                            select ${userTable.userId} from ${userTable}
                            where ${userTable.agencyId} = ${currentAgency.id} 
                            and ${authUser.role} in ('agency-owner', 'agency-admin')
                        )
                    
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

      const updatedPermissions = await db.transaction(async () => {
        const [updatedPermission] = await db
          .insert(permissionTable)
          .values(data)
          .onConflictDoUpdate({
            target: [permissionTable.email, permissionTable.subAccountId],
            set: { access: data.access },
            where: inArray(permissionTable.email, [
              data.email ?? null,
              authUser.email,
            ]),
          })
          .returning();

        await createActivityLogNotification({
          description: `Gave ${authUser.name} access to | ${subaccountName}`,
          subaccountId: subaccountId as never,
          agencyId,
        });

        const userSubaccountPermissions = db
          .$with('user_subaccount_permissions')
          .as(
            db
              .select()
              .from(permissionTable)
              .where(eq(permissionTable.email, updatedPermission.email))
          );

        return await db
          .with(userSubaccountPermissions)
          .select()
          .from(userSubaccountPermissions)
          .where(
            authUser.role === 'agency-owner' || authUser.role === 'agency-admin'
              ? sql`1=1`
              : eq(userSubaccountPermissions.access, true)
          );
      });

      return {
        data: updatedPermissions,
      };
    } catch (e) {
      console.log(e);
      throw new Error('An error occurred while updating account permission');
    }
  }
);
