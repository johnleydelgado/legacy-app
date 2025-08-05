import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { ProductionOrderItemsEntity } from '../production-order-items/production-order-items.entity';
import { PackagingEntity } from '../packaging/packaging.entity';

@Entity('ProductionOrdersPackaging')
@Unique('uk_production_order_item_packaging', ['fk_production_order_item_id', 'fk_packaging_id'])
export class ProductionOrdersPackagingEntity {
  @PrimaryGeneratedColumn()
  pk_production_orders_packaging_id: number;

  @Column({ type: 'int', nullable: false })
  @Index('idx_production_orders_packaging_item')
  fk_production_order_item_id: number;

  @Column({ type: 'int', nullable: false })
  @Index('idx_production_orders_packaging_packaging')
  fk_packaging_id: number;

  // Relations
  @ManyToOne(() => ProductionOrderItemsEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'fk_production_order_item_id' })
  productionOrderItem: ProductionOrderItemsEntity;

  @ManyToOne(() => PackagingEntity, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'fk_packaging_id' })
  packaging: PackagingEntity;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updated_at: Date;
}