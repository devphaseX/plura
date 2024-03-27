import { ScrollArea } from '../ui/scroll-area';

type BlurPageProps = {
  children: React.ReactNode;
};

const BlurPage = ({ children }: BlurPageProps) => {
  return (
    <div
      className="h-full backdrop-blur-[35px] dark:bg-muted/40 bg-muted/60 dark:shadow-2xl pt-24 dark:shadow-black  mx-auto absolute top-0 right-0 left-0 botton-0 z-[11] bg-cover"
      id="blur-page"
    >
      <ScrollArea className="h-full">
        <div className="p-4 pt-0">{children}</div>
      </ScrollArea>
    </div>
  );
};

export { BlurPage };
