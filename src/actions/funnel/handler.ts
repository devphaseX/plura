'use server';

import { db } from '@/lib/db';
import { CreateFunnelSchema } from './input';
import { protectServerAction } from '@/lib/server-action';
import { funnelTable, pipelineTable } from '@/schema';
import {
  checkUserSubaccountAccess,
  createActivityLogNotification,
} from '@/lib/queries';
import { ActionError } from '@/lib/utils';
export const upsertFunnel = protectServerAction(
  CreateFunnelSchema.omit({ liveProducts: true }),
  async (data, user) => {
    try {
      const permitted = await checkUserSubaccountAccess({
        userId: user.id,
        subaccountId: data.subaccountId,
      });

      if (!permitted) {
        throw new ActionError('Unauthorized');
      }

      const updatedFunnel = await db.transaction(async () => {
        const [updatedFunnel] = await db
          .insert(funnelTable)
          .values(data)
          .onConflictDoUpdate({
            target: [pipelineTable.id],
            set: {
              name: data.name,
            },
          })
          .returning();

        await createActivityLogNotification({
          subaccountId: data.subaccountId,
          description: `Updated Funnel | ${updatedFunnel.name}`,
        });

        return updatedFunnel;
      });

      return {
        data: updatedFunnel,
      };
    } catch (e) {
      console.log('[UPSERT FUNNEL]', e);
      if (Object(e) instanceof ActionError) {
        throw e;
      }
      throw new ActionError('An error occurred while updating record');
    }
  }
);
