import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/lib/db';
import {
  AgencyPageParams,
  AgencyPageParamsSchema,
  AgencyPageQueries,
  AgencyPageQueriesSchema,
} from '@/lib/validations/queries';
import { agencyTable } from '@/schema';
import { eq } from 'drizzle-orm';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';

type LaunchPadPageProps = {
  params: AgencyPageParams;
  searchParams: AgencyPageQueries;
};

const LaunchPadPage = async ({ params, searchParams }: LaunchPadPageProps) => {
  {
    params = AgencyPageParamsSchema.parse(params ?? {});
    searchParams = AgencyPageQueriesSchema.parse(searchParams ?? {});
  }

  const agencyDetails = await db.query.agencyTable.findFirst({
    where: eq(agencyTable.id, params.agencyId),
  });

  if (!agencyDetails) {
    return notFound();
  }

  const completeDetailsFillUp = true;

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full h-full max-w-[800px]">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Lets get started</CardTitle>
            <CardDescription>
              Follow the steps below to get your account setup
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image
                  src="/appstore.png"
                  alt="app logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain"
                />
                <p>Save the website as a shortcut on your mobile phone</p>
              </div>
              <Button>Start</Button>
            </div>
            <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image
                  src="/stripelogo.png"
                  alt="app logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain"
                />
                <p>
                  Connect your stripe account to accept payments and see your
                  dashboard
                </p>
              </div>
              <Button>Start</Button>
            </div>{' '}
            <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image
                  src={agencyDetails.agencyLogo}
                  alt="app logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain"
                />
                <p>Fill in all your business details</p>
              </div>
              {completeDetailsFillUp ? (
                <CheckCircle
                  size={50}
                  className="text-primary p-2 flex-shrink-0"
                />
              ) : (
                <Link
                  href={`/agency/${params.agencyId}/settings`}
                  className="bg-primary py-2 px-4 rounded-md text-white"
                >
                  Start
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaunchPadPage;
