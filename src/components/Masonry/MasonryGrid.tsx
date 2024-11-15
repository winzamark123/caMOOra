'use client';
import React, { useState } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { ImageProp } from '@/server/routers/Images';
import { trpc } from '@/lib/trpc/client';
import Image from 'next/image';

interface MasonryWrapperProps {
  images: ImageProp[];
  isEditing?: boolean;
  userId: string;
  photoAlbumId: string;
}

export default function MasonryWrapper({
  images,
  isEditing = false,
  userId,
  photoAlbumId,
}: MasonryWrapperProps) {
  const [deletingImages, setDeletingImages] = useState<string[]>([]);
  const utils = trpc.useUtils();

  const deleteImage = trpc.images.deleteImage.useMutation({
    onMutate: async (variables) => {
      await utils.images.getImagesByAlbumId.cancel();

      const previousImages = utils.images.getImagesByAlbumId.getData({
        userId,
        photoAlbumId,
      });

      utils.images.getImagesByAlbumId.setData(
        { userId, photoAlbumId },
        (old) => (old ? old.filter((img) => img.id !== variables.imageId) : [])
      );

      setDeletingImages((prev) => [...prev, variables.imageId]);

      return { previousImages };
    },
    onError: (err, variables, context) => {
      if (context?.previousImages) {
        utils.images.getImagesByAlbumId.setData(
          { userId, photoAlbumId },
          context.previousImages
        );
      }
      console.error('Error deleting image:', err);
      setDeletingImages((prev) =>
        prev.filter((id) => id !== variables.imageId)
      );
    },
    onSuccess: async (_, variables) => {
      setDeletingImages((prev) =>
        prev.filter((id) => id !== variables.imageId)
      );
      await utils.images.getImagesByAlbumId.invalidate({
        userId,
        photoAlbumId,
      });
    },
  });

  const handleDeleteImage = async (imageId: string) => {
    if (deletingImages.includes(imageId)) return; // Prevent multiple clicks
    try {
      await deleteImage.mutate({ imageId });
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Filter out deleting images from display
  const displayImages = images.filter(
    (image) => !deletingImages.includes(image.id)
  );

  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1240: 4 }}
    >
      <Masonry gutter="10px">
        {displayImages.map((image: ImageProp) => (
          <div
            key={image.id}
            className="group relative transition-opacity duration-300 ease-in-out"
          >
            <Image
              className="rounded-sm"
              src={image.url}
              alt="Album Image"
              width={0}
              height={0}
              sizes="(max-width: 750px) 100vw,
                     (max-width: 900px) 50vw,
                     (max-width: 1240px) 33vw,
                     25vw"
              style={{ width: '100%', height: 'auto' }}
              priority={false}
              loading="lazy"
            />
            {isEditing && (
              <div
                onClick={() => handleDeleteImage(image.id)}
                className="absolute inset-0 z-30 flex cursor-pointer items-center 
                          justify-center bg-black/50 
                          opacity-0 transition-opacity duration-300
                          ease-in-out group-hover:opacity-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </Masonry>
    </ResponsiveMasonry>
  );
}
