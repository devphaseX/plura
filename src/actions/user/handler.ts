import { serverAction } from '@/lib/server-action';
import { UserSchema } from './input';
import { auth, clerkClient, currentUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { userTable } from '@/schema';
import { eq, sql } from 'drizzle-orm';
import { createActivityLogNotification, getUserDetails } from '@/lib/queries';

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

export const updateUserAction = serverAction(
  UserSchema.omit({ userId: true, id: true }),
  async (updateUserForm) => {
    const authUser = await getUserDetails();
    if (!authUser) {
      throw new Error('User account not fully initiated');
    }
    const updatedUser = await db.transaction(async () => {
      const { agencyId, ...excludeAgencyIdUpdateUserForm } = updateUserForm;

      const allowedPermissions = authUser.permissions.filter(
        ({ email, access }) => authUser.email === email && access
      );

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
        .where(eq(userTable.userId, authUser.userId))
        .returning();

      if (authUser.role === 'subaccount-user') {
        await allowedPermissions.map((permission) => {
          if (!permission.access) return null;

          return createActivityLogNotification({
            subaccountId: permission.subAccountId,
            description: `Updated ${authUser.name} information`,
          });
        });
      }

      return updatedUser;
    });

    if (!updatedUser) {
      throw new Error('User not found');
    }

    try {
      await clerkClient.users.updateUserMetadata(updatedUser.userId, {
        privateMetadata: {
          role: updatedUser.role ?? 'subaccount-user',
        },
      });
      return { data: updatedUser };
    } catch (e) {
      console.log(e);
      throw new Error('An error occurred while updating user info');
    }
  }
);
