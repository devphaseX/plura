import { BlurPage } from '@/components/global/blur-page';
import MediaComponent from '@/components/media';
import { getMedia } from '@/lib/queries';
import {
  SubaccountParams,
  SubaccountParamsSchema,
} from '@/lib/validations/queries';
import { notFound } from 'next/navigation';

type MediaPageProp = {
  params: SubaccountParams;
};

const MediaPage = async ({ params }: MediaPageProp) => {
  {
    params = SubaccountParamsSchema.parse(params);
  }

  const data = await getMedia(params.subaccountId);

  if (!data) {
    return notFound();
  }

  return (
    <BlurPage>
      <MediaComponent data={data} subaccountId={data.id} />
    </BlurPage>
  );
};

export default MediaPage;
