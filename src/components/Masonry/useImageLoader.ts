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
        img.src = image.blurUrl || image.originalUrl; // TODO: use webp / blurUrl

        // preload for masonry
        if (image.webpUrl) {
          const webpImg = new Image();
          webpImg.src = image.webpUrl;
        }

        // preload for dialog
        // if (image.originalUrl && image.originalUrl !== image.webpUrl) {
        //   const originalImg = new Image();
        //   originalImg.src = image.originalUrl;
        // }

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
    getImageUrl: ({
      imageId,
      isDialogView = false,
    }: {
      imageId: string;
      isDialogView: boolean;
    }) => {
      const image = images.find((img) => img.id === imageId);
      if (!image) return '';

      console.log('🚀 ~ :99 ~ imagesReady:', imagesReady, isDialogView);

      if (isDialogView) {
        return image.originalUrl;
      }

      if (!imagesReady.has(imageId)) {
        return image.blurUrl;
      }

      return image.webpUrl;
    },
  };
}
