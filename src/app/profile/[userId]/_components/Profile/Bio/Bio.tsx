import React from 'react';
import FavPhotographer from '../FavPhotographer';
import { useUser } from '@clerk/nextjs';

export interface BioProps {
  bio?: string | null;
  equipment?: string | null;
  usersFullName: string;
  additionalName: string | null | undefined;
  clerkId: string;
}

const Bio: React.FC<BioProps> = ({
  bio,
  equipment,
  usersFullName,
  additionalName,
  clerkId,
}) => {
  const { user: currentUser } = useUser();
  return (
    <main className="flex w-full flex-col gap-4 p-4">
      <div className="flex flex-col items-center space-y-2 md:flex-row md:items-start md:space-x-4 md:space-y-0">
        <h1 className="flex flex-col items-center text-base font-extrabold sm:text-lg md:flex-row lg:text-xl 2xl:text-2xl">
          <span>{usersFullName}</span>
          {additionalName && (
            <span className="text-xs md:ml-2">({additionalName})</span>
          )}
        </h1>
        {currentUser && (
          <div className="md:ml-auto">
            <FavPhotographer userId={currentUser.id} photographerId={clerkId} />
          </div>
        )}
      </div>

      <div className="mt-4 md:mt-6">
        <p className="text-xs sm:text-sm md:text-base">
          {bio || `${usersFullName} has no bio.`}
        </p>
      </div>

      {equipment && (
        <div className="mt-6 flex flex-col space-y-2 md:mt-8 md:space-y-4">
          <h2 className="text-sm font-semibold sm:text-base lg:text-lg 2xl:text-xl">
            Equipments
          </h2>
          <p className="text-xs sm:text-sm md:text-base">{equipment}</p>
        </div>
      )}
    </main>
  );
};

export default Bio;
