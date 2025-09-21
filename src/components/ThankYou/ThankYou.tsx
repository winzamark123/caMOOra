import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin } from 'lucide-react';

export default function ThankYou() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-2xl px-6 text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/fo-moo-logo.svg"
            alt="CaMOOra Logo"
            width={96}
            height={96}
            className="mx-auto"
          />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Thank You for Visiting CaMOOra
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
            We appreciate you checking out our photography service platform.
          </p>

          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              Service Period
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              May 2024 - September 2025
            </p>
          </div>

          <p className="text-base text-gray-600 dark:text-gray-400">
            This site is no longer being maintained, but you can still explore
            the codebase if you're interested.
          </p>

          {/* Repository Link */}
          <div className="pt-4">
            <Link
              href="https://github.com/winzamark123/caMOOra"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              <Github className="h-5 w-5" />
              View Repository on GitHub
            </Link>
          </div>
        </div>

        {/* Credits */}
        <div className="group relative mt-12 overflow-hidden rounded-2xl bg-white/90 p-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl dark:bg-gray-800/90">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative">
            <h3 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Credits
            </h3>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
              {/* Developer 1 */}
              <div className="group/credit relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:from-gray-700 dark:to-gray-600">
                <div className="text-center">
                  <div className="mb-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                    Developer
                  </div>
                  <h4 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                    Teeranade Cheng (Win)
                  </h4>
                  <div className="flex justify-center gap-2">
                    <Link
                      href="https://linkedin.com/in/teeranade-cheng"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Link>
                    <Link
                      href="https://github.com/winzamark123"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900"
                    >
                      <Github className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Developer 2 */}
              <div className="group/credit relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:from-gray-700 dark:to-gray-600">
                <div className="text-center">
                  <div className="mb-3 text-sm font-medium text-purple-600 dark:text-purple-400">
                    Developer
                  </div>
                  <h4 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                    Diego Rafael
                  </h4>
                  <div className="flex justify-center gap-2">
                    <Link
                      href="https://www.linkedin.com/in/diego-rafael-8668b02b1/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Link>
                    <Link
                      href="https://github.com/Dieg0raf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900"
                    >
                      <Github className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Designer */}
              <div className="group/credit relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:from-gray-700 dark:to-gray-600">
                <div className="text-center">
                  <div className="mb-3 text-sm font-medium text-pink-600 dark:text-pink-400">
                    Designer
                  </div>
                  <h4 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                    Khunanya Liu (Yaya)
                  </h4>
                  <Link
                    href="https://www.linkedin.com/in/khunanya-liu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Built with Next.js, Prisma, and tRPC</p>
        </div>
      </div>
    </main>
  );
}
