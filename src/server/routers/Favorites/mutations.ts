import { protectedProcedure } from '@/lib/trpc/trpc';
import { z } from 'zod';
import prisma from '@prisma/prisma';

export const saveFavorite = protectedProcedure
  .input(z.object({ photographerId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const user = await prisma.user.findUnique({
      where: { clerkId: ctx.user.clerk.id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const existingFavorite = await prisma.favorites.findUnique({
      where: {
        userId_photographerId: {
          userId: user.id,
          photographerId: input.photographerId,
        },
      },
    });
    if (existingFavorite) {
      return { message: 'Favorite already exists' };
    }
    await prisma.favorites.create({
      data: {
        userId: user.id,
        photographerId: input.photographerId,
      },
    });
    return { message: 'Favorite saved' };
  });

export const removeFavorite = protectedProcedure
  .input(z.object({ photographerId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const user = await prisma.user.findUnique({
      where: { clerkId: ctx.user.clerk.id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const existingFavorite = await prisma.favorites.findUnique({
      where: {
        userId_photographerId: {
          userId: user.id,
          photographerId: input.photographerId,
        },
      },
    });
    if (existingFavorite) {
      // Delete the favorite if it exists
      await prisma.favorites.delete({
        where: {
          userId_photographerId: {
            userId: user.id,
            photographerId: input.photographerId,
          },
        },
      });
      return { message: 'Favorite removed' };
    }
    return { message: 'Favorite does not exist' };
  });
