'use server';

import { TypeOf, z } from 'zod';
import { serverAction } from '@/lib/server-action';
import { db } from '@/lib/db';
import { agencyTable } from '@/schema';
import { sql } from 'drizzle-orm';
import { getUserDetails } from '@/lib/queries';

export const DeleteAgencySchema = z.object({
  id: z.string().uuid(),
});
export type DeleteAgencyInput = TypeOf<typeof DeleteAgencySchema>;
export const deleteAgencyAction = serverAction(
  DeleteAgencySchema,
  async ({ id }) => {
    try {
      const user = await getUserDetails();
      if (!user || id !== user.agency.id) throw new Error('Unauthorized');
      const [removeAgencyProfile] = await db
        .delete(agencyTable)
        .where(sql`${agencyTable.id} = ${id}`)
        .returning();

      return { data: removeAgencyProfile };
    } catch (e) {
      throw new Error('An error occurred while deleting agency account');
    }
  }
);
