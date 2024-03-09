'use server';

import { serverAction } from '@/lib/server-action';
import { db } from '@/lib/db';
import {
  Agency,
  agencyTable,
  agencySidebarOptionTable,
  subaccountTable,
} from '@/schema';
import { sql } from 'drizzle-orm';
import { getUserDetails, updateUser } from '@/lib/queries';
import { upsertAgencySchema } from './input';
import { createStripeCustomer } from '@/actions/stripe/handler';
import { clerkClient, currentUser } from '@clerk/nextjs';

export const upsertAgencyAction = serverAction(
  upsertAgencySchema,
  async (formData) => {
    try {
      const taskCreateRequest = formData.type === 'create';
      const authUser = await currentUser();
      let userDetails = await getUserDetails();
      let customerId: string;

      if (taskCreateRequest || !userDetails?.agency?.customerId) {
        const { data } = formData as { data: Agency };

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
        if (taskCreateRequest) {
          await updateUser({
            role: 'agency-owner',
          });
          userDetails = await getUserDetails();
        }
      }

      if (!(authUser && userDetails)) {
        throw new Error('Unauthorized');
      }

      const updatedAgency = await db.transaction(async () => {
        const [updatedAgency] = await db
          .insert(agencyTable)
          .values({
            ...(formData.data as Agency),
            ...(customerId && { customerId }),
          })
          .onConflictDoUpdate({
            target: agencyTable.companyEmail,
            set: formData.data,
            where: sql`${agencyTable.companyEmail} = ${formData.data.companyEmail}`,
          })
          .returning();

        if (!updatedAgency) {
          throw new Error('Agency not found');
        }

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

          await updateUser({
            agencyId: updatedAgency.id,
          });

          await clerkClient.users.updateUserMetadata(userDetails.userId, {
            privateMetadata: {
              role: 'agency-owner',
            },
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
