// import Image from 'next/image';
import { SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import PopUp from '../PopUp';
import PopupSVG from '@public/fo-moo-pop-up.svg';
export default function SignInPopUp({ onToggle }: { onToggle: () => void }) {
  return (
    <PopUp onToggle={onToggle} title="Sign In Pop Up">
      <div
        className="relative flex h-80 w-full items-center 
      justify-between rounded-2xl bg-sky-900 px-8 text-white md:px-16"
      >
        <div className="flex w-full flex-col items-center justify-center gap-4 xs:items-start">
          <h4>Welcome to caMOOra!</h4>
          <p className="text-center xs:text-left">
            Sign in to <span className="text-theme_yellow">view</span> or{' '}
            <span className="text-theme_yellow">become</span> a photographer on
            our platform
          </p>
          <SignInButton>
            <Button
              className="dark z-20 flex w-fit justify-start gap-3 px-8 py-3"
              aria-label="Sign In with Google"
            >
              <FontAwesomeIcon icon={faGoogle} />
              <p>Sign In with Google</p>
            </Button>
          </SignInButton>
        </div>
        <div
          className="absolute bottom-0 z-10 flex w-11/12 items-end 
        justify-end xs:right-0 xs:w-3/4 md:w-2/3 lg:w-3/5"
        >
          <img
            src={PopupSVG.src}
            alt="caMOOra Pop Up"
            className="h-auto w-full object-contain"
          />
          {/* <Image
            src={PopupSVG}
            alt="caMOOra Pop Up"
            className="h-auto w-full object-contain"
          /> */}
        </div>
      </div>
    </PopUp>
  );
}
