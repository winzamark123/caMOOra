import { useState, useEffect } from 'react';
import { ImageProp } from '@/server/routers/Images';

const MIN_LOADING_TIME = 200;

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export function useImageLoader(
  images: ImageProp[],
  isLoading?: boolean,
  isFetching?: boolean
) {
  const [loadingStartTime, setLoadingStartTime] = useState(0);
  const [imagesReady, setImagesReady] = useState<Set<string>>(new Set());
  const [imageDimensions, setImageDimensions] = useState<
    Record<string, ImageDimensions>
  >({});

  useEffect(() => {
    if (isLoading || isFetching) {
      setLoadingStartTime(Date.now());
      setImagesReady(new Set());
      setImageDimensions({});
    }
  }, [isLoading, isFetching]);

  useEffect(() => {
    if (!isLoading && !isFetching && images) {
      images.forEach((image) => {
        const img = new Image();
        img.src = image.webpUrl || image.originalUrl; // TODO: use webp / blurUrl

        // Preload the original image in the background if webpUrl was used
        if (image.webpUrl && image.webpUrl !== image.originalUrl) {
          const originalImg = new Image();
          originalImg.src = image.originalUrl;
        }

        img.onload = () => {
          const dimensions: ImageDimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight,
          };

          setImageDimensions((prev) => ({
            ...prev,
            [image.id]: dimensions,
          }));

          const timeElapsed = Date.now() - loadingStartTime;
          if (timeElapsed >= MIN_LOADING_TIME) {
            setImagesReady((prev) => {
              const newSet = new Set(prev);
              newSet.add(image.id);
              return newSet;
            });
          } else {
            setTimeout(() => {
              setImagesReady((prev) => {
                const newSet = new Set(prev);
                newSet.add(image.id);
                return newSet;
              });
            }, MIN_LOADING_TIME - timeElapsed);
          }
        };
      });
    }
  }, [isLoading, isFetching, images, loadingStartTime]);

  return {
    isImageReady: (imageId: string) => imagesReady.has(imageId),
    getImageDimensions: (imageId: string) => imageDimensions[imageId],
    allImagesLoaded: imagesReady.size === images.length,

    // Add a method to get the appropriate URL based on loading state
    getImageUrl: (imageId: string) => {
      const image = images.find((img) => img.id === imageId);
      if (!image) return '';

      // Use webpUrl for initial loading if available, otherwise fall back to original
      return imagesReady.has(imageId)
        ? image.originalUrl
        : image.webpUrl || image.originalUrl;
    },
  };
}
