'use client';
// import Image from 'next/image';
import React from 'react';
import { trpc } from '@/lib/trpc/client';
import { DropDownSkeleton } from '@/components/Skeletons/SkeletonCard';

interface UsernameProfilePicProps {
  id: string;
}

export default function UsernameProfilePic({ id }: UsernameProfilePicProps) {
  const {
    data: user_profile,
    isLoading,
    error,
  } = trpc.profile.getProfileBasics.useQuery({ userId: id });

  console.log(user_profile);

  if (isLoading) {
    return <DropDownSkeleton />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user_profile) {
    return <div>No Profile Available for this User</div>;
  }

  return (
    <main className="flex items-center gap-2 font-bold">
      <div className="relative aspect-square h-11 w-11 rounded-full border">
        {user_profile.profilePic?.originalUrl && (
          <img
            src={user_profile.profilePic?.originalUrl}
            alt="profile"
            className="absolute inset-0 h-full w-full rounded-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <p>{user_profile.firstName}</p>
      <p>{user_profile.lastName}</p>
    </main>
  );
}
