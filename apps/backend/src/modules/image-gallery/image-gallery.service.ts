import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ImageGalleryEntity } from './image-gallery.entity';
import { CreateImageGalleryDto, UpdateImageGalleryDto, CreateImageGalleryUrlDto } from './image-gallery.dto';
import { S3Service } from '../s3/s3.service';

// Define interface for S3 upload result
interface S3UploadResult {
  url: string;
  filename: string;
  file_extension: string;
}

@Injectable()
export class ImageGalleryService {
  private readonly logger = new Logger(ImageGalleryService.name);

  constructor(
    @Inject('IMAGE_GALLERY_REPOSITORY')
    private imageGalleryRepository: Repository<ImageGalleryEntity>,
    private s3Service: S3Service,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.imageGalleryRepository, options);
  }

  findOne(id: number): Promise<ImageGalleryEntity | null> {
    return this.imageGalleryRepository.findOne({ where: { id } });
  }

  async create(
    file: Express.Multer.File,
    imageGalleryDto: CreateImageGalleryDto
  ): Promise<ImageGalleryEntity> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const newImageGallery = new ImageGalleryEntity();

    try {
      // Upload file to AWS S3
      const uploadResult: S3UploadResult = await this.s3Service.uploadFile(file);

      // Set properties from upload result
      newImageGallery.url = uploadResult.url;
      newImageGallery.filename = uploadResult.filename;
      newImageGallery.file_extension = uploadResult.file_extension;

      // Set properties from DTO
      newImageGallery.fk_item_id = parseInt(imageGalleryDto.fkItemID, 10);
      newImageGallery.fk_item_type = imageGalleryDto.fkItemType;
      newImageGallery.type = imageGalleryDto.type;

      // Set timestamps
      newImageGallery.created_at = new Date();
      newImageGallery.updated_at = new Date();

      // Save to database
      return this.imageGalleryRepository.save(newImageGallery);
    } catch (error) {
      this.logger.error('Error creating image gallery entry:', error);
      throw new BadRequestException('Failed to upload file: ' + error.message);
    }
  }

  async createFromUrl(imageGalleryUrlDto: CreateImageGalleryUrlDto): Promise<ImageGalleryEntity> {
    const newImageGallery = new ImageGalleryEntity();

    try {
      // Extract filename and extension from URL
      const urlParts = imageGalleryUrlDto.url.split('/');
      const filenameWithExtension = urlParts[urlParts.length - 1];
      const filenameParts = filenameWithExtension.split('.');
      const fileExtension = filenameParts.length > 1 ? filenameParts[filenameParts.length - 1] : 'jpg';
      const filename = filenameWithExtension;

      // Set properties from URL DTO
      newImageGallery.url = imageGalleryUrlDto.url;
      newImageGallery.filename = filename;
      newImageGallery.file_extension = fileExtension;
      newImageGallery.fk_item_id = imageGalleryUrlDto.fkItemID;
      newImageGallery.fk_item_type = imageGalleryUrlDto.fkItemType;
      newImageGallery.type = imageGalleryUrlDto.type;

      // Set timestamps
      newImageGallery.created_at = new Date();
      newImageGallery.updated_at = new Date();

      // Save to database
      return this.imageGalleryRepository.save(newImageGallery);
    } catch (error) {
      this.logger.error('Error creating image gallery entry from URL:', error);
      throw new BadRequestException('Failed to create image gallery entry: ' + error.message);
    }
  }

  async remove(id: number) {
    // Get the image record first to get the filename
    const image = await this.findOne(id);
    if (image) {
      try {
        // Delete the file from S3
        await this.s3Service.deleteFile(image.filename);
        // Delete the record from the database
        return await this.imageGalleryRepository.delete(id);
      } catch (error) {
        this.logger.error(`Error removing image with id ${id}:`, error);
        throw new BadRequestException('Failed to delete image: ' + error.message);
      }
    }
    return { affected: 0 };
  }

  async update(id: number, updateImageGalleryDto: UpdateImageGalleryDto, file?: Express.Multer.File) {
    const toUpdate = await this.imageGalleryRepository.findOne({ where: { id } });

    if (!toUpdate) {
      throw new BadRequestException(`Image with id ${id} not found`);
    }

    try {
      // Initialize with null but with the correct type
      let uploadResult: S3UploadResult | null = null;

      // If a new file is provided, upload it and update the file information
      if (file) {
        // Delete the old file from S3
        await this.s3Service.deleteFile(toUpdate.filename);

        // Upload the new file
        uploadResult = await this.s3Service.uploadFile(file);
      }

      const updated = Object.assign(toUpdate, {
        ...updateImageGalleryDto,
        ...(uploadResult && {
          url: uploadResult.url,
          filename: uploadResult.filename,
          file_extension: uploadResult.file_extension,
        }),
        updated_at: new Date()
      });

      return await this.imageGalleryRepository.save(updated);
    } catch (error) {
      this.logger.error(`Error updating image with id ${id}:`, error);
      throw new BadRequestException('Failed to update image: ' + error.message);
    }
  }

  async findByItem(
    fkItemID: string,
    fkItemType: string,
    options: IPaginationOptions
  ) {
    const queryBuilder = this.imageGalleryRepository.createQueryBuilder('image_gallery');

    queryBuilder.where(
      'image_gallery.fk_item_id = :fkItemID AND image_gallery.fk_item_type = :fkItemType',
      {
        fkItemID: parseInt(fkItemID, 10),
        fkItemType
      }
    );

    queryBuilder.orderBy('image_gallery.created_at', 'DESC');

    return paginate(queryBuilder, options);
  }
}

