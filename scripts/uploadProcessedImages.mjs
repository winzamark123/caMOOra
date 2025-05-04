// scripts/uploadProcessedImages.mjs
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import lodash from 'lodash';

dotenv.config({ path: '.env.local' });

const { chunk } = lodash;

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID_CLI,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY_CLI,
  },
});

// Upload file to S3
async function uploadToS3(filePath, key) {
  try {
    const fileContent = fs.readFileSync(filePath);

    const contentType = key.endsWith('.webp') ? 'image/webp' : 'image/jpeg';

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    });

    await s3.send(putObjectCommand);
    return `${process.env.AWS_CLOUDFRONT_URL}/${key}`;
  } catch (error) {
    console.error(`Error uploading file ${filePath} to S3:`, error);
    throw error;
  }
}

// Download original file from S3
async function downloadOriginalFromS3(key) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3.send(command);
    return await response.Body?.transformToByteArray();
  } catch (error) {
    console.error(`Error downloading original file ${key}:`, error);
    return null;
  }
}

// Check if an object exists in S3
async function checkExists(key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

// Process a single user directory
async function processUserDirectory(userId) {
  console.log(`Processing directory for user: ${userId}`);
  const userDir = path.resolve(`./processed-images/${userId}`);

  // Skip if not a directory
  if (!fs.statSync(userDir).isDirectory()) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  // Get all webp files (not blur files)
  const files = fs
    .readdirSync(userDir)
    .filter((file) => file.endsWith('.webp') && !file.endsWith('-blur.webp'));

  console.log(`Found ${files.length} webp files for user ${userId}`);

  for (const file of files) {
    try {
      const hashName = file.replace('.webp', '');
      const originalKeyOld = `${userId}/${hashName}`; // Old format
      const originalKey = `${userId}/original/${hashName}`; // New format
      const webpFilePath = path.resolve(userDir, file);
      const blurFilePath = path.resolve(userDir, `${hashName}-blur.webp`);

      // Check if blur file exists
      if (!fs.existsSync(blurFilePath)) {
        console.error(`Missing blur file for ${hashName}`);
        failed++;
        continue;
      }

      // Check if the original exists in S3 (old or new format)
      let originalExists = await checkExists(originalKeyOld);

      if (originalExists) {
        // Download the original file from its current location
        const originalBuffer = await downloadOriginalFromS3(originalKeyOld);
        if (originalBuffer) {
          // Create temporary file
          const tempFilePath = path.resolve(`./temp-${hashName}`);
          fs.writeFileSync(tempFilePath, Buffer.from(originalBuffer));

          // Upload to new location
          console.log(`Uploading original to: ${originalKey}`);
          await uploadToS3(tempFilePath, originalKey);

          // Clean up temp file
          fs.unlinkSync(tempFilePath);
        } else {
          console.error(`Failed to download original file: ${originalKeyOld}`);
          failed++;
          continue;
        }
      } else {
        // Check if it already exists in the new format
        originalExists = await checkExists(originalKey);
        if (!originalExists) {
          console.warn(
            `Original file does not exist in either location: ${originalKeyOld}`
          );
          // Continue anyway since we still want to upload the processed versions
        }
      }

      // Upload both processed files to S3
      console.log(
        `Uploading placeholder to: ${userId}/placeholder/${hashName}.webp`
      );
      await uploadToS3(webpFilePath, `${userId}/placeholder/${hashName}.webp`);

      console.log(`Uploading blur to: ${userId}/blur/${hashName}.webp`);
      await uploadToS3(blurFilePath, `${userId}/blur/${hashName}.webp`);

      processed++;
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
      failed++;
    }
  }

  return { processed, failed };
}

// Process directories in batches
async function processDirectoriesInBatches(userIds, batchSize = 5) {
  const batches = chunk(userIds, batchSize);
  let totalProcessed = 0;
  let totalFailed = 0;

  console.log(
    `Processing ${userIds.length} user directories in ${batches.length} batches`
  );

  for (let i = 0; i < batches.length; i++) {
    console.log(`Processing batch ${i + 1}/${batches.length}`);

    const results = await Promise.all(
      batches[i].map((userId) => processUserDirectory(userId))
    );

    // Aggregate results
    results.forEach((result) => {
      totalProcessed += result.processed;
      totalFailed += result.failed;
    });

    console.log(`Progress: ${totalProcessed} processed, ${totalFailed} failed`);
  }

  return { processed: totalProcessed, failed: totalFailed };
}

// Main function
async function main() {
  try {
    console.log(
      'Starting upload of processed images with new folder structure...'
    );

    // Get all user directories
    const processedImagesDir = path.resolve('./processed-images');
    const userIds = fs
      .readdirSync(processedImagesDir)
      .filter((item) =>
        fs.statSync(path.join(processedImagesDir, item)).isDirectory()
      );

    console.log(`Found ${userIds.length} user directories`);

    // Process all directories
    const { processed, failed } = await processDirectoriesInBatches(userIds);

    console.log('Upload complete!');
    console.log(`Successfully processed: ${processed}`);
    console.log(`Failed: ${failed}`);
  } catch (error) {
    console.error('Script failed:', error);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
