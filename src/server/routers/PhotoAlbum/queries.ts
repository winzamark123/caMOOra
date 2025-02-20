import { publicProcedure } from '@/lib/trpc/trpc';
import { z } from 'zod';
import prisma from '@prisma/prisma';

export const getAllPhotoAlbums = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const photoAlbums = await prisma.photoAlbum.findMany({
      where: { userId: input.userId },
      select: {
        id: true,
        photoAlbumName: true,
        Images: {
          select: { id: true, originalUrl: true }, // TODO: add blurUrl and webpUrl
        },
      },
    });

    return photoAlbums;
  });
