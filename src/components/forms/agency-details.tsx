'use client';

import { useForm } from 'react-hook-form';
import { useAction } from 'next-safe-action/hooks';
import React, { useEffect, useState } from 'react';
import { useToast } from '../ui/use-toast';
import { Agency } from '@/schema';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
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
} from '../ui/alert-dialog';
import { ReloadIcon } from '@radix-ui/react-icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { NumberInput } from '@tremor/react';

import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
  FormDescription,
} from '../ui/form';
import { FileUpload } from '../global/file-upload';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { createActivityLogNotification } from '@/lib/queries';
import { Button } from '../ui/button';
import { deleteAgencyAction } from '@/actions/agency/delete-agency';
import {
  CreateAgencyFormData,
  CreateAgencyFormSchema,
} from '@/actions/agency/upsert-agency/input';
import { upsertAgencyAction } from '@/actions/agency/upsert-agency/handler';
type AgencyDetailsProps = {
  data?: Partial<Agency>;
};

const AgencyDetails = ({ data }: AgencyDetailsProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const form = useForm<CreateAgencyFormData>({
    mode: 'onChange',
    resolver: zodResolver(CreateAgencyFormSchema),
    defaultValues: {
      ...data,
      whiteLabel: data?.whiteLabel ?? false,
    },
  });

  const { execute: upsertAgency, status: upsertAgencyStatus } = useAction(
    upsertAgencyAction,
    {
      onSuccess: ({ type }) => {
        toast({
          title: 'Agency Account',
          description: `Agency account ${
            type === 'update' ? 'updated' : 'created'
          } successfully`,
        });
        router.refresh();
      },
      onError: ({ serverError }) => {
        if (serverError) {
          toast({
            title: 'Agency Account',
            description: serverError,
            variant: 'destructive',
          });
        }
      },
    }
  );

  const { execute: deleteAgency, status: deleteAgencyStatus } = useAction(
    deleteAgencyAction,
    {
      onSuccess: ({}) => {
        toast({
          title: 'Deleted Agency',
          description: 'Delete your agency and all subaccounts',
        });
        router.refresh();
      },

      onError: (error) => {
        console.log(error);
        toast({
          title: 'Oops!',
          description: 'Could not delete your agency',
          variant: 'destructive',
        });
      },
    }
  );

  const handleSubmit = form.handleSubmit((formData) => {
    upsertAgency({ type: data?.id ? 'update' : 'create', data: formData });
  });

  const submittingAgencyForm = upsertAgencyStatus === 'executing';
  const deletingAgency = deleteAgencyStatus === 'executing';
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data && mounted) {
      form.reset(data);
    }
  }, [data]);

  console.log({ error: form.formState.errors });
  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
          <CardDescription>
            Lets create an agency for your business. You can edit agency
            settings later from the agency settings tab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                disabled={submittingAgencyForm}
                name="agencyLogo"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="agencyLogo"
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
                  disabled={submittingAgencyForm}
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Agency Name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  disabled={submittingAgencyForm}
                  name="companyEmail"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Email</FormLabel>
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
                  disabled={submittingAgencyForm}
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Phone Number</FormLabel>
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
                disabled={submittingAgencyForm}
                control={form.control}
                name="whiteLabel"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                      <div>
                        <FormLabel>Whitelabel Agency</FormLabel>
                        <FormDescription>
                          Turning on whilelabel mode will show your agency logo
                          to all sub accounts by default. You can overwrite this
                          functionality through sub account settings.
                        </FormDescription>
                      </div>

                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                disabled={submittingAgencyForm}
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
                  disabled={submittingAgencyForm}
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
                  disabled={submittingAgencyForm}
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
                  disabled={submittingAgencyForm}
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
                disabled={submittingAgencyForm}
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
              {data?.id && (
                <div className="flex flex-col gap-2">
                  <FormLabel>Create a Goal</FormLabel>
                  <FormDescription>
                    ✨ Create a goal for your agency. As your business grows
                    your goals grow too so dont forget to set the bar higher!
                  </FormDescription>
                  <NumberInput
                    disabled={submittingAgencyForm}
                    defaultValue={data.goal}
                    onValueChange={async (val) => {
                      if (!data?.id) return;
                      await upsertAgency({
                        type: 'update',
                        data: {
                          goal: Number(val),
                          companyEmail: data.companyEmail,
                        } as Agency,
                      });
                      await createActivityLogNotification({
                        agencyId: data.id,
                        description: `Updated the agency goal to | ${val} Subaccount`,
                      });

                      router.refresh();
                    }}
                    min={1}
                    className="bg-background !border !border-input"
                    placeholder="Sub Account Goal"
                  />
                </div>
              )}
              <Button type="submit" disabled={submittingAgencyForm}>
                {submittingAgencyForm ? (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Save Agency Information'
                )}
              </Button>
            </form>
          </Form>
          {data?.id && (
            <>
              <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
                <div>
                  <div>Danger Zone</div>
                </div>
                <div className="text-muted-foreground">
                  Deleting your agency cannot be undone. This will also delete
                  all sub accounts and all data related to your sub accounts.
                  Sub accounts will no longer have access to funnels, contacts
                  etc.
                </div>
              </div>
              <AlertDialogTrigger
                disabled={submittingAgencyForm || deletingAgency}
                className="text-red-600 p-2 text-center mt-2 rounded-md hover:bg-red-600 hover:text-white whitespace-nowrap"
              >
                {deletingAgency ? 'Deleting...' : 'Delete Agency'}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-left">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-left">
                    This action cannot be undone. This will permanently delete
                    the Agency account and all related sub accounts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex items-center">
                  <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deletingAgency}
                    className="bg-destructive hover:bg-destructive"
                    onClick={() =>
                      data.id && deleteAgency({ id: data.id as string })
                    }
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </>
          )}
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export { AgencyDetails };
