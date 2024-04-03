import { TypeOf, z } from 'zod';
import { ticketTable } from '../../schema/index';
import { createInsertSchema } from 'drizzle-zod';

const currencyNumberRegex = /^\d+(\.\d{1,2})?$/;
export const TicketSchema = createInsertSchema(ticketTable, {
  order: z.number().positive(),
  name: z.string().min(3).max(64),
  laneId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  value: z
    .string()
    .refine((value) => currencyNumberRegex.test(value), {
      message: 'Value must be a valid price',
    }),
});

export type TicketFormType = TypeOf<typeof TicketSchema>;

export const UpdateTicketOrderSchema = TicketSchema.pick({
  id: true,
  laneId: true,
  order: true,
}).required({
  laneId: true,
});

export type UpdateTickerOrderSchemaType = TypeOf<
  typeof UpdateTicketOrderSchema
>;
