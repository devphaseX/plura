import { TypeOf, z } from 'zod';
import { laneTable } from './../../schema/index';
import { createInsertSchema } from 'drizzle-zod';

export const LaneFormSchema = createInsertSchema(laneTable, {
  order: z.number().positive().optional(),
  name: z.string().min(3).max(64),
  pipelineId: z.string().uuid().optional(),
});

export type LaneFormSchemaType = TypeOf<typeof LaneFormSchema>;
