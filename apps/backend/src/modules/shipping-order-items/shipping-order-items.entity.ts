import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ShippingOrderItems')
export class ShippingOrderItemsEntity {
  @PrimaryGeneratedColumn()
  pk_shipping_order_item_id: number;

  @Column()
  fk_shipping_order_id: number;

  @Column({ nullable: true })
  fk_product_id: number;

  @Column({ nullable: true })
  fk_packaging_id: number;

  @Column({ nullable: true })
  fk_trim_id: number;

  @Column({ nullable: true })
  fk_yarn_id: number;

  @Column({ nullable: true })
  item_number: string;

  @Column()
  item_name: string;

  @Column('text', { nullable: true })
  item_description: string;

  @Column('decimal', { precision: 10, scale: 2, default: 1.0 })
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0.0 })
  unit_price: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0.0, nullable: true })
  tax_rate: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
