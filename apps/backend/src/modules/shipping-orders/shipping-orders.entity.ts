import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ShippingOrders')
export class ShippingOrdersEntity {
  @PrimaryGeneratedColumn()
  pk_shipping_order_id: number;

  @Column()
  fk_customer_id: number;

  @Column()
  fk_status_id: number;

  @Column({ nullable: true })
  fk_order_id: number;

  @Column({ nullable: true })
  fk_serial_encoder_id: number;

  @Column({ nullable: true })
  shipping_order_number: string;

  @Column({ type: 'date' })
  order_date: Date;

  @Column({ type: 'date', nullable: true })
  expected_ship_date: Date;

  @Column('decimal', { precision: 12, scale: 2, default: 0.0 })
  subtotal: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0.0 })
  tax_total: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0.0 })
  total_amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  insurance_value: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column('text', { nullable: true })
  terms: string;

  @Column('json', { nullable: true })
  tags: any;

  @Column({ nullable: true })
  user_owner: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
