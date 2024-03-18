'use server';

import { db } from '@/lib/db';
import { createActivityLogNotification, getUserDetails } from '@/lib/queries';
import { serverAction } from '@/lib/server-action';
import { subaccountTable } from '@/schema';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

export const removeSubaccountAction = serverAction(
  z.object({ id: z.string().uuid() }),
  async ({ id }) => {
    try {
      const user = await getUserDetails();

      if (!(user && user.agencyId && user.role === 'agency-owner')) {
        throw new Error('Unauthorized');
      }

      const removedSubaccount = await db.transaction(async () => {
        const [removedSubaccount] = await db
          .delete(subaccountTable)
          .where(
            sql`
        ${subaccountTable.agencyId} = ${user.agencyId} and ${subaccountTable.id} = ${id}
        `
          )
          .returning();

        if (removedSubaccount) {
          await createActivityLogNotification({
            agencyId: removedSubaccount.agencyId,
            description: `Deleted a subaccount | ${removedSubaccount.name} `,
          });
        }

        return removedSubaccount;
      });

      if (!removedSubaccount) {
        throw new Error('Subaccount not found');
      }

      return { data: removedSubaccount };
    } catch (e) {
      console.log('[DELETE SUBACCOUNT]', e);
      throw new Error('An error occurred while removing subaccount.');
    }
  }
);
