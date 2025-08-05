import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

export enum PurchaseOrderPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW',
}

@Entity('PurchaseOrders')
export class PurchaseOrdersEntity {
  @PrimaryGeneratedColumn()
  pk_purchase_order_id: number;

  @Column()
  fk_serial_encoder_id: number;

  @Column()
  fk_customer_id: number;

  @Column()
  fk_vendor_id: number;

  @Column()
  fk_factory_id: number;

  @Column()
  fk_location_type_id: number;

  @Column()
  fk_lead_numbers_id: number;

  @Column()
  fk_shipping_method_id: number;

  @Column()
  purchase_order_number: string;

  @Column()
  status: number;

  @Column()
  priority: PurchaseOrderPriority;

  @Column()
  client_name: string;

  @Column()
  client_description: string;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  quote_approved_date: Date;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  pd_signed_date: Date;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  shipping_date: Date;

  @Column()
  total_quantity: number;

  @Column()
  notes: string;

  @Column('json', { nullable: true })
  tags: any;

  @Column()
  user_owner: string;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
