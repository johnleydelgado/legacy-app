import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProductsCategoryEntity } from '../products-category/products-category.entity';
import { ProductPricesEntity } from '../product-prices/product-prices.entity';
import { VendorsEntity } from '../vendors/vendors.entity';

@Entity('Products')
export class ProductsEntity {
  @PrimaryGeneratedColumn()
  pk_product_id: number;

  @Column()
  fk_organization_id: number;

  @Column({ name: 'fk_category_id' })
  fk_category_id: number;

  @ManyToOne(
    () => ProductsCategoryEntity,
    (cat) => cat.pk_product_category_id,
    { eager: false },
  )
  @JoinColumn({ name: 'fk_category_id' })
  ['product_category']: ProductsCategoryEntity;

  @OneToMany(() => ProductPricesEntity, (price) => price.fk_product_id, {
    eager: false,
  })
  ['product_prices']: ProductPricesEntity[];

  @Column()
  inventory: number;

  @Column()
  style: string;

  @Column()
  product_name: string;

  @Column()
  status: string;

  @Column()
  product_price: number;

  @Column()
  image_url: string;

  @Column({ type: 'json', nullable: true })
  image_urls: string[];

  @Column()
  sku: string;

  @Column()
  yarn: string;

  @Column()
  trims: string;

  @Column()
  packaging: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ name: 'fk_vendor_id', nullable: true })
  fk_vendor_id: number;

  @ManyToOne(() => VendorsEntity, (vendor) => vendor.products)
  @JoinColumn({ name: 'fk_vendor_id' })
  vendor: VendorsEntity;
}
