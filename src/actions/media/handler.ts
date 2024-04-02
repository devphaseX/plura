'use server';

import { createActivityLogNotification } from '@/lib/queries';
import { MediaUploadFormSchema } from './input';
import { protectServerAction } from '@/lib/server-action';
import { ActionError } from '@/lib/utils';
import { db } from '@/lib/db';
import { mediaTable } from '@/schema';
import { object, string } from 'zod';
import { sql } from 'drizzle-orm';

export const createMediaAction = protectServerAction(
  MediaUploadFormSchema,
  async (formData, user) => {
    try {
      const permitted = user?.permissions.find(
        (permission) => permission.subAccountId === formData.subaccountId
      );

      if (!permitted) {
        throw new ActionError('You are not permitted to perform this action');
      }

      const media = await db.transaction(async () => {
        const [media] = await db
          .insert(mediaTable)
          .values(formData)
          .returning();

        await createActivityLogNotification({
          description: `Uploaded a media file | ${media.name}`,
          subaccountId: media.subaccountId,
        });

        return media;
      });

      return { data: media };
    } catch (e) {
      if (Object(e) && e instanceof ActionError) {
        throw e;
      }

      if (Error(e as any).message.match(/unauthorized/i)) {
        throw e;
      }
    }
  }
);

export const deleteMediaAction = protectServerAction(
  object({ id: string().uuid() }),
  async ({ id }, user) => {
    try {
      const deletedMediaFile = await db.transaction(async () => {
        const [deletedMediaFile] = await db
          .delete(mediaTable)
          .where(
            sql`${mediaTable.id} = ${id} and ${mediaTable.subaccountId} in (
          ${sql.raw(
            `(${(user?.permissions ?? [])
              .map(({ subAccountId }) => `'${subAccountId}'`)
              .join(',')})`
          )}
      )`
          )
          .returning();

        if (deletedMediaFile) {
          await createActivityLogNotification({
            description: `Deleted a media file | ${deletedMediaFile?.name}`,
            subaccountId: deletedMediaFile.subaccountId,
          });
        }

        return deletedMediaFile;
      });

      if (!deletedMediaFile) {
        throw new ActionError('File not found');
      }

      return { data: deletedMediaFile };
    } catch (e) {
      if (Object(e) instanceof ActionError) {
        throw e;
      }
      console.log('[DELETE MEDIA]', e);
      throw new ActionError('Something went wrong while deleting media');
    }
  }
);
