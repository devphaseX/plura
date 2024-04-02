'use client';

import { removeSubaccountAction } from '@/actions/subaccount/delete-subaccount/handler';
import {
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';

type DeleteButtonProps = {
  subaccountId: string;
};

export const DeleteButton = ({ subaccountId }: DeleteButtonProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const { execute: removeSubaccount, status } = useAction(
    removeSubaccountAction,
    {
      onSuccess: ({ data }) => {
        toast({
          title: 'Subaccount',
          description: `Deleted a subaccount | ${data.name}`,
        });
        router.refresh();
        closeRef.current?.click();
      },

      onError: ({ serverError }) => {
        if (serverError) {
          toast({
            title: 'Subaccount',
            description: serverError,
            variant: 'destructive',
          });
        }
      },
    }
  );

  return (
    <>
      <AlertDialogAction
        className="bg-destructive hover:bg-destructive"
        disabled={status === 'executing'}
      >
        <div
          onClick={(event) => {
            event.stopPropagation();
            removeSubaccount({ id: subaccountId });
          }}
        >
          Delete Sub Account
        </div>
      </AlertDialogAction>

      <AlertDialogCancel className="hidden" ref={closeRef} />
    </>
  );
};
