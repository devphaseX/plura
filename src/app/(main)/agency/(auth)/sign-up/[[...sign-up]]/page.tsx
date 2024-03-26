'use client';

import { SignUp } from '@clerk/nextjs';
const SignUpPage = ({
  searchParams = {},
}: {
  searchParams: { callbackUrl?: string };
}) => {
  return (
    <SignUp
      afterSignInUrl={searchParams.callbackUrl ?? '/'}
      afterSignUpUrl={searchParams.callbackUrl ?? '/'}
    />
  );
};

export default SignUpPage;
