'use server';

import { db } from '@/lib/db';
import { PipelineSchema } from './input';
import { protectServerAction } from '@/lib/server-action';
import { pipelineTable } from '@/schema';
import {
  checkUserSubaccountAccess,
  createActivityLogNotification,
} from '@/lib/queries';
import { ActionError } from '@/lib/utils';
import * as z from 'zod';
import { sql } from 'drizzle-orm';
export const upsertPipelineAction = protectServerAction(
  PipelineSchema,
  async (data, user) => {
    try {
      const permitted = await checkUserSubaccountAccess({
        userId: user.id,
        subaccountId: data.subAccountId,
      });

      if (!permitted) {
        throw new ActionError('Unauthorized');
      }

      const updatedPipeline = await db.transaction(async () => {
        const [updatedPipeline] = await db
          .insert(pipelineTable)
          .values(data)
          .onConflictDoUpdate({
            target: [pipelineTable.id],
            set: {
              name: data.name,
            },
          })
          .returning();

        await createActivityLogNotification({
          subaccountId: data.subAccountId,
          description: `Updated pipeline | ${updatedPipeline.name}`,
        });

        return updatedPipeline;
      });

      return {
        data: updatedPipeline,
      };
    } catch (e) {
      console.log('[UPSERT PIPELINE]', e);
      if (Object(e) instanceof ActionError) {
        throw e;
      }
      throw new ActionError('An error occurred while updating record');
    }
  }
);

export const deletePipelineAction = protectServerAction(
  z.object({ id: z.string().uuid() }),
  async ({ id }, user) => {
    try {
      console.log({ user });
      const permitted = await checkUserSubaccountAccess({
        userId: user.id,
      });

      if (!permitted) {
        throw new ActionError('Unauthorized');
      }

      console.log({ permitted });
      const removedPipeline = await db.transaction(async () => {
        const [removedPipeline] = await db
          .delete(pipelineTable)
          .where(sql`${pipelineTable.id} = ${id}`)
          .returning();

        await createActivityLogNotification({
          subaccountId: removedPipeline.subAccountId,
          description: `Delete pipeline | ${removedPipeline.name}`,
        });
        return removedPipeline;
      });

      return {
        data: removedPipeline,
      };
    } catch (e) {
      console.log('[DELETE PIPELINE]', e);
      if (Object(e) instanceof ActionError) {
        throw e;
      }
      throw new ActionError('An error occurred while deleting record');
    }
  }
);
