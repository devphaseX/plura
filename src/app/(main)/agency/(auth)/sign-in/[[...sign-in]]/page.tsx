'use client';

import { SignIn } from '@clerk/nextjs';
const SignInPage = ({
  searchParams = {},
}: {
  searchParams: { callbackUrl?: string };
}) => {
  return (
    <SignIn
      afterSignInUrl={searchParams.callbackUrl ?? '/'}
      afterSignUpUrl={searchParams.callbackUrl ?? '/'}
    />
  );
};

export default SignInPage;
