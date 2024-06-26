'use server';
import { protectServerAction, serverAction } from '@/lib/server-action';
import { UserSchema } from './input';
import { clerkClient, currentUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { userTable } from '@/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import {
  createActivityLogNotification,
  getUserDetails,
  updateUser,
} from '@/lib/queries';

export const initUser = serverAction(
  UserSchema.partial({ firstName: true, lastName: true, userId: true }),
  async (userFormData) => {
    const user = await currentUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    let {
      name = `${user.firstName} ${user.lastName}`,
      role,
      avatarUrl,
    } = userFormData;

    try {
      const [updatedUser] = await db
        .insert(userTable)
        .values({
          email: user.emailAddresses[0].emailAddress as string,
          name,
          userId: user.id,
          role: role ?? 'subaccount-user',
          avatarUrl: avatarUrl ?? user.imageUrl,
          agencyId: userFormData.agencyId ?? null,
        })
        .onConflictDoUpdate({
          target: userTable.email,
          set: {
            name,
            role: sql<string>`coalesce(${role ?? null}, ${userTable.role})`,
            avatarUrl,
            agencyId:
              'agencyId' in userFormData
                ? userFormData.agencyId
                : sql<string>`${userTable.agencyId}`,
          },
          where: eq(userTable.email, user.emailAddresses[0].emailAddress),
        })
        .returning();

      return updatedUser;
    } catch (e) {
      console.error(e);
      throw new Error('An error occurred while updating user record');
    }
  }
);

export const updateUserAction = protectServerAction(
  UserSchema.omit({ userId: true }).required({ id: true }),
  async (updateUserForm, authUser) => {
    const updateUserDetails = await getUserDetails(updateUserForm.id);

    if (!authUser) {
      throw new Error('Auth account not fully initial');
    }

    if (authUser.agencyId !== updateUserDetails?.agencyId) {
      throw new Error('You are not permitted to perform this action');
    }

    if (!updateUserDetails) {
      throw new Error('User not found');
    }

    try {
      const updatedUser = await db.transaction(async () => {
        const { agencyId, ...excludeAgencyIdUpdateUserForm } = updateUserForm;

        const [updatedUser] = await db
          .update(userTable)
          .set({
            ...excludeAgencyIdUpdateUserForm,
            role: sql`
              case
                when ${userTable.role} = 'agency-owner' then ${userTable.role}
                else coalesce(${updateUserForm.role ?? null}, ${userTable.role})
              end
          `,
          })
          .where(
            sql`
          ${userTable.id} = ${updateUserDetails.id} and (
              ${authUser.id} = ${updateUserDetails.id} or ${authUser.id} in (
                 select ${userTable.id} from ${userTable}
                 where ${userTable.agencyId} = ${
              updateUserDetails.agencyId
            } and ${inArray(userTable.role, ['agency-admin', 'agency-owner'])}
              )
          )
          `
          )
          .returning();

        const [firstName, lastName] = updateUser.name.split(/\s+/);

        await Promise.all([
          updateUserDetails.name !== updatedUser.name &&
            clerkClient.users.updateUser(updatedUser.userId, {
              firstName,
              lastName,
            }),
          updateUserDetails.role !== updatedUser.role &&
            clerkClient.users.updateUserMetadata(updatedUser.userId, {
              privateMetadata: {
                role: updatedUser.role ?? 'subaccount-user',
              },
            }),
        ]);

        if (updateUserDetails.role !== updatedUser.role) {
          await clerkClient.users.updateUserMetadata(updatedUser.userId, {
            privateMetadata: {
              role: updatedUser.role ?? 'subaccount-user',
            },
          });
        }

        await Promise.all(
          updateUserDetails.permissions?.map((permission) =>
            createActivityLogNotification({
              description: `Updated ${authUser.name} information`,
              subaccountId: permission.subAccountId,
            })
          )
        );

        return updatedUser;
      });

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return {
        data: await getUserDetails(updatedUser.id),
      };
    } catch (e) {
      console.log('[UPDATE USER]', e);
      throw new Error('An error occurred while updating user info');
    }
  }
);
