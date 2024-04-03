'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TicketWithTags } from '@/types';
import { useModal } from '@/providers/modal-provider';
import { Contact, Tag, User } from '@/schema';
import { getSubaccountTeamMembers, searchContacts } from '@/lib/queries';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { TicketFormType, TicketSchema } from '@/actions/ticket/input';
import { useAction } from 'next-safe-action/hooks';
import { upsertTicketAction } from '@/actions/ticket/handler';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../ui/use-toast';

type TicketFormProps = {
  laneId: string;
  subaccountId: string;
  getNewTicket: (ticket: TicketWithTags[number]) => void;
};

export const TicketForm = ({
  laneId,
  subaccountId,
  getNewTicket,
}: TicketFormProps) => {
  const { data: defaultData, setClose } = useModal();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [contact, setContact] = useState('');
  const [search, setSearch] = useState('');
  const [contactList, setContactList] = useState<Contact[]>([]);
  const [assignedTo, setAssignedTo] = useState(
    defaultData?.ticket?.assignedUserId ?? ''
  );

  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const { toast } = useToast();
  const { execute: upsertTicket, status } = useAction(upsertTicketAction, {
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Saved details',
      });
    },
    onError: () => {
      toast({
        title: 'Ooppse!',
        description: 'Could not save pipeline details',
        variant: 'destructive',
      });
    },
  });

  const form = useForm<TicketFormType>({
    resolver: zodResolver(TicketSchema),
    disabled: status === 'executing',
    defaultValues: {
      ...(defaultData?.ticket ?? {
        name: '',
        description: '',
        value: String(defaultData?.ticket?.value ?? 0),
      }),
    },
  });

  const updateTicketSubmitting =
    form.formState.isSubmitted || status === 'executing';

  const onSubmitUpdateTicket = () => {};

  useEffect(() => {
    if (subaccountId) {
      const fetchData = async () => {
        const response = await getSubaccountTeamMembers(subaccountId);

        if (response) {
          setTeamMembers(response);
        }
      };

      fetchData();
    }
  }, [subaccountId]);

  useEffect(() => {
    const ticket = defaultData?.ticket;
    if (ticket) {
      if (ticket.customerId) {
        setContact(ticket.customerId);
      }

      const fetchData = async () => {
        if (ticket.customers?.name) {
          const response = await searchContacts(ticket.customers.name);
          setContactList(response);
        }
      };

      fetchData();
    }
  }, [defaultData]);

  return <div>TicketForm</div>;
};
