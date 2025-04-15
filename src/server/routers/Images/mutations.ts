import { protectedProcedure } from '@/lib/trpc/trpc';
import { z } from 'zod';
import prisma from '@prisma/prisma';
import { getPresignedURL, processUploadedImage } from './s3-post';
import { deletePhotoCommand } from './s3-delete';

export const updateProfilePic = protectedProcedure
  .input(
    z.object({
      file_type: z.string(),
      size: z.number(),
      checksum: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new Error('Unauthorized');
    }

    const { success, error } = await getPresignedURL({
      file_type: input.file_type,
      size: input.size,
      checksum: input.checksum,
      userId: ctx.user.id,
    });

    if (error) {
      throw new Error(error);
    }

    // Update the profile to remove the reference to the previous profile picture
    await prisma.profile.update({
      where: { userId: ctx.user.id },
      data: { profilePicId: success?.image_id },
    });

    return { success, error };
  });

export const uploadImage = protectedProcedure
  .input(
    z.object({
      file_type: z.string(),
      size: z.number(),
      checksum: z.string(),
      photoAlbumId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new Error('Unauthorized');
    }

    const { success, error } = await getPresignedURL({
      file_type: input.file_type,
      size: input.size,
      checksum: input.checksum,
      userId: ctx.user.id,
      photoAlbumId: input.photoAlbumId,
    });

    if (error) {
      throw new Error(error);
    }

    return { success, error };
  });

export const processUploadedImageProcedure = protectedProcedure
  .input(
    z.object({
      fileName: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new Error('Unauthorized');
    }

    const isProcessedSuccessfully = await processUploadedImage(
      ctx.user.id,
      input.fileName
    );

    if (!isProcessedSuccessfully) {
      throw new Error('Failed to process image');
    }

    return { success: true };
  });

export const deleteImage = protectedProcedure
  .input(z.object({ imageId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const image = await prisma.images.findUnique({
      where: { id: input.imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    if (image.userId !== ctx.user.id) {
      throw new Error('Unauthorized');
    }

    const { success, error } = await deletePhotoCommand({
      key: image.key,
    });

    if (error) {
      throw new Error(error);
    }

    // Delete the image record from the database
    await prisma.images.delete({
      where: { id: input.imageId },
    });

    return { success, error };
  });
