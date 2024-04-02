import { BlurPage } from '@/components/global/blur-page';

type PipelineLayoutProps = {
  children: React.ReactNode;
};

const PipelineLayoutPage = ({ children }: PipelineLayoutProps) => {
  return <BlurPage>{children}</BlurPage>;
};

export default PipelineLayoutPage;
