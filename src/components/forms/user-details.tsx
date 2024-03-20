'use client';

import { Permission, Subaccount, User } from '@/schema';
import { useEffect, useState } from 'react';
import {
  AuthUserWithAgencySidebarOptionsSubAccounts,
  UserWithPermissionsAndSubAccounts,
} from '../../types';
import { useModal } from '@/providers/modal-provider';
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { getUserDetails, getUserPermissions } from '@/lib/queries';
import { useForm } from 'react-hook-form';
import { UserInput, UserSchema } from '@/actions/user/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
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
type UserDetailsProps = {
  id: string;
  type: 'agency' | 'subaccount';
  subaccounts?: Array<Subaccount>;
  userDetails?: Partial<User>;
  permissions?: Permission[];
};

const UserDetails = ({ userDetails, type, subaccounts }: UserDetailsProps) => {
  const [subaccountPermissions, setSubaccountPermission] =
    useState<UserWithPermissionsAndSubAccounts | null>(null);
  const { data, setClose } = useModal();
  const [authUserData, setAuthUserData] =
    useState<AuthUserWithAgencySidebarOptionsSubAccounts | null>();
  const [roleState, setRoleState] = useState('');

  const { toast } = useToast();
  const router = useRouter();

  const { execute: updatePermission, status: updatePermissionStatus } =
    useAction(updatePermissionAction, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'The request was successfull' });
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: 'Failed',
          description: 'Could not update permissions',
        });
      },
      onSettled: () => {
        router.refresh();
      },
    });

  useEffect(() => {
    if (data?.user) {
      const fetchDetails = async () => {
        const response = await getUserDetails();
        if (response) setAuthUserData(response);
      };

      fetchDetails();
    }
  }, [data]);

  const loadingPermissions = updatePermissionStatus === 'executing';

  const form = useForm<UserInput>({
    resolver: zodResolver(UserSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (data?.user) {
      form.reset(data.user);
    }

    if (userDetails) {
      form.reset(userDetails);
    }
  }, [userDetails, data]);

  const { execute: updateUser } = useAction(updateUserAction, {
    onSuccess: () => {
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
  });

  const onSubmit = form.handleSubmit((formData) =>
    updateUser({
      ...formData,
      id: (data?.user?.id ?? userDetails?.id) as string,
    })
  );

  useEffect(() => {
    if (!data?.user) return;
    const getPermission = async () => {
      const permissions = await getUserPermissions(data?.user?.id!);
      permissions && setSubaccountPermission(permissions);
    };

    getPermission();
  }, [data]);

  const onToggleUpdatePermission = async (
    subAccountId: string,
    val: boolean,
    permissionId: string | undefined
  ) => {
    if (!data?.user?.email) return;

    await updatePermission({
      email: data.user.email,
      subAccountId,
      access: val,
      type,
      id: permissionId,
    });
  };

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
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile picture</FormLabel>
                  <FormControl>
                    {/* <FileUpload
                      apiEndpoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    /> */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
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
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={
                        userDetails?.role === 'agency-owner' ||
                        form.formState.isSubmitting
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
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel> User Role</FormLabel>
                  <Select
                    disabled={field.value === 'agency-owner'}
                    onValueChange={(value) => {
                      if (
                        value === 'SUBACCOUNT_USER' ||
                        value === 'SUBACCOUNT_GUEST'
                      ) {
                        setRoleState(
                          'You need to have subaccounts to assign Subaccount access to team members.'
                        );
                      } else {
                        setRoleState('');
                      }
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMING">
                        Agency Admin
                      </SelectItem>
                      {(data?.user?.role === 'agency-owner' ||
                        userDetails?.role === 'agency-owner') && (
                        <SelectItem value="AGENCY_OWNER">
                          Agency Owner
                        </SelectItem>
                      )}
                      <SelectItem value="SUBACCOUNT_USER">
                        Sub Account User
                      </SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">
                        Sub Account Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground">{roleState}</p>
                </FormItem>
              )}
            />

            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loader /> : 'Save User Details'}
            </Button>
            {authUserData?.role === 'agency-owner' && (
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
                    const subAccountPermissionsDetails =
                      subaccountPermissions?.permissions?.find(
                        (p) => p.subAccountId === subaccount.id
                      );

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
                            onToggleUpdatePermission(
                              subaccount.id,
                              permission,
                              data?.user?.email as string
                            );
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
