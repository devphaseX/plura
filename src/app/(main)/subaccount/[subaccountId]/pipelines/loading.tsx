import { Loader } from 'lucide-react';

const LoadingAgencyPage = () => {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <Loader size={40} className="animate-spin" />
    </div>
  );
};

export default LoadingAgencyPage;
