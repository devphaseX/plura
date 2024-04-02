import { funnelTable } from './../../schema/index';
import { string, TypeOf } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

export const CreateFunnelSchema = createInsertSchema(funnelTable, {
  name: string().min(3).max(64),
  subdomainName: string().min(3).max(64).optional(),
  description: string().min(3),
  favicon: string().url().optional(),
});

export type CreatePipelineFormData = TypeOf<typeof CreateFunnelSchema>;
