import { DataSource } from 'typeorm';
import { ImageGalleryEntity } from './image-gallery.entity';


export const ImageGalleryProvider = [
  {
    provide: 'IMAGE_GALLERY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ImageGalleryEntity),
    inject: ['DATA_SOURCE'],
  },
];
