import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
}

export interface UploadOptions {
  file: Buffer;
  fileName: string;
  contentType: string;
  onProgress?: (progress: number) => void;
}

export interface VideoFile {
  key: string;
  name: string;
  size: number;
  lastModified: Date;
  url: string;
}

export class S3VideoUploader {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(config: S3Config) {
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucketName = config.bucketName;
    this.region = config.region;
  }

  async uploadVideo(options: UploadOptions): Promise<string> {
    const { file, fileName, contentType } = options;
    
    // Ensure the file is a video format
    if (!contentType.startsWith('video/')) {
      throw new Error('Only video files are allowed');
    }

    // Generate unique file name with timestamp to avoid conflicts
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `videos/${timestamp}-${sanitizedFileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        // Add metadata for better browser support
        Metadata: {
          'Content-Type': contentType,
        },
        // Set cache control for better performance
        CacheControl: 'max-age=31536000',
      });

      await this.s3Client.send(command);
      
      // Return the S3 URL with proper region formatting
      return this.constructVideoUrl(key);
    } catch (error) {
      throw new Error(`Failed to upload video: ${error}`);
    }
  }

  async listVideos(): Promise<VideoFile[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: 'videos/',
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Contents) {
        return [];
      }

      return response.Contents.map(object => ({
        key: object.Key!,
        name: object.Key!.split('/').pop()!.replace(/^\d+-/, ''), // Remove timestamp prefix from display name
        size: object.Size || 0,
        lastModified: object.LastModified || new Date(),
        url: this.constructVideoUrl(object.Key!),
      }));
    } catch (error) {
      throw new Error(`Failed to list videos: ${error}`);
    }
  }

  async deleteVideo(key: string): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(`Failed to delete video: ${error}`);
    }
  }

  private constructVideoUrl(key: string): string {
    // Use the standard S3 URL format that works better with CORS
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  // Test if a video URL is accessible
  async testVideoAccess(key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Video access test failed:', error);
      return false;
    }
  }
}

// Factory function for easy instantiation
export function createS3VideoUploader(config?: Partial<S3Config>): S3VideoUploader {
  const defaultConfig: S3Config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_S3_BUCKET_NAME || '',
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Validate required fields
  if (!finalConfig.accessKeyId || !finalConfig.secretAccessKey || !finalConfig.bucketName) {
    throw new Error('Missing required AWS configuration. Please check your environment variables.');
  }

  return new S3VideoUploader(finalConfig);
} 