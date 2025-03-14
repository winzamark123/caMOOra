// import Image from 'next/image';
import fomooLogo from '@public/fo-moo-logo.svg';

export default function Landing() {
  return (
    <main className="flex w-full max-w-2xl flex-col font-mono">
      <h1>PHOTOGRAPHER</h1>
      <div className="px-2">
        <h4>CAPTURE</h4>
      </div>
      <div className="flex items-center justify-end gap-12">
        <img
          src={fomooLogo.src}
          alt="logo landing page"
          width={100}
          height={100}
        />
        {/* <Image
          src={fomooLogo}
          alt="logo landing page"
          width={100}
          height={100}
        /> */}
        <h1>SERVICE</h1>
      </div>
      <div className="flex justify-end px-2">
        <h4>YOUR MEMORIES</h4>
      </div>
    </main>
  );
}
