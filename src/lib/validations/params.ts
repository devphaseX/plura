import { plan } from '@/schema';
import { TypeOf, z } from 'zod';

export const AgencyPageParams = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  plan: z.enum(plan.enumValues).optional(),
});

export type AgencyPageParams = TypeOf<typeof AgencyPageParams>;
