import { useModal } from '@/providers/modal-provider';
import { Pipeline } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import {
  CreatePipelineFormData,
  PipelineSchema,
} from '@/actions/pipeline/input';
import { useAction } from 'next-safe-action/hooks';
import { upsertPipelineAction } from '@/actions/pipeline/handler';

type Props = {
  subaccountId: string;
  editPipeline?: Pipeline;
};

export const CreatePipelineForm = ({ subaccountId, editPipeline }: Props) => {
  const { setClose } = useModal();
  const router = useRouter();

  const { execute: upsertPipeline, status } = useAction(upsertPipelineAction, {
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

  const form = useForm<CreatePipelineFormData>({
    mode: 'onChange',
    resolver: zodResolver(PipelineSchema.partial({ subAccountId: true })),
    disabled: status === 'executing',
    defaultValues: {
      name: editPipeline?.name ?? '',
    },
  });

  useEffect(() => {
    if (editPipeline) {
      form.reset({
        name: editPipeline.name ?? '',
      });
    }
  }, [editPipeline]);

  const submittingForm = status === 'executing';

  const { toast } = useToast();

  const onSubmit = async (values: CreatePipelineFormData) => {
    upsertPipeline({
      ...editPipeline,
      ...values,
      subAccountId: subaccountId,
    });
  };

  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Pipeline Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={submittingForm}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pipeline Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-20 mt-4"
              disabled={submittingForm || form.formState.disabled}
              type="submit"
            >
              {submittingForm ? <Loader className="animate-spin" /> : 'Save'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
