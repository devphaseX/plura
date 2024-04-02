'use client';

import React, { useState } from 'react';
import { Media } from '../../schema';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Copy, MoreHorizontal, Trash } from 'lucide-react';
import Image from 'next/image';
import { useAction } from 'next-safe-action/hooks';
import { deleteMediaAction } from '@/actions/media/handler';
import { useToast } from '../ui/use-toast';

type Props = {
  file: Media;
};

export const MediaCard = ({ file }: Props) => {
  const { execute: deleteMedia, status } = useAction(deleteMediaAction, {
    onSuccess: () => {
      toast({
        title: 'Deleted File',
        description: 'Successfully deleted the file',
      });
      router.refresh();
    },

    onError: ({ serverError }) => {
      toast({
        title: 'Delete File',
        description: serverError ?? 'An error occurred while deleting media ',
        variant: 'destructive',
      });
    },
  });
  const loading = status === 'executing';
  const router = useRouter();
  const { toast } = useToast();

  return (
    <AlertDialog>
      <DropdownMenu>
        <article className="border w-full rounded-lg bg-slate-900">
          <div className="relative w-full h-40">
            <Image
              src={file.link}
              alt="preview image"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <p className="opacity-0 h-0 w-0">{file.name}</p>
          <div className="p-4 relative">
            <p className="text-muted-foreground">
              {new Date(file.createdAt!).toDateString()}
            </p>
            <p>{file.name}</p>
            <div className="absolute top-4 right-4 p-[1px] cursor-pointer ">
              <DropdownMenuTrigger>
                <MoreHorizontal />
              </DropdownMenuTrigger>
            </div>
          </div>

          <DropdownMenuContent>
            <DropdownMenuLabel>Menu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex gap-2"
              onClick={() => {
                navigator.clipboard.writeText(file.link);
                toast({ title: 'Copied To Clipboard' });
              }}
            >
              <Copy size={15} /> Copy Image Link
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="flex gap-2">
                <Trash size={15} /> Delete File
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </article>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Are you sure you want to delete this file? All subaccount using this
            file will no longer have access to it!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive"
            onClick={() => deleteMedia({ id: file.id })}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
