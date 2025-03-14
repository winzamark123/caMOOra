'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { computeSHA256 } from '@/server/routers/Images/utils';
// import Image from 'next/image';
import { Button } from '../../../../../components/ui/button';

interface UpdateProfilePicFormProps {
  profilePicUrl: string | undefined;
  profilePicId: string;
  closeModal: () => void;
}

export default function UpdateProfilePicForm({
  profilePicUrl,
  profilePicId,
  closeModal,
}: UpdateProfilePicFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isImageCleared, setIsImageCleared] = useState(false);

  const signedURL = trpc.images.updateProfilePic.useMutation();
  const deleteImage = trpc.images.deleteImage.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    // Do all the image upload and everything
    try {
      if (file) {
        // Updating Profile Pic
        const signedURLResult = await signedURL.mutateAsync({
          file_type: file.type,
          size: file.size,
          checksum: await computeSHA256(file),
        });

        // Deleting Profile Pic
        deleteImage.mutate({
          imageId: profilePicId,
        });

        if (signedURLResult.error || !signedURLResult.success) {
          setStatusMessage('Error: Failed preparing to upload image');
          setLoading(false);
          return;
        }

        const url = signedURLResult.success?.signed_url;

        await fetch(url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });
      }
    } catch (error) {
      setStatusMessage('Error: Failed to Update Profile Picture');
      setLoading(false);
    } finally {
      // File uploaded successfully
      setLoading(false);
      window.location.reload(); // Reload the page
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIsImageCleared(false);
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFile(file);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {(statusMessage || loading) && (
          <p className="relative mb-4 rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700">
            {loading ? 'Loading...' : statusMessage}
          </p>
        )}

        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Preivew File */}

          <label>
            <div className="mb-2 flex flex-row-reverse">
              <span
                aria-label="Clear Profile Picture"
                className="text-xs underline hover:text-gray-400"
                onClick={() => setIsImageCleared(true)}
              >
                Clear
              </span>
            </div>
            {isImageCleared ? (
              <div className="relative h-36 w-28 bg-gray-200 sm:h-40 sm:w-32 md:h-44 md:w-36 lg:h-48 lg:w-40 xl:h-52 xl:w-44">
                <div
                  className="absolute inset-0 cursor-pointer bg-white opacity-0 outline-4 transition-opacity duration-300 hover:opacity-50 focus:opacity-50 focus:outline-black"
                  tabIndex={0}
                  role="button"
                  aria-label="Change Profile Picture"
                  // onKeyDown={(e) => {
                  //   if (e.key === 'Enter' || e.key === ' ') {
                  //     // Trigger the file input click
                  //     document.getElementsByName('media')[0].click();
                  //   }
                  // }}
                ></div>
              </div>
            ) : profilePicUrl && !selectedImage ? (
              <div className="relative h-36 w-28 sm:h-40 sm:w-32 md:h-44 md:w-36 lg:h-48 lg:w-40 xl:h-52 xl:w-44">
                {/* <Image
                  src={profilePicUrl}
                  layout="fill"
                  objectFit="cover"
                  alt="Profile Picture"
                  className="rounded-sm border border-gray-300"
                /> */}
                <img
                  src={profilePicUrl}
                  alt="Profile Picture"
                  className="absolute inset-0 h-full w-full rounded-sm border border-gray-300 object-cover"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 cursor-pointer bg-white opacity-0 outline-4 transition-opacity duration-300 hover:opacity-50 focus:opacity-50 focus:outline-black"
                  tabIndex={0}
                  role="button"
                  aria-label="Change Profile Picture"
                  // onKeyDown={(e) => {
                  //   if (e.key === 'Enter' || e.key === ' ') {
                  //     // Trigger the file input click
                  //     document.getElementsByName('media')[0].click();
                  //   }
                  // }}
                ></div>
              </div>
            ) : null}
            {selectedImage && !isImageCleared && (
              <div className="relative h-36 w-28 sm:h-40 sm:w-32 md:h-44 md:w-36 lg:h-48 lg:w-40 xl:h-52 xl:w-44">
                <img
                  src={selectedImage}
                  alt="Attach media"
                  className="absolute inset-0 h-full w-full rounded-sm border border-gray-300 object-cover"
                  aria-label="Preview of the Profile Picture"
                  loading="lazy"
                />
                {/* <Image
                  src={selectedImage}
                  layout="fill"
                  objectFit="cover"
                  alt="Attach media"
                  className="rounder-sm border border-gray-300"
                  aria-label="Preview of the Profile Picture"
                /> */}
                <div
                  className="absolute inset-0 cursor-pointer bg-white opacity-0 transition-opacity duration-300 hover:opacity-50 focus:opacity-50"
                  tabIndex={0}
                  role="button"
                  aria-label="Change Profile Picture"
                  // onKeyDown={(e) => {
                  //   if (e.key === 'Enter' || e.key === ' ') {
                  //     // Trigger the file input click
                  //     document.getElementsByName('media')[0].click();
                  //   }
                  // }}
                ></div>
              </div>
            )}
            <input
              className="hidden border-none bg-transparent outline-none"
              name="media"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              onChange={handleFileChange}
            />
          </label>
          <div className="space-x-2 p-4">
            <Button
              className="w-16 flex-shrink-0 border border-gray-400 bg-profile_button_bg text-xs text-black hover:bg-primary_blue hover:text-white focus:bg-primary_blue focus:text-white active:bg-primary_blue"
              aria-label="Cancel updating profile picture"
              onClick={closeModal}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className="w-16 flex-shrink-0 border border-gray-400 bg-profile_button_bg text-xs text-black hover:bg-primary_blue hover:text-white focus:bg-primary_blue focus:text-white active:bg-primary_blue"
              aria-label="Save updating profile picture"
              type="submit"
            >
              Save
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
