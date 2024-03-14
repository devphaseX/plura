import { ScrollArea } from '../ui/scroll-area';

type BlurPageProps = {
  children: React.ReactNode;
};

const BlurPage = ({ children }: BlurPageProps) => {
  return (
    <ScrollArea className="h-screen">
      <div
        className="h-full backdrop-blur-[35px] dark:bg-muted/40 bg-muted/60 dark:shadow-2xl dark:shadow-black  mx-auto pt-24 p-4 absolute top-0 right-0 left-0 botton-0 z-[11]"
        id="blur-page"
      >
        {children}
      </div>
    </ScrollArea>
  );
};

export { BlurPage };
