import type { Metadata } from 'next';
import { env } from './env';

export const APP_NAME = 'plura';
export const APP_DESCRIPTION =
  'A platform that allows agency to manage their company and any subaccount';

export const baseMetadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  metadataBase: new URL(env.NEXT_PUBLIC_URL),
  description: APP_DESCRIPTION,
  creator: 'Ayomide Lawal',
  authors: [{ name: 'Ayomide Lawal' }],
  openGraph: {
    locale: 'en_NG',
    title: APP_NAME,
    siteName: APP_DESCRIPTION,
    description: APP_DESCRIPTION,
    images: [],
  },
  twitter: {
    title: APP_NAME,
    creator: '@i_am_ayomidee',
    card: 'summary_large_image',
    description: APP_DESCRIPTION,
    images: [`${env.NEXT_PUBLIC_URL}/media/og.jpg`],
  },
} satisfies Metadata;

export const getPageMetadata = (metadata: Metadata): Metadata => {
  const metadataTitle = metadata.title as string | null | undefined;
  return {
    ...metadata,
    description: metadata.description ?? baseMetadata.description,
    openGraph: {
      ...baseMetadata.openGraph,
      ...metadata.openGraph,
      title: `${metadataTitle} | ${APP_NAME}`,
      description: metadata.description ?? baseMetadata.openGraph?.description,
    },
    twitter: {
      ...baseMetadata.twitter,
      ...metadata.twitter,
      title: `${metadataTitle} | ${APP_NAME}`,
      description: metadata.description ?? baseMetadata.twitter?.description,
    },
  };
};
