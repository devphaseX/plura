'use server';

import { protectServerAction } from '@/lib/server-action';
import { InvitationSchema } from './input';
import { db } from '@/lib/db';
import { invitationTable, userTable } from '@/schema';
import { eq, sql } from 'drizzle-orm';
import { ActionError } from '@/lib/utils';
import { clerkClient } from '@clerk/nextjs';

export const sendInviteAction = protectServerAction(
  InvitationSchema,
  async (formData, authUser) => {
    try {
      if (
        !(
          (authUser.role === 'agency-admin' ||
            authUser.role === 'agency-owner') &&
          authUser.agencyId
        )
      ) {
        throw new ActionError("You don't have the necessary permission");
      }

      const [
        { user: inviteUser, invitation } = { user: null, invitation: null },
      ] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, formData.email))
        .fullJoin(
          invitationTable,
          sql`${invitationTable.email} = ${formData.email} or ${invitationTable.status} = 'pending'`
        );

      if (inviteUser?.agencyId === authUser.agencyId || invitation) {
        throw new ActionError('User already invited');
      }

      const invite = await db.transaction(async () => {
        const [invite] = await db.insert(invitationTable).values({
          email: formData.email,
          role: formData.role,
          agencyId: authUser.agencyId as string,
        });

        await clerkClient.invitations
          .createInvitation({
            emailAddress: formData.email,
            redirectUrl: process.env.NEXT_PUBLIC_URL,
            publicMetadata: {
              throughInvitation: true,
              role: formData.role,
            },
          })
          .catch(
            () => new ActionError('An error occurred while sending invite')
          );
        return invite;
      });

      return {
        data: invite,
      };
    } catch (e) {
      console.log('[INVITATION ACTION]', e);
      if (Object(e) && e instanceof ActionError) {
        throw e;
      }
      throw new Error('An error occurred while inviting user');
    }
  }
);
