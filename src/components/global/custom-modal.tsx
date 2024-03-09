import { useModal } from '@/providers/modal-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

type CustomModalProps = {
  title: string;
  subheading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const CustomModal = ({
  children,
  defaultOpen,
  subheading,
  title,
}: CustomModalProps) => {
  const { opened = false, setClose } = useModal();
  return (
    <Dialog open={opened || defaultOpen} onOpenChange={setClose}>
      <DialogContent className="p-0">
        <ScrollArea className="md:h-[700px] p-6">
          <DialogHeader className="pt-8 text-left">
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
            <DialogDescription>{subheading}</DialogDescription>
            {children}
          </DialogHeader>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export { CustomModal };
