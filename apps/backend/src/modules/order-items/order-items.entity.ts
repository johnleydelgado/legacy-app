import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('OrderItems')
export class OrderItemsEntity {
  @PrimaryGeneratedColumn()
  pk_order_item_id: number;

  @Column()
  fk_order_id: number;

  @Column()
  fk_product_id: number;

  @Column()
  fk_shipping_address_id: number;

  @Column()
  fk_packaging_id: number;

  @Column()
  fk_trim_id: number;

  @Column()
  fk_yarn_id: number;

  @Column()
  item_number: string;

  @Column()
  item_name: string;

  @Column()
  item_description: string;

  @Column()
  artwork_url: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unit_price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax_rate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  line_total: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
