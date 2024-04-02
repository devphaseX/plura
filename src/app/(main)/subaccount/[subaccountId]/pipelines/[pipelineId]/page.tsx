import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  getLanesWithTicketTags,
  getSubaccountPipeline,
  getSubaccountPipelines,
} from '@/lib/queries';
import {
  PipelineWithIdParams,
  PipelineWithIdParamsSchema,
} from '@/lib/validations/queries';
import { redirect } from 'next/navigation';
import { PipelineInfoBar } from './_components/pipeline-info-bar';
import { PipelineSettings } from './_components/pipeline-settings';
import { PipelineView } from './_components/pipeline-view';
import { updateLaneOrderAction } from '@/actions/lane/handler';
import { updateTicketOrdersAction } from '@/actions/ticket/handler';

type PipelinePageProps = {
  params: PipelineWithIdParams;
};

const PipelinePage = async ({ params }: PipelinePageProps) => {
  {
    params = PipelineWithIdParamsSchema.parse(params);
  }

  const pipelineDetails = await getSubaccountPipeline(params.pipelineId);

  if (!pipelineDetails) {
    return redirect(`/subaccount/${params.subaccountId}/pipelines`);
  }

  const ownedPipelines = await getSubaccountPipelines(params.subaccountId);
  const lanes = await getLanesWithTicketTags(params.pipelineId);

  return (
    <Tabs defaultValue="view" className="w-full">
      <TabsList className="bg-transparent border-b-2 h-16 w-full justify-between mb-4">
        <PipelineInfoBar
          pipelines={ownedPipelines ?? []}
          selectedPipelineId={pipelineDetails.id}
          subaccountId={params.subaccountId}
        />
        <div>
          <TabsTrigger value="view">Pipeline View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="view">
        <PipelineView
          activePipeline={pipelineDetails}
          subaccountId={params.subaccountId}
          lanes={lanes ?? []}
          pipelineDetails={ownedPipelines ?? []}
        />
      </TabsContent>
      <TabsContent value="settings">
        <PipelineSettings
          pipelineId={pipelineDetails.id}
          pipelines={ownedPipelines ?? []}
          subaccountId={pipelineDetails.subAccountId}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PipelinePage;
