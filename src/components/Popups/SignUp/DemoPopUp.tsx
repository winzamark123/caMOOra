import Video from 'next-video';
import PopUp from '../PopUp';
import DemoVideoMp4 from '@videos/PhotographerWelcomeDemo.mp4';
// import Image from 'next/image';
import Confetti from '@public/demo/Confetti.svg';

export default function DemoPopUp({ onToggle }: { onToggle: () => void }) {
  return (
    <PopUp onToggle={onToggle} title="Demo Pop Up">
      <div className="flex flex-col justify-between overflow-hidden rounded-2xl border md:flex-row">
        <div className="relative flex w-full flex-col justify-center gap-6 bg-sky-900 p-8 pt-16 text-white md:w-1/2 md:pt-32">
          <div className="absolute left-0 top-0 z-0 h-1/3 w-full">
            {/* <Image src={Confetti} alt="Confetti" fill /> */}
            <img
              src={Confetti.src}
              alt="Confetti"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <h2 className="z-40 text-2xl font-bold lg:text-2xl">
            ARE YOU A PHOTOGRAPHER?
          </h2>
          <p className="text-lg lg:text-xl">
            Don't forget to activate your{' '}
            <span className="text-theme_yellow">photographers account!</span>
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white p-2 md:h-8 md:w-8">
                <span>1.</span>
              </div>
              <p className="text-base lg:text-lg">
                Click the <span className="text-theme_yellow">"Edit"</span>{' '}
                button in your profile.
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white p-2 md:h-8 md:w-8">
                <span>2.</span>
              </div>
              <p className="text-base lg:text-lg">
                Toggle{' '}
                <span className="text-theme_yellow">
                  "Activate Photographer's Account"
                </span>{' '}
                switch
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex h-48 w-full items-end justify-end bg-white md:h-auto md:w-1/2">
          <Video
            src={DemoVideoMp4}
            className="absolute inset-0 top-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </PopUp>
  );
}
