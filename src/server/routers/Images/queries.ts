import { publicProcedure } from '@/lib/trpc/trpc';
import { z } from 'zod';
import prisma from '@prisma/prisma';

export const getAllImages = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const images = await prisma.images.findMany({
      where: {
        userId: input.userId,
        // not associated with a profile (hence not a profile pic)
        Profile: {
          none: {},
        },
      },
    });

    const imageDetails = images.map((image) => ({
      url: image.originalUrl, // TODO: get webpUrl & blurUrl as well
      id: image.id,
    }));
    return imageDetails;
  });

export const getUserHomePageImage = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const homePageImage = await prisma.images.findFirst({
      where: {
        userId: input.userId,

        Profile: {
          none: {},
        },
      },
      select: {
        originalUrl: true, // TODO: get webpUrl
      },
    });

    return homePageImage;
  });

export const getImagesByAlbumId = publicProcedure
  .input(z.object({ userId: z.string(), photoAlbumId: z.string() }))
  .query(async ({ input }) => {
    const images = await prisma.images.findMany({
      where: {
        PhotoAlbumId: input.photoAlbumId,
        userId: input.userId,
      },
    });

    const imageDetails = images.map((image) => ({
      url: image.originalUrl, // TODO: get webpUrl & blurUrl as well
      id: image.id,
    }));
    return imageDetails;
  });
