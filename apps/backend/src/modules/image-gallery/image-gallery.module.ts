import { Module } from '@nestjs/common';
import { S3Module } from '../s3/s3.module';
import { DatabaseModule } from '../../database/database.module';
import { ImageGalleryController } from './image-gallery.controller';
import { ImageGalleryProvider } from './image-gallery.provider';
import { ImageGalleryService } from './image-gallery.service';

@Module({
  imports: [
    DatabaseModule,
    S3Module,
  ],
  controllers: [
    ImageGalleryController,
  ],
  providers: [
    ...ImageGalleryProvider,
    ImageGalleryService
  ],
  exports: [
    ImageGalleryService
  ]
})
export class ImageGalleryModule {}
