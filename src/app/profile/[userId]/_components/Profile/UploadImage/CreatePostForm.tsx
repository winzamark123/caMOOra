'use client';

import { useState } from 'react';
import FilePondComponent from './FilePondComponent';
import { PhotoSkeleton } from '@/components/Loading/SkeletonCard';

export default function CreatePostForm({
  photoAlbumId,
  refetch,
}: {
  photoAlbumId: string;
  refetch: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadSuccess = async () => {
    setIsLoading(true);
    // Wait for 2 seconds to allow S3 to update
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await refetch();
    setIsLoading(false);
  };

  return (
    <div>
      <FilePondComponent
        photoAlbumId={photoAlbumId}
        onUploadSuccess={handleUploadSuccess}
        allowMultiple={true}
      />
      {isLoading && (
        <div className="flex flex-wrap justify-center gap-4 p-4">
          <PhotoSkeleton />
          <PhotoSkeleton />
          <PhotoSkeleton />
          <PhotoSkeleton />
        </div>
      )}
    </div>
  );
}
