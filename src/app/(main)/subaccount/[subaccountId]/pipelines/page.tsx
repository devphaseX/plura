import { db } from '@/lib/db';
import { getSubaccountPipeline, getUserDetails } from '@/lib/queries';
import {
  SubaccountParams,
  SubaccountParamsSchema,
} from '@/lib/validations/queries';
import { pipelineTable } from '@/schema';
import { redirect } from 'next/navigation';

type PipelineRootPageProps = {
  params: SubaccountParams;
};

const PipelineRootPage = async ({ params }: PipelineRootPageProps) => {
  {
    params = SubaccountParamsSchema.parse(params);
  }

  const user = await getUserDetails();

  if (!user) {
    return redirect('/subaccount');
  }

  const defaultPipeline = ((await getSubaccountPipeline(params.subaccountId)) ??
    (
      await db
        .insert(pipelineTable)
        .values({ name: 'Lead cycle', subAccountId: params.subaccountId })
        .returning()
    ).at(0))!;

  return redirect(
    `/subaccount/${params.subaccountId}/pipelines/${defaultPipeline.id}`
  );
};

export default PipelineRootPage;
