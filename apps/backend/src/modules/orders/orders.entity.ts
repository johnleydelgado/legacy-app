import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Orders')
export class OrdersEntity {
  @PrimaryGeneratedColumn()
  pk_order_id: number;

  @Column()
  fk_customer_id: number;

  @Column()
  fk_status_id: number;

  @Column()
  fk_serial_encoder_id: number;

  @Column()
  order_number: string;

  @Column()
  order_date: Date;

  @Column()
  delivery_date: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax_total: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column()
  currency: string;

  @Column()
  notes: string;

  @Column()
  terms: string;

  @Column()
  tags: string;

  @Column()
  user_owner: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
