// scripts/updateImageUrls.ts
// import prisma from '@prisma/prisma';
import prisma from '@prisma/prisma';

const OLD_DOMAIN = 'https://fomoo-bucket-local.s3.us-east-2.amazonaws.com'; // old s3 bucket
const NEW_DOMAIN = 'https://dmmuvefqy6r0i.cloudfront.net'; // production cdn

async function migrateImageUrls() {
  try {
    console.log('Starting URL migration...');

    // Get all images
    const images = await prisma.images.findMany({
      select: {
        id: true,
        originalUrl: true,
      },
    });

    console.log(`Found ${images.length} images to update`);

    // Update each image URL
    const updates = images.map((image) => {
      const newUrl = image.originalUrl.replace(OLD_DOMAIN, NEW_DOMAIN);
      console.log(`ID: ${image.id}`);
      console.log(`Old URL: ${image.originalUrl}\n`);

      return prisma.images.update({
        where: { id: image.id },
        data: { originalUrl: newUrl },
      });
    });

    // Execute all updates in transaction
    const results = await prisma.$transaction(updates);

    console.log(`\nSuccessfully updated ${results.length} images`);

    // Log first few changes as sample
    results.forEach((img) => {
      console.log(`ID: ${img.id}`);
      console.log(`New URL: ${img.originalUrl}\n`);
    });
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run script
migrateImageUrls();
