import { Navigation } from '@/components/site/navigation';
import { ClerkProvider, auth } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const { user } = await auth();
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <main className="h-full">
        <Navigation user={user} />
        {children}
      </main>
    </ClerkProvider>
  );
};

export default Layout;
