import { Button } from '@/components/ui/button';
import SimpleModal from '../../ProfilePicPopUp';
import UpdateProfilePicForm from '../../UpdateProfilePicForm';
import { useState } from 'react';
// import Image from 'next/image';

interface EditProfilePicProps {
  profileUrl: string;
  profilePicId: string;
}

export default function EditProfilePic({
  profileUrl,
  profilePicId,
}: EditProfilePicProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  return (
    <main className="flex basis-1/4 flex-col items-center sm:items-start">
      <SimpleModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <UpdateProfilePicForm
          profilePicUrl={profileUrl}
          profilePicId={profilePicId}
          closeModal={handleCloseModal}
        />
      </SimpleModal>
      <div className="relative mt-2 h-36 w-28 sm:h-40 sm:w-32 md:h-44 md:w-36 lg:h-48 lg:w-40 xl:h-52 xl:w-44">
        {/* <Image
          src={profileUrl ?? ''}
          alt={`Profile Picture`}
          objectFit="cover"
          layout="fill"
          className="rounded-sm border border-black"
        /> */}
        <img
          src={profileUrl ?? ''}
          alt="Profile Picture"
          className="absolute inset-0 h-full w-full rounded-sm border border-black object-cover"
          loading="lazy"
        />
      </div>
      <div className="mt-2 flex flex-col gap-2">
        <span className="text-xs">Upload your Profile Picture</span>
        <Button
          className="w-full border  border-gray-400 bg-profile_button_bg text-xs text-black hover:bg-primary_blue hover:text-white focus:bg-primary_blue  focus:text-white sm:w-20"
          onClick={handleOpenModal}
          aria-label="Upload Profile Picture"
        >
          Upload
        </Button>
      </div>
    </main>
  );
}
