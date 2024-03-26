import { ModeToggle } from '@/components/global/mode-toggle';
import { UserButton } from '@clerk/nextjs';
import { User } from '@clerk/nextjs/server';
import Image from 'next/image';
import Link from 'next/link';

type NavigationProps = {
  user?: null | User;
};

export const Navigation = ({ user }: NavigationProps) => {
  return (
    <div className="p-4 flex items-center justify-between relative">
      <aside className="flex items-center gap-2">
        <Image
          src="/assets/plura-logo.svg"
          width={40}
          height={40}
          alt="plura logo"
        />
        <span className="text-xl font-bold">Plura</span>
      </aside>
      <nav className="hidden md:block absolute left-[50%] translate-x-[-50%]">
        <ul className="flex items-center justify-center gap-4">
          <Link href="">Pricing</Link>
          <Link href="">About</Link>
          <Link href="">Documentation</Link>
          <Link href="">Features</Link>
        </ul>
      </nav>

      <aside className="flex gap-2 items-center">
        <Link
          href={'/agency'}
          className="text-white py-2 px-4 bg-primary rounded-md hover:bg-primary/80"
        >
          Login
        </Link>
        <UserButton />
        <ModeToggle />
      </aside>
    </div>
  );
};
