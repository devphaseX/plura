'use client';

import React, { useEffect, useState } from 'react';
import { LaneWithTicketTags } from '@/types';
import { Lane, Pipeline, Ticket } from '@/schema';
import { useModal } from '@/providers/modal-provider';
import { useRouter } from 'next/navigation';
import { DragDropContext } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { CustomModal } from '@/components/global/custom-modal';
import { LaneForm } from '@/components/forms/lane-form';
type Props = {
  lanes: LaneWithTicketTags[];
  activePipeline: Pipeline;
  subaccountId: string;
  pipelineDetails: Pipeline[];
};

export const PipelineView = ({ lanes, activePipeline }: Props) => {
  const { setOpen } = useModal();
  const router = useRouter();
  const [ownedLanes, setOwnedLanes] = useState(lanes);

  useEffect(() => {
    setOwnedLanes(lanes);
  }, [lanes]);

  const onClickOpenAddLaneModal = () => {
    setOpen(
      <CustomModal
        title="Create A Lane"
        subheading="Lanes allow you to group tickets"
      >
        <LaneForm pipelineId={activePipeline.id} />
      </CustomModal>
    );
  };

  return (
    <DragDropContext onDragEnd={() => {}}>
      <div className="bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">{activePipeline.name}</h1>
          <Button onClick={onClickOpenAddLaneModal}>Add</Button>
        </div>
      </div>
    </DragDropContext>
  );
};
