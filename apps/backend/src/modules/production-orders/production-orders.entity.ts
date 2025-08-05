import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum ProductionOrderShippingMethod {
  OCEAN = 'OCEAN',
  AIR = 'AIR',
  GROUND = 'GROUND',
  EXPRESS = 'EXPRESS',
}

export enum ProductionOrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('ProductionOrders')
export class ProductionOrdersEntity {
  @PrimaryGeneratedColumn()
  pk_production_order_id: number;

  @Column()
  fk_customer_id: number;

  @Column()
  fk_factory_id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  po_number: string;

  @Column({ type: 'date' })
  order_date: Date;

  @Column({ type: 'date' })
  expected_delivery_date: Date;

  @Column({ type: 'date', nullable: true })
  actual_delivery_date: Date | null;

  @Column({
    type: 'enum',
    enum: ProductionOrderShippingMethod,
    default: ProductionOrderShippingMethod.OCEAN,
  })
  shipping_method: ProductionOrderShippingMethod;

  @Column({
    type: 'enum',
    enum: ProductionOrderStatus,
    default: ProductionOrderStatus.PENDING,
  })
  status: ProductionOrderStatus;

  @Column({ type: 'int', default: 0 })
  total_quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  user_owner: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
