import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ShippingPackageSpecItems')
export class ShippingPackageSpecItemsEntity {
  @PrimaryGeneratedColumn()
  pk_sp_item_id: number;

  @Column()
  fk_shipping_package_spec_id: number;

  @Column()
  fk_shipping_order_item_id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  qty: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
