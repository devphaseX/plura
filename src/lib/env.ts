import { TypeOf, number, object, string } from 'zod';

const EnvSchema = object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string(),
  CLERK_SECRET_KEY: string(),
  //   NEXT_PUBLIC_CLERK_SIGN_IN_URL: string(),
  //   NEXT_PUBLIC_CLERK_SIGN_UP_URL: string(),
  //   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: string(),
  //   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: string(),

  //   NEXT_PUBLIC_URL: string(),
  //   NEXT_PUBLIC_DOMAIN: string(),
  //   NEXT_PUBLIC_SCHEME: string(),

  //   UPLOADTHING_SECRET: string(),
  //   UPLOADTHING_APP_ID: string(),

  //   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string(),
  //   STRIPE_SECRET_KEY: string(),
  //   STRIPE_WEBHOOK_SECRET: string(),
  //   NEXT_PUBLIC_STRIPE_CLIENT_ID: string(),
  //   NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT: number(),
  //   NEXT_PUBLIC_PLATFORM_ONETIME_FEE: number(),
  //   NEXT_PUBLIC_PLATFORM_AGENY_PERCENT: number(),
  //   NEXT_PLURA_PRODUCT_ID: number(),

  // # This was inserted by `prisma init`:
  // # Environment variables declared in this file are automatically made available to Prisma.
  // # See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

  // # Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
  // # See the documentation for all the connection string options: https://pris.ly/d/connection-strings

  DATABASE_URL: string().url(),
  // PROD_DATABASE_URL=
  // LOCAL_DATABASE_URL=postgresql://buildthings:singse/plura?sslmode=require
  // # https://www.builder.io/c/docs/using-your-api-key
  // NEXT_PUBLIC_BUILDER_API_KEY=
});

const env = EnvSchema.parse(process.env);
type ParsedEnv = TypeOf<typeof EnvSchema>;

export { env, type ParsedEnv };
