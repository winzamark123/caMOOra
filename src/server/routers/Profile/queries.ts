import { publicProcedure, protectedProcedure } from '@/lib/trpc/trpc';
import prisma from '@prisma/prisma';
import { z } from 'zod';

export const getMyProfile = protectedProcedure.query(async ({ ctx }) => {
  return await prisma.profile.findUnique({
    where: {
      userId: ctx.user.id,
    },
    select: {
      userId: true,
    },
  });
});

export const getProfileBasics = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    return await prisma.profile.findUnique({
      where: {
        userId: input.userId,
      },
      select: {
        firstName: true,
        lastName: true,
        profilePic: {
          select: {
            originalUrl: true,
          },
        },
      },
    });
  });

export const getFullProfile = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    return await prisma.profile.findUnique({
      where: {
        userId: input.userId,
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        profilePic: true,
        additionalName: true,
        equipment: true,
        bio: true,
        isContactPublic: true,
        isPhotographer: true,
      },
    });
  });

export const getMyProfileCoverImage = protectedProcedure.query(
  async ({ ctx }) => {
    return await prisma.profile.findUnique({
      where: {
        userId: ctx.user.id,
      },
      select: {
        coverImageId: true,
      },
    });
  }
);

export const getProfileCoverImage = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const coverImage = await prisma.profile.findUnique({
      where: {
        userId: input.userId,
      },
      select: {
        coverImage: {
          select: {
            // originalUrl: true,
            webpUrl: true,
          },
        },
      },
    });

    if (coverImage?.coverImage) {
      return coverImage.coverImage;
    }

    // If no cover image set, get first image from user's images
    const firstImage = await prisma.images.findFirst({
      where: {
        userId: input.userId,
        Profile: {
          none: {}, // Exclude profile pictures
        },
      },
      select: {
        // originalUrl: true,
        webpUrl: true,
      },
    });

    return firstImage;
  });
