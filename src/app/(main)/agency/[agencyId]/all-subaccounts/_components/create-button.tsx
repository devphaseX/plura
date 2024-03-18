'use client';

import { SubaccountDetails } from '@/components/forms/subaccount-details';
import { CustomModal } from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';
import { getUserDetails } from '@/lib/queries';
import { useModal } from '@/providers/modal-provider';
import { PlusCircle } from 'lucide-react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  user: NonNullable<Awaited<ReturnType<typeof getUserDetails>>>;
  className?: string;
};

export const CreateSubaccountButton = ({ user, className }: Props) => {
  const { setOpen } = useModal();

  if (!user.agency) return;

  return (
    <Button
      className={twMerge('w-full flex gap-4', className)}
      onClick={() =>
        setOpen(
          <CustomModal
            title="Create a Subaccount"
            subheading="You can switch between your subaccounts"
          >
            <SubaccountDetails />
          </CustomModal>
        )
      }
    >
      <PlusCircle size={15} />
      Create Sub Account
    </Button>
  );
};
