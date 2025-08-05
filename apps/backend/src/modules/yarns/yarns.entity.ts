import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductsCategoryEntity } from '../products-category/products-category.entity';

@Entity('Yarn')
export class YarnEntity {
  @PrimaryGeneratedColumn()
  pk_yarn_id: number;

  @Column()
  yarn_color: string;

  @Column()
  card_number: string;

  @Column()
  color_code: string;

  @Column()
  yarn_type: string;
}
