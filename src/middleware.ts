import { Search } from 'lucide-react';
import { authMiddleware } from '@clerk/nextjs';
import { env } from './lib/env';
import { NextResponse } from 'next/server';

export default authMiddleware({
  publicRoutes: ['/site', '/api/uploadthing'],
  async beforeAuth(auth, req) {},
  async afterAuth(auth, req) {
    const url = req.nextUrl;
    const searchParams = url.searchParams.toString();
    const headers = req.headers;

    const pathWithSearchParams = `${url.pathname}${
      searchParams ? `?${searchParams}` : ''
    }`.replace(/^\/?/, '');

    let [customSubDomain] =
      headers
        .get('host')
        ?.split(new RegExp(String.raw`\.?${env.NEXT_PUBLIC_DOMAIN}`)) ?? [];
    customSubDomain = customSubDomain.replace(/\./, '');

    if (customSubDomain && customSubDomain !== 'www') {
      return NextResponse.rewrite(
        new URL(`/${customSubDomain}/${pathWithSearchParams}`, req.url)
      );
    }

    if (['/sign-in', '/sign-up'].some((path) => url.pathname === path)) {
      return NextResponse.redirect(new URL(`/agency/${url.pathname}`, req.url));
    }

    if (
      url.pathname === '/' ||
      url.pathname === '/site' ||
      url.pathname === env.NEXT_PUBLIC_DOMAIN
    ) {
      return NextResponse.rewrite(new URL('/site', req.url));
    }

    if (
      url.pathname.startsWith('/agency') ||
      url.pathname.startsWith('/subaccount')
    ) {
      return;
    }
  },
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
