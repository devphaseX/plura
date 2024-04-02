import { BlurPage } from '@/components/global/blur-page';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Unauthorized } from '@/components/unauthorized';
import { db } from '@/lib/db';
import { getUserDetails } from '@/lib/queries';
import {
  SubaccountPageQueries,
  SubaccountParams,
  SubaccountParamsSchema,
  SubaccountQueries,
} from '@/lib/validations/queries';
import { subaccountTable } from '@/schema';
import { currentUser } from '@clerk/nextjs';
import { sql } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { CheckCircleIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type LaunchPadPageProps = {
  params: SubaccountParams;
  searchParams: SubaccountQueries;
};

const LaunchPadPage = async ({ params, searchParams }: LaunchPadPageProps) => {
  {
    params = SubaccountParamsSchema.parse(params);
    searchParams = SubaccountPageQueries.parse(searchParams);
  }

  const [authUser, user] = await Promise.all([currentUser(), getUserDetails()]);
  if (!authUser) {
    return redirect(`/subaccount`);
  }

  if (!user) {
    return <Unauthorized />;
  }

  const [subaccountDetails] = await db
    .select()
    .from(subaccountTable)
    .where(
      sql`
      ${subaccountTable.id} = ${params.subaccountId} and ${
        subaccountTable.id
      } in (
      ${sql.raw(
        `${user.permissions
          .map(({ subAccountId }) => `'${subAccountId}'`)
          .join(',')}`
      )}
      )`
    );
  if (!subaccountDetails) {
    return redirect('/subaccount');
  }

  const completedInfoFill =
    subaccountDetails.address &&
    subaccountDetails.subAccountLogo &&
    subaccountDetails.city &&
    subaccountDetails.companyEmail &&
    subaccountDetails.companyPhone &&
    subaccountDetails.country &&
    subaccountDetails.name &&
    subaccountDetails.state;

  return (
    <BlurPage>
      <div className="flex flex-col justify-center items-center">
        <div className="w-full h-full max-w-[800px]">
          <Card className="border-none ">
            <CardHeader>
              <CardTitle>Lets get started!</CardTitle>
              <CardDescription>
                Follow the steps below to get your account setup correctly.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg ">
                <div className="flex items-center gap-4">
                  <Image
                    src="/appstore.png"
                    alt="App logo"
                    height={80}
                    width={80}
                    className="rounded-md object-contain"
                  />
                  <p>Save the website as a shortcut on your mobile devide</p>
                </div>
                <Button>Start</Button>
              </div>
              <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <Image
                    src="/stripelogo.png"
                    alt="App logo"
                    height={80}
                    width={80}
                    className="rounded-md object-contain "
                  />
                  <p>
                    Connect your stripe account to accept payments. Stripe is
                    used to run payouts.
                  </p>
                </div>
                {/* {subaccountDetails.connectAccountId ||
                connectedStripeAccount ? (
                  <CheckCircleIcon
                    size={50}
                    className=" text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className="bg-primary py-2 px-4 rounded-md text-white"
                    href={stripeOAuthLink}
                  >
                    Start
                  </Link>
                )} */}
              </div>
              <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <Image
                    src={subaccountDetails.subAccountLogo}
                    alt="App logo"
                    height={80}
                    width={80}
                    className="rounded-md object-contain p-4"
                  />
                  <p>Fill in all your business details.</p>
                </div>
                {completedInfoFill ? (
                  <CheckCircleIcon
                    size={50}
                    className=" text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className="bg-primary py-2 px-4 rounded-md text-white"
                    href={`/subaccount/${subaccountDetails.id}/settings`}
                  >
                    Start
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BlurPage>
  );
};

export default LaunchPadPage;
