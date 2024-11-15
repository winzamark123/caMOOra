'use client';
import React from 'react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { HoverEffect } from '../../components/ui/card-hover-effect';
import { useUser } from '@clerk/nextjs';
import { PhotoSkeleton } from '@/components/Loading/SkeletonCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export default function ExhibitionHall() {
  const { user } = useUser();
  const options = ['Default', 'Favorites'];

  const [dropdownText, setDropdownText] = useState(options[0]);
  const otherOption = dropdownText === options[0] ? options[1] : options[0];

  //trpc handles caching itself
  //uses React Query under the hood (now TanStack Query)
  const {
    data: all_users,
    isLoading,
    error,
  } = trpc.user.getAllPhotographers.useQuery(undefined, {
    staleTime: 0, // Force the query to be treated as fresh
    refetchOnMount: 'always', // Ensure it refetches on mount
    retry: 1,
  });

  const {
    data: fav_users,
    isLoading: fav_users_loading,
    error: fav_users_error,
  } = trpc.favorites.getFavorite.useQuery(
    { userId: user?.id as string },
    {
      enabled: !!user, // only fetch if the user is logged in
    }
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (fav_users_error) {
    return <div>Error: {fav_users_error.message}</div>;
  }

  return (
    <main className="flex w-full flex-col p-4 sm:p-0">
      <div className="flex w-full">
        <div className="flex w-full max-w-5xl flex-col justify-between sm:flex-row">
          <h3 className="font-mono">PHOTOGRAPHERS @ UC DAVIS</h3>
          {/* <div className="">{all_users?.[0]?.id}</div> */}
          <div className="flex items-end justify-end ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {dropdownText}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDropdownText(otherOption)}>
                  {otherOption}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {isLoading || fav_users_loading ? (
        <div className="flex justify-center gap-4 py-6">
          <PhotoSkeleton />
          <PhotoSkeleton />
          <PhotoSkeleton />
          <PhotoSkeleton />
        </div>
      ) : (
        <div className="w-full">
          {dropdownText === options[1] && user && fav_users && (
            <HoverEffect
              items={fav_users.map((user) => ({ userId: user.id }))}
            />
          )}
          {dropdownText === options[0] && all_users && (
            <HoverEffect
              items={all_users.map((user) => ({ userId: user.id }))}
            />
          )}
        </div>
      )}
    </main>
  );
}
