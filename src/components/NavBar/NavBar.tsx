'use client';
import { useState } from 'react';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { DropDownProfile } from './DropDownProfile';
import { Button } from '../ui/button';
// import SignInPopUp from '../Popups/SignIn/SignInPopUp';
import LogoBlack from '@public/logo_black.svg';
import LogoWhite from '@public/logo_white.svg';
// import Image from 'next/image';
import { trpc } from '@/lib/trpc/client';
import { ModeToggle } from '../Theme/mode-toggle';
// import DemoPopUp from '../Popups/SignUp/DemoPopUp';
import SignInPopUp from '../Popups/SignIn/SignInPopUp';

export default function NavBar() {
  const [showSignInPopUp, setShowSignInPopUp] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // const { data: my_user } = trpc.profile.getMyProfile.useQuery();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleSignInPopUp = () => setShowSignInPopUp(!showSignInPopUp);

  const NavLinks = () => (
    <>
      <a
        href="https://forms.gle/fN61sHJFh9nBeXwy5"
        className="font-bold hover:underline"
      >
        Feedback
      </a>
      <ModeToggle />
      {/* <SignedIn>
        {my_user && <DropDownProfile userId={my_user.userId} />}
      </SignedIn> */}
      {/* <div className="flex">
        <SignedOut>
          <Button className="px-6 py-3" onClick={toggleSignInPopUp}>
            Get Started
          </Button>
        </SignedOut>
      </div> */}
    </>
  );

  const MobileMenuButton = () => (
    <button
      onClick={toggleMenu}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
        {isOpen ? (
          <path
            fillRule="evenodd"
            d="M18.278 16.864a1 1 0 01-1.414 1.414l-4.829-4.829-4.828 4.829a1 1 0 01-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 011.414-1.414l4.829 4.828 4.828-4.828a1 1 0 011.414 1.414l-4.828 4.829 4.828 4.828z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M4 5h16a1 1 0 010 2H4a1 1 0 110-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z"
            clipRule="evenodd"
          />
        )}
      </svg>
    </button>
  );

  return (
    <main className="h-30 flex w-full justify-between p-8">
      <div className="p-4">
        <Link href="/">
          <img
            className="h-auto w-auto dark:hidden"
            src={LogoBlack.src}
            alt="Camoora Logo"
            loading="eager"
          />
          <img
            className="hidden h-auto w-auto dark:block"
            src={LogoWhite.src}
            alt="Camoora Logo"
            loading="eager"
          />
          {/* <Image
            className="dark:hidden"
            src={LogoBlack}
            alt="Camoora Logo"
            priority
          />
          <Image
            className="hidden dark:flex"
            src={LogoWhite}
            alt="Camoora Logo"
            priority
          /> */}
        </Link>
      </div>

      <div className="hidden items-center justify-between gap-4 p-4 sm:flex">
        <NavLinks />
      </div>

      <div className="right-8 top-8 z-30 p-4 sm:hidden">
        <MobileMenuButton />
      </div>

      {isOpen && (
        <div className="fixed left-0 top-0 z-20 flex h-full w-full flex-col items-center justify-center gap-4 border border-black bg-white p-4 dark:bg-primary_blue sm:hidden">
          <NavLinks />
        </div>
      )}

      {showSignInPopUp && <SignInPopUp onToggle={toggleSignInPopUp} />}
      {/* {showSignInPopUp && <DemoPopUp onToggle={toggleSignInPopUp} />} */}
    </main>
  );
}
