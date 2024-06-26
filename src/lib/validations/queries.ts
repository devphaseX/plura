import { plan } from '@/schema';
import { object, string, TypeOf, z } from 'zod';

export const AgencyPageQueriesSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  plan: z.enum(plan.enumValues).optional(),
});

export type AgencyPageQueries = TypeOf<typeof AgencyPageQueriesSchema>;

export const AgencyPageParamsSchema = z.object({ agencyId: z.string().uuid() });
export type AgencyPageParams = TypeOf<typeof AgencyPageParamsSchema>;

export const SubaccountParamsSchema = object({ subaccountId: string().uuid() });
export type SubaccountParams = TypeOf<typeof SubaccountParamsSchema>;

export const SubaccountPageQueries = AgencyPageQueriesSchema.omit({
  plan: true,
});

export type SubaccountQueries = TypeOf<typeof SubaccountPageQueries>;

export const PipelineParamsSchema = SubaccountParamsSchema;
export const PipelineWithIdParamsSchema = PipelineParamsSchema.extend({
  pipelineId: string().uuid(),
});

export type PipelineWithIdParams = TypeOf<typeof PipelineWithIdParamsSchema>;
