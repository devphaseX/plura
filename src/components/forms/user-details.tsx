'use client';

import { Permission, Subaccount } from '@/schema';
import { useEffect, useState } from 'react';
import { AuthUserWithAgencySidebarOptionsSubAccounts } from '../../types';
import { useModal } from '@/providers/modal-provider';
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { UserInput, UserSchema } from '@/actions/user/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction, useOptimisticAction } from 'next-safe-action/hooks';
import { updatePermissionAction } from '@/actions/permission/handler';
import { updateUserAction } from '@/actions/user/handler';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Loader } from 'lucide-react';
import { FileUpload } from '../global/file-upload';
type UserDetailsProps = {
  id: string;
  type: 'agency' | 'subaccount';
  subaccounts?: Array<Subaccount>;
  userDetails?: AuthUserWithAgencySidebarOptionsSubAccounts;
  permissions?: Permission[];
};

const UserDetails = ({ userDetails, type, subaccounts }: UserDetailsProps) => {
  const { data, setClose } = useModal();
  const [subaccountPermissions, setSubaccountPermission] = useState<
    Permission[]
  >(data?.user?.permissions ?? []);
  const [authUserData, setAuthUserData] =
    useState<AuthUserWithAgencySidebarOptionsSubAccounts | null>(
      userDetails ?? null
    );

  const [roleState, setRoleState] = useState('');

  const { toast } = useToast();
  const router = useRouter();

  const {
    optimisticData,
    status: updatePermissionStatus,
    execute: updatePermission,
  } = useOptimisticAction(
    updatePermissionAction,
    { data: subaccountPermissions },
    (state, current) => {
      const accessMap: Record<string, Permission | null> = Object.fromEntries(
        state?.data?.map((p) => [p.subAccountId, p])
      );

      accessMap[current.subAccountId as string] = current.access
        ? (current as Permission)
        : null;

      return {
        data: Object.values(accessMap).filter(
          (p): p is Permission => p !== null
        ),
      };
    },
    {
      onSuccess: ({ data }) => {
        router.refresh();
        setSubaccountPermission(data);
        toast({ title: 'Success', description: 'permission updated' });
      },

      onError: () => {
        toast({
          variant: 'destructive',
          title: 'Failed',
          description: 'Could not update permissions',
        });
      },
    }
  );

  useEffect(() => {
    if (data?.authUser) {
      setAuthUserData(data.authUser);
      setSubaccountPermission(data?.user?.permissions ?? []);
    }
  }, [data?.user, data?.authUser]);

  useEffect(() => {
    if (userDetails) {
      setAuthUserData(userDetails);
    }
  }, [userDetails]);

  const loadingPermissions = updatePermissionStatus === 'executing';

  const form = useForm<UserInput>({
    resolver: zodResolver(UserSchema),
    mode: 'onChange',
    defaultValues: data?.user ?? userDetails,
  });

  useEffect(() => {
    if (data?.user) {
      form.reset(data.user);
    }
  }, [data]);

  const { execute: updateUser, status: updateUserInfoStatus } = useAction(
    updateUserAction,
    {
      onSuccess: ({ data }) => {
        form.reset(data);
        toast({
          title: 'Success',
          description: 'Update User Information',
        });
        setClose();
        router.refresh();
      },

      onError: () => {
        toast({
          variant: 'destructive',
          title: 'Oppse!',
          description: 'Could not update user information',
        });
      },
    }
  );

  const onSubmit = form.handleSubmit((formData) =>
    updateUser({
      ...formData,
      id: (data?.user?.id ?? userDetails?.id) as string,
    })
  );

  const onToggleUpdatePermission = async (
    subAccountId: string,
    val: boolean
  ) => {
    if (!data?.user?.email) return;

    if (data.user.role === 'agency-owner') return;

    await updatePermission({
      email: data.user.email,
      subAccountId,
      access: val,
      type,
    });
  };

  const submittingUserInfo =
    form.formState.isSubmitting || updateUserInfoStatus === 'executing';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Add or update your information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              disabled={submittingUserInfo}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value ?? undefined}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={submittingUserInfo}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User full name</FormLabel>
                  <FormControl>
                    <Input required placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={submittingUserInfo}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={
                        userDetails?.role === 'agency-owner' ||
                        submittingUserInfo
                      }
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={submittingUserInfo}
              control={form.control}
              name="role"
              render={({ field }) => {
                return (
                  <FormItem className="flex-1">
                    <FormLabel> User Role</FormLabel>
                    <Select
                      disabled={field.value === 'agency-owner'}
                      onValueChange={(value) => {
                        if (
                          value === 'subaccount-user' ||
                          value === 'subaccount-guest'
                        ) {
                          setRoleState(
                            'You need to have subaccounts to assign Subaccount access to team members.'
                          );
                        } else {
                          setRoleState('');
                        }
                        field.onChange(value);
                      }}
                      value={field.value ?? data?.user?.role}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user role..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="agency-admin">
                          Agency Admin
                        </SelectItem>
                        {(data?.user?.role === 'agency-owner' ||
                          userDetails?.role === 'agency-owner') && (
                          <SelectItem value="agency-owner">
                            Agency Owner
                          </SelectItem>
                        )}
                        <SelectItem value="subaccount-user">
                          Sub Account User
                        </SelectItem>
                        <SelectItem value="subaccount-guest">
                          Sub Account Guest
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground">{roleState}</p>
                  </FormItem>
                );
              }}
            />

            <Button disabled={submittingUserInfo} type="submit">
              {submittingUserInfo ? (
                <Loader className="animate-spin" />
              ) : (
                'Save User Details'
              )}
            </Button>
            {(authUserData?.role === 'agency-owner' ||
              authUserData?.role === 'agency-admin') && (
              <div>
                <Separator className="my-4" />
                <FormLabel> User Permissions</FormLabel>
                <FormDescription className="mb-4">
                  You can give Sub Account access to team member by turning on
                  access control for each Sub Account. This is only visible to
                  agency owners
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {subaccounts?.map((subaccount) => {
                    const subAccountPermissionsDetails = (
                      userDetails?.permissions ?? optimisticData.data
                    )?.find((p) => p.subAccountId === subaccount.id);

                    return (
                      <div
                        key={subaccount.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p>{subaccount.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={
                            subAccountPermissionsDetails?.access ?? false
                          }
                          onCheckedChange={(permission) => {
                            onToggleUpdatePermission(subaccount.id, permission);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export { UserDetails };
