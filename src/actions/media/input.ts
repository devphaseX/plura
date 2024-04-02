import { mediaTable } from '@/schema';
import { createInsertSchema } from 'drizzle-zod';
import { string, TypeOf } from 'zod';

export const MediaUploadFormSchema = createInsertSchema(mediaTable, {
  link: string({ required_error: 'Media file is required' }).url(),
  name: string().min(1, { message: 'Name is required' }),
  subaccountId: string().uuid(),
});

export type MediaUploadForm = TypeOf<typeof MediaUploadFormSchema>;
