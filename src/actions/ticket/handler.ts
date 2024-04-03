'use server';

import { z } from 'zod';
import { protectServerAction } from '../../lib/server-action';
import { TicketSchema, UpdateTicketOrderSchema } from './input';
import { db } from '../../lib/db';
import {
  contactTable,
  laneTable,
  pipelineTable,
  subaccountTable,
  Tag,
  tagTable,
  tagTicketTable,
  ticketTable,
  userTable,
} from '../../schema';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { ActionError } from '../../lib/utils';
import { alias } from 'drizzle-orm/pg-core';
import { createActivityLogNotification } from '@/lib/queries';

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

export const upsertTicketAction = protectServerAction(
  TicketSchema.required({ laneId: true }).extend({
    subaccountId: z.string().uuid(),
  }),
  async ({ subaccountId, ...formData }, user) => {
    try {
      if (user.role !== 'subaccount-user') {
        throw new ActionError('Unauthorized');
      }

      const ticket = await db.transaction(async () => {
        const [ticket] = await db
          .insert(ticketTable)
          .values({
            ...formData,
            order: sql<number>`
            (
              select coalesce(count(*), 0)::integer + 1 from ${ticketTable}
              where ${ticketTable.laneId} = ${formData.laneId}
            )
          `,
          })
          .onConflictDoUpdate({
            target: [ticketTable.id],
            set: {
              ...{
                ...formData,
                laneId: undefined,
                order: undefined,
                customerId: undefined,
              },
            },
          })
          .returning();

        await createActivityLogNotification({
          description: `Updated a ticket | ${ticket.name}`,
          subaccountId: subaccountId,
        });

        const t = alias(ticketTable, 't');

        return db
          .select({
            ...getTableColumns(t),
            assignedUser: userTable,
            customer: contactTable,
            lane: laneTable,
            tags: sql<Tag[]>`tags`,
          })
          .from(t)
          .leftJoin(userTable, eq(userTable.id, t.assignedUserId))
          .leftJoin(contactTable, eq(contactTable.id, t.customerId))
          .innerJoin(laneTable, eq(laneTable.id, t.laneId))
          .innerJoin(
            sql`lateral (
                select coalesce(
                  json_agg(
                    json_build_object(
                      ${sql.join(
                        Object.entries(getTableColumns(tagTable)).map(
                          ([key, field]) => sql`'${key}', ${field}`
                        ),
                        sql`,\n`
                      )}
                    )
                  )
                , []::json) as tags from ${tagTicketTable}
                where ${t.id} = ${tagTicketTable.ticketId}
                inner join ${tagTable} on ${tagTable.id} = ${
              tagTicketTable.tagId
            }
          )`,
            sql`true`
          )
          .where(sql`${t.id} = ${ticket.id}`);
      });

      return { data: ticket };
    } catch (e) {
      console.log('[UPSERT TICKET]', e);
      if (Object(e) instanceof ActionError) {
        throw e;
      }
      throw new ActionError('Oops. An error occurred while updating record.');
    }
  }
);

export const deleteTicketAction = protectServerAction(
  TicketSchema.pick({ id: true, laneId: true }).required({
    id: true,
    laneId: true,
  }),
  async (formData, user) => {
    try {
      const deletedTicket = await db.transaction(async () => {
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

        const accessLanes = db.$with('access_lanes').as(
          db.select().from(laneTable).where(sql`${laneTable.pipelineId} in 
                (select ${pipelineTable.id} from ${pipelineTable}
                where ${pipelineTable.subAccountId} in (
                    select ${permittedSubaccounts.id} from ${permittedSubaccounts}
                  )
                ) and ${laneTable.id} = ${formData.laneId}
            `)
        );

        const [deletedTicket] = await db
          .with(permittedSubaccounts, accessLanes)
          .delete(ticketTable)

          .where(
            sql`${ticketTable.id} = ${formData.id} and ${ticketTable.laneId} in (
          select ${accessLanes.id} from ${accessLanes}
        )`
          )
          .returning();

        record: if (deletedTicket) {
          const ticketPipelineSubaccountId = (
            await db
              .select({ ...getTableColumns(subaccountTable) })
              .from(subaccountTable)
              .innerJoin(
                pipelineTable,
                eq(subaccountTable.id, pipelineTable.subAccountId)
              )
              .innerJoin(laneTable, eq(laneTable.pipelineId, pipelineTable.id))
              .where(sql`${laneTable.id} =  ${deletedTicket.laneId}`)
          ).at(0)?.id;

          if (!ticketPipelineSubaccountId) {
            break record;
          }

          await createActivityLogNotification({
            subaccountId: ticketPipelineSubaccountId,
            description: `Deleted Ticket | ${deletedTicket.name}`,
          });
        }

        return deletedTicket;
      });

      if (!deletedTicket) {
        throw new ActionError('Ticket not found');
      }

      return { data: deletedTicket };
    } catch (e) {
      console.log('[DELETE TICKET]', e);
      if (Object(e) instanceof ActionError) {
        throw e;
      }
      throw new ActionError('Oops. An error occurred while updating record.');
    }
  }
);
