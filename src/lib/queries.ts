'use server';

import { clerkClient, currentUser } from '@clerk/nextjs';
import { db } from './db';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import {
  UserTable,
  agencyTable,
  invitationTable,
  notificationTable,
  subaccountTable,
  userTable,
} from '@/schema';
import { redirect } from 'next/navigation';

export const getUserDetails = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const userData = await db.query.userTable.findFirst({
    where: eq(userTable.email, user.emailAddresses[0].emailAddress),

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
};

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect('/sign-in');

  const [invite] = await db
    .select({
      ...getTableColumns(invitationTable),
      alreadyJoined: sql<boolean>`case
                                    when ${userTable.userId} is not null  then true
                                    else false
                                  end
                                `,
    })
    .from(invitationTable)
    .leftJoin(userTable, eq(userTable.agencyId, invitationTable.agencyId))
    .innerJoin(agencyTable, eq(agencyTable.id, invitationTable.agencyId))
    .where(
      sql`${invitationTable.status} = 'pending'
      and ${invitationTable.email} = ${user.emailAddresses[0].emailAddress}`
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
  const [agency] = await db
    .select({ ...getTableColumns(agencyTable) })
    .from(agencyTable)
    .innerJoin(userTable, eq(userTable.agencyId, agencyTable.id))
    .where(eq(userTable.email, user.emailAddresses[0].emailAddress));

  return agency?.id ?? null;
};

type NewCreateUserFormData = Omit<
  UserTable,
  'id' | 'createdAt' | 'updatedAt' | 'role'
> &
  Pick<Partial<UserTable>, 'role'>;

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

export const updateUser = async (
  userFormData: Partial<UserTable> & { firstName?: string; lastName?: string }
) => {
  const user = await currentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  let {
    firstName = user.firstName,
    lastName = user.lastName,
    role = (user as { role?: UserTable['role'] }).role ?? 'subaccount-user',
    avatarUrl,
  } = userFormData;

  try {
    const [updatedUser] = await db
      .insert(userTable)
      .values({
        email: user.emailAddresses[0].emailAddress as string,
        name: `${firstName} ${lastName}`,
        userId: user.id,
        role,
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
