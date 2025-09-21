import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import NavBar from '../components/NavBar/NavBar';
import Footer from '../components/Footer/Footer';
import { ThemeProvider } from '@/components/Theme/theme-provider';
import TRPCProvider from '@/lib/trpc/Provider';
import { WelcomeDemoPopup } from '@/components/Popups/SignUp/WelcomeDemoPopUp';

export const metadata: Metadata = {
  title: 'CaMOOra',
  description: 'Student Photoshoot Marketplace',
  icons: {
    icon: '/favicon/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon/favicon-48x48.png"
          sizes="48x48"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="caMOOra" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body className="flex min-h-screen flex-col">
        {/* <ClerkProvider> --> Removed since website is no longer being maintained
          <TRPCProvider> */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NavBar />
          <div className="flex flex-col items-center justify-center">
            {children}
          </div>
          {/* <Toaster />
          <WelcomeDemoPopup /> */}
          <Footer />
        </ThemeProvider>
        {/* </TRPCProvider> */}
        {/* </ClerkProvider> */}
      </body>
    </html>
  );
}
