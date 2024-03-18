'use client';

import { removeSubaccountAction } from '@/actions/subaccount/delete-subaccount/handler';
import { useToast } from '@/components/ui/use-toast';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import React from 'react';

type DeleteButtonProps = {
  subaccountId: string;
};

export const DeleteButton = ({ subaccountId }: DeleteButtonProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { execute: removeSubaccount, status } = useAction(
    removeSubaccountAction,
    {
      onSuccess: ({ data }) => {
        toast({
          title: 'Subaccount',
          description: `Deleted a subaccount | ${data.name}`,
        });
        router.refresh();
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
    <div
      onClick={() =>
        status !== 'executing' && removeSubaccount({ id: subaccountId })
      }
    >
      Delete Sub Account
    </div>
  );
};
