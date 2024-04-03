'use client';

import React, { useEffect, useState } from 'react';
import { LaneWithTicketTags } from '@/types';
import { Lane, Pipeline, Ticket } from '@/schema';
import { useModal } from '@/providers/modal-provider';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { CustomModal } from '@/components/global/custom-modal';
import { LaneForm } from '@/components/forms/lane-form';
import { Flag, Plus } from 'lucide-react';
import PipelineLane from './pipeline-lane';
type Props = {
  pipelineTickets: LaneWithTicketTags['tickets'];
  lanes: LaneWithTicketTags[];
  activePipeline: Pipeline;
  subaccountId: string;
  pipelineDetails: Pipeline[];
};

export const PipelineView = ({
  lanes,
  activePipeline,
  subaccountId,
  pipelineTickets,
}: Props) => {
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
          <Button
            onClick={onClickOpenAddLaneModal}
            className="flex items-center gap-4"
          >
            <Plus size={15} />
            Create Lane
          </Button>
        </div>
      </div>
      <Droppable
        droppableId="lanes"
        type="lane"
        direction="horizontal"
        key="lanes"
      >
        {(provided) => (
          <div
            className="flex items-center gap-x-2"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <div className="flex mt-4">
              {lanes.map((lane, index) => (
                <PipelineLane
                  laneDetails={lane}
                  index={index}
                  allTickets={pipelineTickets}
                  subaccountId={subaccountId}
                  pipelineId={activePipeline.id}
                  setAllTickets={() => {}}
                  tickets={lane.tickets}
                />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
      {lanes.length === 0 && (
        <div className="flex items-center justify-center w-full flex-col">
          <div className="opacity-100">
            <Flag
              width="100%"
              height="100%"
              className="text-muted-foreground"
            />
          </div>
        </div>
      )}
    </DragDropContext>
  );
};
