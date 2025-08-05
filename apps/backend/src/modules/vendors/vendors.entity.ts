import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProductsEntity } from '../products/products.entity';


export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED'
}

@Entity('Vendors')
export class VendorsEntity {
  @PrimaryGeneratedColumn()
  pk_vendor_id: number;

  @Column()
  fk_vendor_type_id: number;
  
  @Column()
  fk_vendor_service_category_id: number;

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.ACTIVE,
  })
  status: VendorStatus;

  @Column({ length: 191 })
  name: string;

  @Column({ length: 191, nullable: true })
  location: string;

  @Column({ length: 191, nullable: true })
  email: string;

  @Column({ length: 30, nullable: true })
  phone_number: string;

  @Column({ type: 'text', nullable: true })
  website_url: string;

  @Column({ type: 'text', nullable: true })
  billing_address: string;

  @Column({ type: 'text', nullable: true })
  shipping_address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 50, nullable: true })
  postal_code: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 100, nullable: true })
  industry: string;

  @Column({ length: 50, nullable: true })
  vat_number: string;

  @Column({ length: 50, nullable: true })
  tax_id: string;

  @Column('json', { nullable: true })
  tags: any;

  @Column('text', { nullable: true })
  notes: string;

  @Column()
  user_owner: string;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => ProductsEntity, (product) => product.vendor)
  products: ProductsEntity[];
}
