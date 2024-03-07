'use server';

import { TypeOf, union, z } from 'zod';
import { CreateAgencyFormSchema } from './create-agency';
import { serverAction } from '@/lib/server-action';
import { db } from '@/lib/db';
import { AgencyTable, agencyTable, agencySidebarOptionTable } from '@/schema';
import { eq, sql } from 'drizzle-orm';
import { getUserDetails, updateUser } from '@/lib/queries';
import { createStripeCustomer } from '@/lib/create-stripe-customer';

export const upsertAgencySchema = z.union([
  z.object({
    type: z.enum(['update']),
    data: CreateAgencyFormSchema.partial({
      name: true,
      address: true,
      agencyLogo: true,
      city: true,
      companyPhone: true,
      state: true,
      country: true,
      zipCode: true,
      goal: true,
      customerId: true,
      whiteLabel: true,
      connectedAccountId: true,
    }),
  }),

  z.object({ type: z.enum(['create']), data: CreateAgencyFormSchema }),
]);

export type UpsertAgencyInput = TypeOf<typeof upsertAgencySchema>;
export const upsertAgencyAction = serverAction(
  upsertAgencySchema,
  async (formData) => {
    try {
      const taskCreateRequest =
        formData.type === 'create' && !('agencyId' in formData);
      const userDetails = await getUserDetails();
      let customerId: string;

      if (taskCreateRequest || !userDetails?.agency?.customerId) {
        const { data } = formData as { data: AgencyTable };

        const { data: payload } = await createStripeCustomer({
          email: data.companyEmail,
          name: data.name,
          shipping: {
            address: {
              city: data.city,
              country: data.country,
              line1: data.address,
              postal_code: data.zipCode,
              state: data.zipCode,
            },
            name: data.name,
          },
          address: {
            city: data.city,
            country: data.country,
            line1: data.address,
            postal_code: data.zipCode,
            state: data.zipCode,
          },
        });

        if (!payload?.customerId) {
          throw new Error('An error occurred while creating agency account');
        }

        customerId = payload.customerId;
      }

      if (!userDetails) throw new Error('Unauthorized');
      const updatedAgency = await db.transaction(async () => {
        const [updatedAgency] = await db
          .insert(agencyTable)
          .values({
            ...(formData.data as AgencyTable),
            ...(customerId && { customerId }),
          })
          .onConflictDoUpdate({
            target: agencyTable.companyEmail,
            set: formData.data,
            where: sql`${agencyTable.id} = ${userDetails.agencyId}`,
          })
          .returning();

        const sidebarOptions = [
          {
            name: 'Dashboard',
            icon: 'category',
            link: `/agency/${updatedAgency.id}`,
          },
          {
            name: 'Launchpad',
            icon: 'clipboardIcon',
            link: `/agency/${updatedAgency.id}/launchpad`,
          },
          {
            name: 'Billing',
            icon: 'payment',
            link: `/agency/${updatedAgency.id}/billing`,
          },
          {
            name: 'Settings',
            icon: 'settings',
            link: `/agency/${updatedAgency.id}/settings`,
          },
          {
            name: 'Sub Accounts',
            icon: 'person',
            link: `/agency/${updatedAgency.id}/all-subaccounts`,
          },
          {
            name: 'Team',
            icon: 'shield',
            link: `/agency/${updatedAgency.id}/team`,
          },
        ] as const;

        if (taskCreateRequest) {
          await db
            .insert(agencySidebarOptionTable)
            .values(
              sidebarOptions.map((option) => ({
                ...option,
                agencyId: updatedAgency.id,
              }))
            )
            .onConflictDoNothing();
        }

        if (taskCreateRequest) {
          await updateUser({
            role: 'agency-owner',
            agencyId: updatedAgency.id,
          });
        }

        return updatedAgency;
      });

      return { type: formData.type, data: updatedAgency };
    } catch (e) {
      console.log(e);
      throw new Error(
        `An error occurred while ${
          formData.type === 'create' ? 'creating' : 'updating'
        } agency`,
        { cause: e }
      );
    }
  }
);
