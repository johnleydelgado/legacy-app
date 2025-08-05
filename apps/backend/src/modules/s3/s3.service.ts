import { Injectable, Logger } from '@nestjs/common';
import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';


@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private readonly logger = new Logger(S3Service.name);
  private readonly objectPrefix = 'image-gallery-items/';

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET');

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      this.logger.error('Missing AWS configuration');
      throw new Error('Missing AWS configuration. Please check your environment variables.');
    }

    this.bucket = bucketName;

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{
    url: string;
    filename: string;
    file_extension: string;
  }> {
    try {
      // Same file upload logic...
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;
      const fullPath = `${this.objectPrefix}${filename}`;

      // Upload without ACL
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: fullPath,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });

      await upload.done();

      // Generate a presigned URL instead of a direct URL
      const url = await this.getSignedUrl(fullPath, 604800); // 7 days expiry

      return {
        url,
        filename: fullPath,
        file_extension: fileExtension.substring(1)
      };
    } catch (error) {
      this.logger.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  // Method to generate a presigned URL for private files
  async getSignedUrl(filename: string, expiresIn = 3600): Promise<string> {
    try {
      const key = filename.startsWith(this.objectPrefix)
        ? filename
        : `${this.objectPrefix}${filename}`;

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      // Check if the filename already includes the prefix
      const key = filename.startsWith(this.objectPrefix)
        ? filename
        : `${this.objectPrefix}${filename}`;

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
    } catch (error) {
      this.logger.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file from S3');
    }
  }
}
