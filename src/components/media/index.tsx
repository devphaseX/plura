import { GetMediaFiles } from '@/types';
import { MediaUploadButton } from '@/components/media/upload-button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { MediaCard } from './media-card';
import { FolderSearch } from 'lucide-react';
type MediaComponentProps = {
  data: GetMediaFiles;
  subaccountId: string;
};

const MediaComponent = ({ data, subaccountId }: MediaComponentProps) => {
  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl">Media Bucket</h1>
        <MediaUploadButton subaccountId={subaccountId} />
      </div>
      <Command className="bg-transparent">
        <CommandInput placeholder="Search for file name ..." />
        <CommandList className="pb-40 max-h-full">
          <CommandGroup heading="Media files">
            <div className="flex flex-wrap gap-4 pt-4">
              {data.media.map((file) => (
                <CommandItem
                  key={file.id}
                  className="p-0  max-w-[300px] w-full rounded-lg !bg-transparent !font-medium !text-white"
                >
                  <MediaCard file={file} />
                </CommandItem>
              ))}
            </div>
          </CommandGroup>
          <CommandEmpty>
            {/* No Media Files */}
            <div className="flex items-center justify-center w-full flex-col">
              <FolderSearch
                size={200}
                className="dark:text-muted text-slate-300"
              />
              <p className="text-muted-foreground ">Empty! no files to show.</p>
            </div>
          </CommandEmpty>
        </CommandList>
      </Command>
    </div>
  );
};

export default MediaComponent;
