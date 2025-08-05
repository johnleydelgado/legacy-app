import { Entity, PrimaryGeneratedColumn, ForeignKey, Column } from 'typeorm';
import { FKItemType, Type } from './image-gallery.enum';

@Entity('ImageGallery')
export class ImageGalleryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fk_item_id: number;

  @Column({ type: 'enum', enum: FKItemType, default: FKItemType.QUOTES })
  fk_item_type: string;

  @Column()
  url: string;

  @Column()
  filename: string;

  @Column()
  file_extension: string;

  @Column({ type: 'enum', enum: Type, default: Type.OTHER })
  type: Type;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
