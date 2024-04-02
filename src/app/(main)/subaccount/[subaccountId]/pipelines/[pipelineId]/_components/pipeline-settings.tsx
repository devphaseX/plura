'use client';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

import React from 'react';
import { Pipeline } from '@/schema';
import { CreatePipelineForm } from '@/components/forms/create-pipeline';
import { useAction } from 'next-safe-action/hooks';
import { deletePipelineAction } from '@/actions/pipeline/handler';

type Props = {
  pipelineId: string;
  subaccountId: string;
  pipelines: Pipeline[];
};

export const PipelineSettings = ({
  pipelineId,
  subaccountId,
  pipelines,
}: Props) => {
  const router = useRouter();
  const { execute: deletePipeline } = useAction(deletePipelineAction, {
    onSuccess: () => {
      toast({
        title: 'Deleted',
        description: 'Pipeline is deleted',
      });
      router.replace(`/subaccount/${subaccountId}/pipelines`);
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: 'Could Delete Pipeline',
      });
    },
  });

  return (
    <AlertDialog>
      <div>
        <div className="flex items-center justify-between mb-4">
          <AlertDialogTrigger asChild>
            <Button variant={'destructive'}>Delete Pipeline</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="items-center">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletePipeline({ id: pipelineId })}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </div>

        <CreatePipelineForm
          subaccountId={subaccountId}
          editPipeline={pipelines.find((p) => p.id === pipelineId)}
        />
      </div>
    </AlertDialog>
  );
};
