import { FileIcon, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { UploadDropzone } from '@/lib/uploadthings';

type FileUploadProps = {
  apiEndpoint: 'agencyLogo' | 'avatar' | 'subaccountLogo';
  onChange: (url?: string) => void;
  value?: string;
};

export const FileUpload = ({
  apiEndpoint,
  onChange,
  value,
}: FileUploadProps) => {
  const type = value?.split('.').pop();
  if (value) {
    return (
      <div className="flex flex-col justify-center items-center">
        {type !== 'pdf' ? (
          <div className="relative h-40 w-40">
            <Image
              src={value}
              alt="uploaded image"
              className="object-contain"
              fill
            />
          </div>
        ) : (
          <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
            <FileIcon />
            <a
              href={value}
              target="_blank"
              rel="noopener_noreferrre"
              className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
            >
              View Pdf
            </a>
          </div>
        )}
        <Button variant="ghost" type="button" onClick={() => onChange('')}>
          <X className="h-4 w-4 mr-2" />
          Remove Logo
        </Button>
      </div>
    );
  }
  return (
    <div className="w-full bg-muted/30">
      <UploadDropzone
        endpoint={apiEndpoint}
        onClientUploadComplete={(res) => onChange(res?.[0].url)}
        onUploadError={(error) => {
          console.log(error);
        }}
      />
    </div>
  );
};
