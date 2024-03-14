'use client';

import { Subaccount, User } from '@/schema';
import { useState } from 'react';

type UserDetailsProps = {
  id: string;
  type: 'agency' | 'subaccount';
  subaccount?: Array<Subaccount>;
  userDetails?: Partial<User>;
};

const UserDetails = (props: UserDetailsProps) => {
  const [] = useState(false);
  return <div>user-details</div>;
};

export { UserDetails };
