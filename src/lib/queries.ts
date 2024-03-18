'use server';

import { clerkClient, currentUser } from '@clerk/nextjs';
import { db } from './db';
import { eq, getTableColumns, or, sql } from 'drizzle-orm';
import {
  User,
  agencyTable,
  invitationTable,
  notificationTable,
  subaccountTable,
  userTable,
} from '@/schema';
import { redirect } from 'next/navigation';
import { alias } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { cache } from 'react';

export const getUserDetails = cache(async (userId?: string) => {
  if (!userId) {
    const user = await currentUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    userId = user.emailAddresses[0].emailAddress;
  }

  const uuidType = z.string().uuid();
  const userData = await db.query.userTable.findFirst({
    where: or(
      uuidType.safeParse(userId).success
        ? eq(userTable.userId, userId)
        : undefined,
      eq(userTable.email, userId),
      uuidType.safeParse(userId).success ? eq(userTable.id, userId) : undefined
    ),
    with: {
      agency: {
        with: {
          agencySidebarOptionTable: true,
          subaccounts: {
            with: {
              sidebarOptions: true,
            },
          },
        },
      },
      permissions: true,
    },
  });

  return userData;
});

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect('/sign-in');

  const accountInvite = alias(invitationTable, 'account_invite');

  const [invite] = await db
    .select({
      ...getTableColumns(accountInvite),
      alreadyJoined: sql<boolean>`case
                                    when ${userTable.userId} is not null 
                                    then ${accountInvite.agencyId} = ${userTable.agencyId} or 
                                    exists (
                                            select * from ${subaccountTable}
                                            where ${accountInvite.agencyId} = ${subaccountTable.agencyId}
                                            )
                                    else false
                                  end
                                `,
    })
    .from(accountInvite)
    .leftJoin(userTable, eq(userTable.agencyId, accountInvite.agencyId))
    .innerJoin(agencyTable, eq(agencyTable.id, accountInvite.agencyId))
    .where(
      sql`${accountInvite.status} = 'pending'
      and ${accountInvite.email} = ${user.emailAddresses[0].emailAddress}`
    );

  if (invite) {
    if (invite.alreadyJoined) {
      await db.delete(invitationTable).where(eq(invitationTable.id, invite.id));
    } else {
      await db.transaction(async () => {
        const joinedUser = await createTeamUser({
          agencyId: invite.agencyId,
          user: {
            email: invite.email,
            userId: user.id,
            agencyId: invite.agencyId,
            name: `${user.firstName} ${user.lastName}`,
            avatarUrl: user.imageUrl,
          },
        });
        await createActivityLogNotification({
          agencyId: invite.agencyId,
          description: 'Joined',
        });
        if (joinedUser) {
          await clerkClient.users.updateUserMetadata(user.id, {
            privateMetadata: {
              role: joinedUser?.role ?? 'subaccount-user',
            },
          });
          await db
            .delete(invitationTable)
            .where(eq(invitationTable.id, invite.id));
          return joinedUser.agencyId;
        }
        return null;
      });
    }
  }
  const [registeredUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, user.emailAddresses[0].emailAddress));

  return registeredUser?.agencyId ?? null;
};

type NewCreateUserFormData = Omit<
  User,
  'id' | 'createdAt' | 'updatedAt' | 'role'
> &
  Pick<Partial<User>, 'role'>;

type CreateTeamUserOption = {
  agencyId: string;
  user: NewCreateUserFormData;
};

export const createTeamUser = async ({
  agencyId,
  user,
}: CreateTeamUserOption) => {
  if (user.role === 'agency-owner') return null;
  const [newlyAddedUser] = await db
    .insert(userTable)
    .values({ ...user, agencyId: user.agencyId ?? agencyId })
    .returning();
  return newlyAddedUser;
};

type ActivityLogWithAgencyId = { agencyId: string; subaccountId?: never };
type ActivityLogWithSubaccountId = { subaccountId: string; agencyId?: never };

type CreateActivityLogNotificationOption = {
  description: string;
} & (ActivityLogWithAgencyId | ActivityLogWithSubaccountId);

