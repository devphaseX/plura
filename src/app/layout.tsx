import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { ClerkProvider, auth } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import './globals.css';
import { Navigation } from '@/components/site/navigation';
import { ThemeProvider } from '@/providers/theme-provider';

const font = DM_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Plura',
  description: 'All in one agency solution',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <ClerkProvider appearance={{ baseTheme: dark }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <body className={font.className}>
            <Navigation user={user} />
            {children}
          </body>
        </ThemeProvider>
      </ClerkProvider>
    </html>
  );
}
