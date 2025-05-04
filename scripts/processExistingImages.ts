// scripts/processExistingImages.ts
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import prisma from '@prisma/prisma';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { chunk } from 'lodash';

dotenv.config();

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
  },
});

// Process image function (similar to what's in s3-post.ts)
async function processImage(buffer: Buffer) {
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

// Upload processed image to S3
async function uploadToS3(buffer: Buffer, key: string): Promise<string> {
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: key,
    Body: buffer,
    ContentType: 'image/webp',
  });

  await s3.send(putObjectCommand);
  return `${process.env.AWS_CLOUDFRONT_URL}/${key}`;
}

// Process a single image
async function processImageFromS3(key: string): Promise<boolean> {
  try {
    console.log(`Processing: ${key}`);

    // Get the original image from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
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
    if (pathParts.length < 3) {
      console.error(`Invalid key format: ${key}`);
      return false;
    }

    const userId = pathParts[0];
    const fileName = pathParts[pathParts.length - 1];

    // Process the image
    const processed = await processImage(Buffer.from(buffer));

    // Upload processed versions
    const webpUrl = await uploadToS3(
      processed.webp,
      `${userId}/placeholder/${fileName}.webp`
    );

    const blurUrl = await uploadToS3(
      processed.blur,
      `${userId}/blur/${fileName}.webp`
    );

    // Update database record
    const imageId = await findImageIdByKey(key);
    if (imageId) {
      await prisma.images.update({
        where: { id: imageId },
        data: {
          webpUrl,
          blurUrl,
        },
      });
      console.log(`Updated database record for: ${key}`);
    } else {
      console.warn(`Could not find database record for: ${key}`);
    }

    return true;
  } catch (error) {
    console.error(`Error processing image ${key}:`, error);
    return false;
  }
}

// Find image ID by S3 key
async function findImageIdByKey(key: string): Promise<string | null> {
  try {
    const image = await prisma.images.findFirst({
      where: {
        key,
      },
    });

    return image?.id || null;
  } catch (error) {
    console.error(`Error finding image by key ${key}:`, error);
    return null;
  }
}

// List all objects in the bucket with pagination
async function listAllObjects(): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(command);

    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key && object.Key.includes('/original/')) {
          keys.push(object.Key);
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

// Process images in batches to avoid memory issues
async function processImagesInBatches(keys: string[], batchSize = 10) {
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
