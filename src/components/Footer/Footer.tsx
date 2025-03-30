import React from 'react';
import { Instagram, Github } from 'lucide-react';
import Link from 'next/link';
// import Image from 'next/image';
import Logo from '@public/logo.svg';

interface ISocial {
  name: string;
  icon: React.ComponentType;
  link: string;
}

const socials: ISocial[] = [
  {
    name: 'Instagram',
    icon: Instagram,
    link: 'https://www.instagram.com/camoora_ucd/',
  },
  {
    name: 'GitHub',
    icon: Github,
    link: 'https://github.com/winzamark123/CaMooRa',
  },
];

export default function Footer() {
  return (
    <main className="mt-auto flex w-full flex-col items-center justify-center gap-2 bg-theme_grey p-8 text-white">
      {/* <Image className="flex" src={Logo} alt="Camoora Logo"></Image> */}
      <img
        className="flex h-auto w-auto"
        src={Logo.src}
        alt="Camoora Logo"
        loading="lazy"
      />
      <p>Made by UCDavis Students for UCDavis Students &lt;3</p>
      <div className="flex items-center justify-center gap-2 p-4 ">
        {socials.map((social) => {
          const Icon = social.icon;
          return (
            <Link
              key={social.name}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white"
            >
              <Icon />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
