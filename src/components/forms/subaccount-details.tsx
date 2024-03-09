'use client';

import { useForm } from 'react-hook-form';
import { useAction } from 'next-safe-action/hooks';
import React, { useEffect, useState } from 'react';
import { useToast } from '../ui/use-toast';
import { Agency, Subaccount } from '@/schema';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { ReloadIcon } from '@radix-ui/react-icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
} from '../ui/form';
import { FileUpload } from '../global/file-upload';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { CreateSubaccountDetailsFormData } from '@/lib/validations/payload';
import { upsertSubaccountAction } from '@/actions/subaccount/upsert-subaccount/handle';
import { useModal } from '@/providers/modal-provider';
import { CreateSubaccountSchema } from '@/actions/subaccount/upsert-subaccount/input';
type SubaccountDetailsProps = {
  data?: Partial<Subaccount>;
};

export const SubaccountDetails = ({ data }: SubaccountDetailsProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { setClose } = useModal();

  const form = useForm<CreateSubaccountDetailsFormData>({
    mode: 'onChange',
    resolver: zodResolver(CreateSubaccountSchema),
    defaultValues: {
      ...data,
    },
  });

  const { execute: upsertSubaccount, status: upsertSubaccountStatus } =
    useAction(upsertSubaccountAction, {
      onSuccess: ({}) => {
        toast({
          title: 'Subaccount details saved',
          description: `Successfully saved your subaccount details.`,
        });
        setClose();
        router.refresh();
      },
      onError: ({ serverError }) => {
        if (serverError) {
          toast({
            title: 'Subaccount Account',
            description: serverError,
            variant: 'destructive',
          });
        }
      },
    });

  const handleSubmit = form.handleSubmit((formData) => {
    upsertSubaccount({
      type: data ? 'update' : 'create',
      data: formData as Subaccount,
    });
  });

  const submittingSubaccountForm = upsertSubaccountStatus === 'executing';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data && mounted) {
      form.reset(data);
    }
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subaccount Information</CardTitle>
        <CardDescription>
          Lets create an subaccount for your business. You can edit subaccount
          settings later from the agency settings tab
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              disabled={submittingSubaccountForm}
              name="subAccountLogo"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subaccount Logo</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex md:flex-row  gap-4">
              <FormField
                disabled={submittingSubaccountForm}
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Subaccount Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Agency Name"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                disabled={submittingSubaccountForm}
                name="companyEmail"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Subaccount Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Agency Email"
                        {...field}
                        type="email"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex md:flex-row gap-4">
              <FormField
                disabled={submittingSubaccountForm}
                control={form.control}
                name="companyPhone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Subaccount Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Phone"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              disabled={submittingSubaccountForm}
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 st..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex md:flex-row gap-4">
              <FormField
                disabled={submittingSubaccountForm}
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={submittingSubaccountForm}
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={submittingSubaccountForm}
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Zipcpde</FormLabel>
                    <FormControl>
                      <Input placeholder="Zipcode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              disabled={submittingSubaccountForm}
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={submittingSubaccountForm}>
              {submittingSubaccountForm ? (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Save Account Information'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
