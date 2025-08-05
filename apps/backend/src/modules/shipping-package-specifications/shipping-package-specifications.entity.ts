import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ShippingPackageSpecifications')
export class ShippingPackageSpecificationsEntity {
  @PrimaryGeneratedColumn()
  pk_shipping_package_spec_id: number;

  @Column()
  fk_shipping_order_id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, nullable: true })
  company_name: string;

  @Column({ length: 20, nullable: true })
  phone_number: string;

  @Column('decimal', { precision: 10, scale: 2 })
  length: number;

  @Column('decimal', { precision: 10, scale: 2 })
  width: number;

  @Column('decimal', { precision: 10, scale: 2 })
  height: number;

  @Column('decimal', { precision: 10, scale: 2 })
  weight: number;

  @Column({ type: 'enum', enum: ['metric', 'imperial'], default: 'metric' })
  measurement_unit: string;

  @Column({ nullable: true })
  fk_dimension_preset_id: number;

  @Column({ nullable: true })
  fk_weight_preset_id: number;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  zip: string;

  @Column({ length: 100, nullable: true })
  country: string;

  // Shipping rate fields
  @Column({ length: 100, nullable: true })
  carrier: string;

  @Column({ length: 100, nullable: true })
  service: string;

  @Column({ length: 255, nullable: true })
  carrier_description: string;

  @Column({ length: 100, nullable: true })
  shipping_rate_id: string;

  @Column({ length: 100, nullable: true })
  easypost_shipment_id: string;

  @Column({ length: 100, nullable: true })
  easypost_shipment_rate_id: string;

  @Column({ length: 255, nullable: true })
  tracking_code: string;

  @Column({ length: 255, nullable: true })
  label_url: string;

  @Column({ length: 30, nullable: true })
  shipment_status: string;

  @Column({ length: 100, nullable: true })
  estimated_delivery_days: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
