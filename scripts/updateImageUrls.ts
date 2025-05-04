import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUrls(): Promise<void> {
  try {
    // Get all images
    const images = await prisma.images.findMany({
      select: {
        id: true,
        key: true,
        originalUrl: true,
        webpUrl: true,
        blurUrl: true,
        userId: true,
      },
    });

    console.log(`Found ${images.length} images to update`);
    let updated = 0;

    // Process each image
    for (const image of images) {
      // Skip if no key (we need this to extract information)
      if (!image.key) {
        console.log(`Image ${image.id} has no key, skipping`);
        continue;
      }

      // Parse the key to extract userId and hashName
      // Current key can be either format:
      // - Old format: userId/hashName
      // - New format: userId/original/hashName
      const keyParts = image.key.split('/');
      let userId: string;
      let hashName: string;

      if (keyParts.length === 2) {
        // Old format: userId/hashName
        [userId, hashName] = keyParts;
      } else if (keyParts.length === 3 && keyParts[1] === 'original') {
        // New format: userId/original/hashName
        userId = keyParts[0];
        hashName = keyParts[2];
      } else {
        console.log(`Cannot parse key for image ${image.id}: ${image.key}`);
        continue;
      }

      // Use userId from the image record if available and different
      if (image.userId && userId !== image.userId) {
        console.log(
          `Warning: userId from key (${userId}) doesn't match record (${image.userId}), using record value`
        );
        userId = image.userId;
      }

      // Check if URLs are already in the correct format (new structure)
      const hasCorrectOriginalUrl = image.originalUrl?.includes(
        `/${userId}/original/`
      );
      const hasCorrectWebpUrl =
        image.webpUrl?.includes(`/${userId}/placeholder/`) &&
        image.webpUrl?.endsWith('.webp');
      const hasCorrectBlurUrl =
        image.blurUrl?.includes(`/${userId}/blur/`) &&
        image.blurUrl?.endsWith('.webp');

      // Skip if all URLs are already in the correct format
      if (hasCorrectOriginalUrl && hasCorrectWebpUrl && hasCorrectBlurUrl) {
        console.log(
          `Image ${image.id} already has correct URL format, skipping`
        );
        continue;
      }

      // Construct new URLs
      const originalUrl = `https://dmmuvefqy6r0i.cloudfront.net/${userId}/original/${hashName}`;
      const webpUrl = `https://dmmuvefqy6r0i.cloudfront.net/${userId}/placeholder/${hashName}.webp`;
      const blurUrl = `https://dmmuvefqy6r0i.cloudfront.net/${userId}/blur/${hashName}.webp`;

      // Update the database
      await prisma.images.update({
        where: { id: image.id },
        data: {
          originalUrl,
          webpUrl,
          blurUrl,
          // Also update the key to match the new structure if it's in the old format
          key: `${userId}/original/${hashName}`,
        },
      });

      updated++;
      console.log(`Updated image ${image.id} with new URLs`);
    }

    console.log(
      `Update completed successfully. Updated ${updated} of ${images.length} images.`
    );
  } catch (error) {
    console.error('Error updating URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUrls();
