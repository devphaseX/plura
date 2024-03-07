import {
  AgencyPageParams,
  AgencyPageParamsSchema,
} from '@/lib/validations/queries';
import { notFound, redirect } from 'next/navigation';

export default function AgencyPage({ params }: { params: AgencyPageParams }) {
  {
    const paramsResult = AgencyPageParamsSchema.safeParse(params);
    if (!paramsResult.success) {
      return notFound();
    }

    params = AgencyPageParamsSchema.parse(params);
  }

  return <div>{params.agencyId}</div>;
}
