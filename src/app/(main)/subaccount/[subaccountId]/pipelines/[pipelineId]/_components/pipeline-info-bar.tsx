'use client';
import React, { useState } from 'react';
import { Pipeline } from '@/schema';
import { useModal } from '@/providers/modal-provider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CustomModal } from '@/components/global/custom-modal';
import { CreatePipelineForm } from '@/components/forms/create-pipeline';

type Props = {
  subaccountId: string;
  pipelines: Pipeline[];
  selectedPipelineId: string;
};

export const PipelineInfoBar = ({
  subaccountId,
  pipelines,
  selectedPipelineId,
}: Props) => {
  const { setOpen, setClose } = useModal();
  const [popoverOpened, setPopoverOpen] = useState(false);
  const [activePipelineId, setActivePipelineId] = useState(selectedPipelineId);

  const handleClickCreatePipeline = () => {
    setOpen(
      <CustomModal
        title="Create A Pipeline"
        subheading="Pipelines allows you to group tickets into lanes and track your business process all in one place"
      >
        <CreatePipelineForm subaccountId={subaccountId} />
      </CustomModal>
    );
  };
  return (
    <div>
      <div className="flex items-end gap-2">
        <Popover open={popoverOpened} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={popoverOpened}
              className="w-[200px] justify-between"
            >
              {activePipelineId
                ? pipelines.find((pipeline) => pipeline.id === activePipelineId)
                    ?.name
                : 'Select a pipeline...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandEmpty>No pipelines found.</CommandEmpty>
              <CommandGroup>
                {pipelines.map((pipeline) => (
                  <Link
                    key={pipeline.id}
                    href={`/subaccount/${subaccountId}/pipelines/${pipeline.id}`}
                  >
                    <CommandItem
                      key={pipeline.id}
                      value={pipeline.id}
                      onSelect={(currentValue) => {
                        setActivePipelineId(currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          activePipelineId === pipeline.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {pipeline.name}
                    </CommandItem>
                  </Link>
                ))}
                <Button
                  variant="secondary"
                  className="flex gap-2 w-full mt-4"
                  onClick={handleClickCreatePipeline}
                >
                  <Plus size={15} />
                  Create Pipeline
                </Button>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
