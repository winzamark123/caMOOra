import {
  S3Client,
  PutObjectCommand,
  ListBucketsCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import prisma from '@prisma/prisma';
import sharp from 'sharp';

interface GetSignedURLProps {
  file_type: string;
  size: number;
  checksum: string;
  userId: string;
  photoAlbumId?: string;
}

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
  },
});

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');
const maxFileSize = 1024 * 1024 * 40; // 40MB
const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];

export async function getPresignedURL({
  file_type,
  size,
  checksum,
  userId,
  photoAlbumId,
}: GetSignedURLProps) {
  //check file types
  if (!acceptedTypes.includes(file_type)) {
    console.error('Invalid file type');
    return { error: 'Invalid file type' };
  }

  //check file size
  if (size > maxFileSize) {
    console.error('File size too large');
    return { error: 'File size too large' };
  }

  const generatedFileName = generateFileName();
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: `${userId}/original/${generatedFileName}`,
    ContentType: file_type,
    ContentLength: size,
    ChecksumSHA256: checksum,
    Metadata: {
      userId: userId,
    },
  });

  const signedURL = await getSignedUrl(s3, putObjectCommand, {
    expiresIn: 3600,
  });

  console.log('signedURL:', signedURL);

  try {
    const imageData: any = {
      userId: userId,
      originalUrl: `${process.env.AWS_CLOUDFRONT_URL}/${userId}/original/${generatedFileName}`,
      webpUrl: `${process.env.AWS_CLOUDFRONT_URL}/${userId}/placeholder/${generatedFileName}.webp`,
      blurUrl: `${process.env.AWS_CLOUDFRONT_URL}/${userId}/blur/${generatedFileName}.webp`,
      key: `${userId}/original/${generatedFileName}`,
    };

    // If photoAlbumID is provided, add it to the imageData object (Profile Pic doesn't have photoAlbumId)
    if (photoAlbumId) {
      imageData.PhotoAlbumId = photoAlbumId;
    }

    const images_result = await prisma.images.create({
      data: imageData,
    });
    // console.log('images_result:', images_result);
    return {
      success: {
        signed_url: signedURL,
        image_id: images_result.id,
        file_name: generatedFileName,
      },
    };
  } catch (error) {
    console.error('Failed to create image record in database', error);
    return { error: 'Failed to create image record in database' };
  }
}

interface ProcessedImages {
  original: Buffer;
  placeholder: Buffer;
  blur: Buffer;
}

async function processImage(buffer: Buffer): Promise<ProcessedImages> {
  // Create WebP version - optimized for web viewing
  const placeholder = await sharp(buffer)
    .webp({ quality: 80, effort: 4 })
    .toBuffer();

  // Create blur version for lazy loading
  const blur = await sharp(buffer)
    .blur(30)
    .webp({ quality: 10, effort: 1 })
    .toBuffer();

  return {
    original: buffer,
    placeholder,
    blur,
  };
}

async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3.send(putObjectCommand);
  return `${process.env.AWS_CLOUDFRONT_URL}/${key}`;
}

// TODO: edit s3 bucket policy for production (only allow access to specific userId folders)
// New function to handle post-upload processing
export async function processUploadedImage(userId: string, fileName: string) {
  try {
    // Get the original image from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
      Key: `${userId}/original/${fileName}`,
    });

    const response = await s3.send(getObjectCommand);
    const buffer = await response.Body?.transformToByteArray();

    if (!buffer) {
      throw new Error('Failed to get image buffer');
    }

    // Process the image
    const processed = await processImage(Buffer.from(buffer));

    // Upload processed versions
    await Promise.all([
      uploadToS3(
        processed.placeholder,
        `${userId}/placeholder/${fileName}.webp`,
        'image/webp'
      ),
      uploadToS3(
        processed.blur,
        `${userId}/blur/${fileName}.webp`,
        'image/webp'
      ),
    ]);

    return true;
  } catch (error) {
    console.error('Failed to process uploaded image:', error);
    return false;
  }
}

export async function testAWSCredentials() {
  try {
    console.log('Testing AWS Credentials');
    console.log('AWS_S3_REGION:', process.env.AWS_S3_REGION);
    console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
    console.log('AWS_SECRET_ACCESS_KEY', process.env.AWS_SECRET_ACCESS_KEY);

    const s3 = new S3Client({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
      },
    });

    const result = await s3.send(new ListBucketsCommand({}));
    console.log('S3 Buckets:', result.Buckets);
  } catch (error) {
    console.error('Error accessing S3:', error);
  }
}
