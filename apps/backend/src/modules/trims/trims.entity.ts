import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductsCategoryEntity } from '../products-category/products-category.entity';

@Entity('Trims')
export class TrimsEntity {
  @PrimaryGeneratedColumn()
  pk_trim_id: number;

  @Column()
  trim: string;
}
