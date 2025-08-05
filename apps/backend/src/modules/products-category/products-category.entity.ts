import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ProductCategory')
export class ProductsCategoryEntity {
  @PrimaryGeneratedColumn({ name: 'pk_product_category_id' })
  pk_product_category_id: number;

  @Column({ name: 'category_name' })
  category_name: string;

  @Column({ name: 'description' })
  description: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
