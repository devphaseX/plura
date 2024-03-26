'use client';
import React from 'react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { Loader } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { sendInviteAction } from '@/actions/invitation/handler';
import { InvitationInput, InvitationSchema } from '@/actions/invitation/input';
import { useModal } from '@/providers/modal-provider';

const SendInvitation: React.FC = () => {
  const { toast } = useToast();
  const { setClose } = useModal();

  const form = useForm<InvitationInput>({
    resolver: zodResolver(InvitationSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: 'subaccount-user',
    },
  });

  const { execute: sendInvite, status: inviteSendStatus } = useAction(
    sendInviteAction,
    {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Created and sent invitation',
        });
        setClose();
      },

      onError: (result) => {
        if (result.serverError) {
          toast({
            variant: 'destructive',
            title: 'Oppse!',
            description: result.serverError,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Oppse!',
            description: 'Could not send invitation',
          });
        }
      },
    }
  );

  const sendingUserInvite =
    inviteSendStatus === 'executing' || form.formState.isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation</CardTitle>
        <CardDescription>
          An invitation will be sent to the user. Users who already have an
          invitation sent out to their email, will not receive another
          invitation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(sendInvite)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={sendingUserInvite}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={sendingUserInvite}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User role</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="agency-admin">Agency Admin</SelectItem>
                      <SelectItem value="subaccount-user">
                        Sub Account User
                      </SelectItem>
                      <SelectItem value="subaccount-guest">
                        Sub Account Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={sendingUserInvite} type="submit">
              {sendingUserInvite ? (
                <Loader className="animate-spin" />
              ) : (
                'Send Invitation'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SendInvitation;