export const createActivityLogNotification = async (
  option: CreateActivityLogNotificationOption
) => {
  const user = await currentUser();

  const [logByUser] = await db.select().from(userTable).where(sql`
      ${userTable.id} = (
        (select ${userTable.id} from ${subaccountTable}
        inner join ${agencyTable} on ${agencyTable.id} = ${
    subaccountTable.agencyId
  }
        inner join ${userTable} on ${userTable.agencyId} = ${agencyTable.id}
        where ${subaccountTable.id} = ${option.subaccountId ?? null}
        limit 1
        )
        union
        (
          select ${userTable.id} from ${userTable} 
          where ${user?.emailAddresses[0].emailAddress ?? null} = ${
    userTable.email
  }
        )
      )
  `);

  if (!logByUser) {
    console.error('Could not find user');
    return;
  }

  let userAssociatedAgencyId = option.agencyId;

  if (!(option.subaccountId || option.agencyId)) {
    throw new TypeError(
      'You need to provide as least an agencyId or subaccountId'
    );
  }

  if (!userAssociatedAgencyId) {
    const [userSubaccountRecord] = await db
      .select()
      .from(subaccountTable)
      .where(eq(subaccountTable.id, option.subaccountId as string));

    if (!userSubaccountRecord) return;

    userAssociatedAgencyId = userSubaccountRecord.agencyId;
  }

  await db.insert(notificationTable).values({
    message: `${logByUser.name} | ${option.description}`,
    userId: logByUser.id,
    agencyId: userAssociatedAgencyId,
    ...(option.subaccountId && { subaccountId: option.subaccountId }),
  });
};

export const initUser = async (
  userFormData: Partial<User> & { firstName?: string; lastName?: string }
) => {
  const user = await currentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  let {
    firstName = user.firstName,
    lastName = user.lastName,
    role,
    avatarUrl,
  } = userFormData;

  try {
    const [updatedUser] = await db
      .insert(userTable)
      .values({
        email: user.emailAddresses[0].emailAddress as string,
        name: `${firstName} ${lastName}`,
        userId: user.id,
        role: role ?? 'subaccount-user',
        avatarUrl: avatarUrl ?? user.imageUrl,
        agencyId: userFormData.agencyId ?? null,
      })
      .onConflictDoUpdate({
        target: userTable.email,
        set: {
          name: sql<string>`coalesce(${
            firstName && lastName ? `${firstName} ${lastName}` : null
          }, ${userTable.name})`,
          role: sql<string>`coalesce(${role ?? null}, ${userTable.role})`,
          avatarUrl,
          agencyId:
            'agencyId' in userFormData
              ? userFormData.agencyId
              : sql<string>`${userTable.agencyId}`,
        },
        where: eq(userTable.email, user.emailAddresses[0].emailAddress),
      });
    return updatedUser;
  } catch (e) {
    console.error(e);
    throw new Error('An error occurred while updating user record');
  }
};

export const updateUser = async (
  updateUserForm: Partial<Omit<User, 'email'>> & { email: string }
) => {
  const [updateUser] = await db
    .update(userTable)
    .set(updateUserForm)
    .where(eq(userTable.email, updateUserForm.email))
    .returning();

  if (!updateUser) {
    throw new Error('User not found');
  }

  await clerkClient.users.updateUserMetadata(updateUser.userId, {
    privateMetadata: {
      role: updateUser.role ?? 'subaccount-user',
    },
  });

  return updateUser;
};

export const getNotificationWithUser = (agencyId: string) => {
  try {
    return db.query.notificationTable.findMany({
      with: {
        user: true,
      },
      where: eq(notificationTable.agencyId, agencyId),
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const getUserPermissions = (userId: string) => {
  return db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
    with: {
      permissions: {
        with: { subaccount: true },
      },
    },
  });
};

export const getSubaccountDetails = async (subaccountId: string) => {
  const response = await db.query.subaccountTable.findFirst({
    where: eq(subaccountTable.id, subaccountId),
  });
  return response;
};
