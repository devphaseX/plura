'use server';

import { z } from 'zod';
import { protectServerAction } from '../../lib/server-action';
import { UpdateTicketOrderSchema } from './input';
import { db } from '../../lib/db';
import { laneTable, pipelineTable, ticketTable } from '../../schema';
import { sql } from 'drizzle-orm';
import { ActionError } from '../../lib/utils';

const UpdateTicketOrdersSchema = z.array(UpdateTicketOrderSchema).min(1);
export const updateTicketOrdersAction = protectServerAction(
  UpdateTicketOrdersSchema,
  async (tickets, user) => {
    try {
      const ownedPipeline = db.$with('owned_pipeline').as(
        db
          .select()
          .from(pipelineTable)
          .where(
            sql`${pipelineTable.subAccountId} in ${sql.raw(
              `(${(user?.permissions ?? [])
                .map(({ subAccountId }) => `'${subAccountId}'`)
                .join(',')})`
            )}`
          )
      );

      const ownedLane = db.$with('owned_lane').as(
        db.select().from(laneTable).where(sql`
          ${laneTable.pipelineId} in (
           select ${ownedPipeline.id} from ${ownedPipeline}
          )
          `)
      );

      const updateTicketOrders = await db.transaction(async () => {
        return await Promise.all(
          tickets.map((ticket) =>
            db
              .with(ownedPipeline, ownedLane)
              .update(ticketTable)
              .set(ticket)
              .where(
                sql`${ticket.id} = ${ticketTable.id} and 
              ${ticketTable.laneId} = ${ticket.laneId} and 
               ${ticketTable.laneId} in (
                  select ${ownedLane.id} in ${ownedLane}
              )`
              )
              .returning()
          )
        );
      });

      return {
        data: updateTicketOrders,
      };
    } catch (e) {
      console.log('[UPDATE_TICKET_ORDER]', e);
      throw new ActionError('An error occurred while updating tickets orders');
    }
  }
);
