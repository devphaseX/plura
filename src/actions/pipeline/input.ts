import { string, TypeOf } from 'zod';
import { pipelineTable } from './../../schema/index';
import { createInsertSchema } from 'drizzle-zod';

export const PipelineSchema = createInsertSchema(pipelineTable, {
  name: string().min(3).max(256),
});

export type CreatePipelineFormData = TypeOf<typeof PipelineSchema>;
