'use client';
import { useState } from 'react';
import EditProfile from '@/app/profile/[userId]/_components/Profile/Edit/EditProfile';
import SignInPopUp from '@/components/Popups/SignIn/SignInPopUp';
import { trpc } from '@/lib/trpc/client';
import { usePathname } from 'next/navigation';
import Bio from './Bio/Bio';
import Projects from './Projects';
import type { Profile } from '@prisma/client';
import ProfilePic from './ProfilePic/ProfilePic';
import Contacts from './Contacts/Contacts';
import { ProfileSkeleton } from '@/components/Skeletons/SkeletonCard';

interface IProfilePic {
  id: string;
  url: string;
  createdAt: string;
}
export interface ProfileProps extends Profile {
  profilePic: IProfilePic;
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const pathname = usePathname();
  const userId = pathname.split('/').pop() || '';
  const [showSignInPopUp, setShowSignInPopUp] = useState(false);

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = trpc.profile.getFullProfile.useQuery({ userId });

  if (isProfileLoading) {
    return <ProfileSkeleton />;
  }

  if (profileError) {
    return <div>Error occurred</div>;
  }

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };
  const toggleSignInPopUp = () => {
    setShowSignInPopUp(!showSignInPopUp);
  };

  const usersFullName = `${profile?.firstName} ${profile?.lastName}`;

  return (
    <div className="flex flex-col">
      {isEditing ? (
        <EditProfile userId={userId} setIsEditing={setIsEditing} />
      ) : (
        <>
          <div className="w-full px-4 md:px-8 lg:px-12">
            {/* Main profile section */}
            <div className="flex flex-col gap-6 md:flex-row md:gap-10">
              {/* Profile picture */}
              <div className="flex justify-center md:justify-start">
                {profile?.profilePic?.originalUrl && (
                  <ProfilePic imageURL={profile?.profilePic.originalUrl} />
                )}
              </div>

              {/* Bio and info section */}
              <div className="flex-grow">
                <div className="w-full md:max-w-xl">
                  <Bio
                    bio={profile?.bio}
                    equipment={profile?.equipment}
                    usersFullName={usersFullName}
                    additionalName={profile?.additionalName}
                    userId={userId}
                  />
                </div>
              </div>

              {/* Contacts section */}
              <div className="w-full md:w-auto">
                <Contacts
                  userId={userId}
                  toggleSignInPopUp={toggleSignInPopUp}
                  toggleEditing={toggleEditing}
                />
              </div>
            </div>
          </div>

          {/* Projects section - Only show in non-editing mode */}
          <div className="w-full">
            <Projects userId={userId} />
          </div>
        </>
      )}

      {showSignInPopUp && <SignInPopUp onToggle={toggleSignInPopUp} />}
    </div>
  );
}
