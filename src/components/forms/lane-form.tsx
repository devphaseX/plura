'use client';

import React, { useEffect } from 'react';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';
import { useModal } from '@/providers/modal-provider';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { LaneFormSchema, LaneFormSchemaType } from '@/actions/lane/input';
import { Lane } from '@/schema';
import { Loader } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { upsertLaneAction } from '@/actions/lane/handler';

type LaneFormProps = {
  pipelineId: string;
  editLaneDetails?: Lane;
};

export const LaneForm = ({ editLaneDetails, pipelineId }: LaneFormProps) => {
  const { setClose } = useModal();
  const router = useRouter();

  const { execute: upsertLane, status } = useAction(upsertLaneAction, {
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Saved pipeline details',
      });

      setClose();
      router.refresh();
    },

    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: 'Could not save pipeline details',
      });
    },
  });

  const form = useForm<LaneFormSchemaType>({
    mode: 'onChange',
    resolver: zodResolver(LaneFormSchema),
    disabled: status === 'executing',
    defaultValues: {
      ...editLaneDetails,
    },
  });

  useEffect(() => {
    if (editLaneDetails) {
      form.reset({
        ...editLaneDetails,
      });
    }
  }, [editLaneDetails]);

  const isLoading = form.formState.isLoading || status === 'executing';

  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Lane Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              upsertLane({ ...data, pipelineId })
            )}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lane Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Lane Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-20 mt-4" disabled={isLoading} type="submit">
              {isLoading ? <Loader className="animate-spin" /> : 'Save'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
