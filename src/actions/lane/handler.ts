'use server';

import { z } from 'zod';
import { protectServerAction } from './../../lib/server-action';
import { LaneFormSchema } from './input';
import { db } from '../../lib/db';
import { laneTable, pipelineTable, subaccountTable } from '../../schema';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { ActionError } from '../../lib/utils';
import { checkUserSubaccountAccess } from '@/lib/queries';

export const upsertLaneAction = protectServerAction(
  LaneFormSchema.required({ pipelineId: true }),
  async (formData, user) => {
    try {
      const [subaccount] = await db
        .select({ ...getTableColumns(subaccountTable) })
        .from(subaccountTable)
        .innerJoin(
          pipelineTable,
          eq(subaccountTable.id, pipelineTable.subAccountId)
        )
        .where(sql`${pipelineTable.id} = ${formData.pipelineId}`);

      if (!subaccount) {
        throw new ActionError('Pipeline not found');
      }

      const permitted = await checkUserSubaccountAccess({
        userId: user.id,
        subaccountId: subaccount.id,
      });

      if (!permitted) {
        throw new ActionError('Unauthorized');
      }

      const [lane] = await db
        .insert(laneTable)
        .values({
          ...formData,
          order: sql<number>`
          (
            select coalesce(count(*), 1)::integer from ${laneTable}
            where ${laneTable.pipelineId} = ${formData.pipelineId}
          )
        `,
        })
        .onConflictDoUpdate({
          target: [laneTable.id],
          set: {
            ...formData,
          },
        })
        .returning();

      return { data: lane };
    } catch (e) {
      console.log('[UPSERT LANE]', e);
      if (Object(e) instanceof ActionError) {
        throw e;
      }
      throw new ActionError('Oops. An error occurred while updating record.');
    }
  }
);

const UpdateLaneOrdersSchema = z.array(LaneFormSchema).min(1);
export const updateLaneOrderAction = protectServerAction(
  UpdateLaneOrdersSchema,
  async (lanes, user) => {
    try {
      const updatedLaneOrders = await db.transaction(async () => {
        return await Promise.all(
          lanes.map((lane) => {
            return db
              .update(laneTable)
              .set(lane)
              .where(
                sql`
                ${lane.pipelineId ?? null} = ${laneTable.pipelineId} and (
                  select subaccount.id from ${pipelineTable}
                  inner join ${subaccountTable} on pipeline.subaccount_id = subaccount.id
                  where pipeline.id = ${lane.pipelineId ?? null}
                ) in ${sql.raw(
                  `(${(user?.permissions ?? [])
                    .map(({ subAccountId }) => `'${subAccountId}'`)
                    .join(',')})`
                )}
              `
              )
              .returning();
          })
        );
      });

      return {
        data: updatedLaneOrders,
      };
    } catch (e) {
      console.log('[UPDATE_LANE_ORDER]', e);
      throw new ActionError('An error occurred while updating lane orders');
    }
  }
);
