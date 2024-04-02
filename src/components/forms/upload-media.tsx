'use client';

import React from 'react';
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MediaUploadForm, MediaUploadFormSchema } from '@/actions/media/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { useAction } from 'next-safe-action/hooks';
import { createMediaAction } from '@/actions/media/handler';
import { Input } from '../ui/input';
import { FileUpload } from '../global/file-upload';
import { Button } from '../ui/button';
import { useModal } from '@/providers/modal-provider';
import { Loader2 } from 'lucide-react';

type Props = {
  subaccountId: string;
};

export const UploadMediaForm = ({ subaccountId }: Props) => {
  const { toast } = useToast();
  const router = useRouter();
  const { setClose } = useModal();

  const { execute: createMedia, status } = useAction(createMediaAction, {
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Uploaded media',
      });

      router.refresh();
      setClose();
    },

    onError: ({ serverError }) => {
      toast({
        title: 'Failed',
        description:
          serverError ?? 'An error occurred while uploading media file',
      });
    },
  });

  const form = useForm<MediaUploadForm>({
    resolver: zodResolver(MediaUploadFormSchema),
    mode: 'onSubmit',
    disabled: status === 'executing',
    defaultValues: {
      name: '',
      link: '',
      subaccountId,
    },
  });

  const onSubmitSaveMedia = form.handleSubmit(createMedia);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Media Information</CardTitle>
        <CardDescription>
          Please enter the details for your file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmitSaveMedia}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem className="flex-1">
                    <FormLabel>File Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your file name" {...field} />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => {
                return (
                  <FormItem className="flex-1">
                    <FormLabel>Media File</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="subaccountLogo"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
            <Button
              type="submit"
              className="mt-4"
              disabled={form.formState.disabled}
            >
              Upload Media{' '}
              {form.formState.disabled && <Loader2 className="animate-spin" />}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
