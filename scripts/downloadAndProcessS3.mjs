// scripts/processExistingImages.mjs
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import dotenv from 'dotenv';
import lodash from 'lodash';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();
const { chunk } = lodash;

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID_CLI,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY_CLI,
  },
});

// Process image function (similar to what's in s3-post.ts)
async function processImage(buffer) {
  // Create WebP version - optimized for web viewing
  const webp = await sharp(buffer).webp({ quality: 80, effort: 4 }).toBuffer();

  // Create blur version for lazy loading
  const blur = await sharp(buffer)
    .blur(30)
    .webp({ quality: 10, effort: 1 })
    .toBuffer();

  return {
    webp,
    blur,
  };
}

// Process a single image - download only
async function processImageFromS3(key) {
  try {
    console.log(`Processing: ${key}`);

    // Get the original image from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3.send(getObjectCommand);
    const buffer = await response.Body?.transformToByteArray();

    if (!buffer) {
      console.error(`Failed to get image buffer for: ${key}`);
      return false;
    }

    // Extract userId and fileName from the key
    const pathParts = key.split('/');
    if (pathParts.length < 2) {
      console.error(`Invalid key format: ${key}`);
      return false;
    }

    const userId = pathParts[0];
    const fileName = pathParts[pathParts.length - 1];

    // Process the image and save locally
    const processed = await processImage(Buffer.from(buffer));

    // Save to local directory instead of S3
    const fs = await import('fs');
    const path = await import('path');

    // Create directories if they don't exist
    const dir = path.resolve(`./processed-images/${userId}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save webp and blur versions locally
    fs.writeFileSync(
      path.resolve(`./processed-images/${userId}/${fileName}.webp`),
      processed.webp
    );
    fs.writeFileSync(
      path.resolve(`./processed-images/${userId}/${fileName}-blur.webp`),
      processed.blur
    );

    console.log(`Saved processed images locally for: ${key}`);

    return true;
  } catch (error) {
    console.error(`Error processing image ${key}:`, error);
    return false;
  }
}

// List all objects in the bucket with pagination
async function listAllObjects() {
  const keys = [];
  let continuationToken;

  do {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(command);
    console.log(
      `Found ${response.Contents?.length || 0} objects in this batch`
    );

    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key) {
          // Skip potential directory markers (empty objects with trailing slash)
          if (!object.Key.endsWith('/') && object.Key.includes('/')) {
            // Each user has their own folder with objects directly inside
            // Format: userId/objectHash
            keys.push(object.Key);
          }
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  console.log('First 10 keys found:', keys.slice(0, 10));
  return keys;
}

// Process images in batches to avoid memory issues
async function processImagesInBatches(keys, batchSize = 10) {
  const batches = chunk(keys, batchSize);
  let processed = 0;
  let failed = 0;

  console.log(`Processing ${keys.length} images in ${batches.length} batches`);

  for (let i = 0; i < batches.length; i++) {
    console.log(`Processing batch ${i + 1}/${batches.length}`);

    const results = await Promise.allSettled(
      batches[i].map((key) => processImageFromS3(key))
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        processed++;
      } else {
        failed++;
      }
    });

    console.log(`Progress: ${processed} processed, ${failed} failed`);
  }

  return { processed, failed };
}

// Main function
async function main() {
  try {
    console.log('Starting image processing script...');

    // Get all objects from S3 bucket
    const keys = await listAllObjects();
    console.log(`Found ${keys.length} original images to process`);

    // Process all images
    const { processed, failed } = await processImagesInBatches(keys);

    console.log('Image processing complete!');
    console.log(`Successfully processed: ${processed}`);
    console.log(`Failed: ${failed}`);
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
