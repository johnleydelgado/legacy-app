import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductsEntity } from '../products/products.entity';

@Entity('ProductPrices')
export class ProductPricesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  max_qty: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'fk_product_id' })
  fk_product_id: number;

  @ManyToOne(() => ProductsEntity, (product) => product.pk_product_id, {
    eager: false,
  })
  @JoinColumn({ name: 'fk_product_id' })
  ['product']: ProductsEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
