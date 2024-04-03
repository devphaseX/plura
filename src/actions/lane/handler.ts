'use server';

import { z } from 'zod';
import { protectServerAction } from './../../lib/server-action';
import { LaneFormSchema } from './input';
import { db } from '../../lib/db';
import { laneTable, pipelineTable, subaccountTable } from '../../schema';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { ActionError } from '../../lib/utils';
import {
  checkUserSubaccountAccess,
  createActivityLogNotification,
} from '@/lib/queries';

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

      const lane = await db.transaction(async () => {
        const [lane] = await db
          .insert(laneTable)
          .values({
            ...formData,
            order: sql<number>`
            (
              select coalesce(count(*), 0)::integer + 1 from ${laneTable}
              where ${laneTable.pipelineId} = ${formData.pipelineId}
            )
          `,
          })
          .onConflictDoUpdate({
            target: [laneTable.id],
            set: {
              ...formData,
              order: sql<number>`${laneTable.order}`,
            },
          })
          .returning();

        await createActivityLogNotification({
          subaccountId: subaccount.id,
          description: `Save Lane | ${lane.name}`,
        });

        return lane;
      });

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

export const deleteLaneAction = protectServerAction(
  LaneFormSchema.pick({ id: true }).required({ id: true }),
  async (formData, user) => {
    try {
      const deletedLane = await db.transaction(async () => {
        const permittedSubaccounts = db.$with('permitted_subaccounts').as(
          db
            .select()
            .from(subaccountTable)
            .where(
              sql`${subaccountTable.id} in ${sql.raw(
                `(${(user?.permissions ?? [])
                  .map(({ subAccountId }) => `'${subAccountId}'`)
                  .join(',')})`
              )}`
            )
        );

        const accessPipelines = db.$with('access_pipelines').as(
          db.select().from(pipelineTable)
            .where(sql`${pipelineTable.subAccountId} in (
          select ${permittedSubaccounts.id} from ${permittedSubaccounts}
        )`)
        );

        const [deletedLane] = await db
          .with(permittedSubaccounts, accessPipelines)
          .delete(laneTable)
          .where(
            sql`${laneTable.pipelineId} in (
          select ${accessPipelines.id} from ${accessPipelines}
        ) and ${laneTable.id} = ${formData.id}`
          )
          .returning();

        record: if (deletedLane) {
          const lanePipelineSubaccountId = (
            await db
              .select({ ...getTableColumns(subaccountTable) })
              .from(subaccountTable)
              .innerJoin(
                pipelineTable,
                eq(subaccountTable.id, pipelineTable.subAccountId)
              )
              .where(sql`${pipelineTable.id} =  ${deletedLane.pipelineId}`)
          ).at(0)?.id;

          if (!lanePipelineSubaccountId) {
            break record;
          }

          await createActivityLogNotification({
            subaccountId: lanePipelineSubaccountId,
            description: `Deleted lane | ${deletedLane.name}`,
          });
        }

        return deletedLane;
      });

      if (!deletedLane) {
        throw new ActionError('Lane not found');
      }

      return { data: deletedLane };
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
