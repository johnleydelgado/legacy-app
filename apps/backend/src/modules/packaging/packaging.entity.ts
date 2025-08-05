import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductsCategoryEntity } from '../products-category/products-category.entity';

@Entity('Packaging')
export class PackagingEntity {
  @PrimaryGeneratedColumn()
  pk_packaging_id: number;

  @Column()
  packaging: string;

  @Column()
  instruction: string;
}
