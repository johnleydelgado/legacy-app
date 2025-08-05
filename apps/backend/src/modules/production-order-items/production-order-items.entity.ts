import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ProductionOrderItems')
export class ProductionOrderItemsEntity {
  @PrimaryGeneratedColumn()
  pk_production_order_item_id: number;

  @Column({ type: 'int', nullable: false })
  fk_production_order_id: number;

  @Column({ type: 'int', unsigned: true, nullable: false })
  fk_product_id: number;

  @Column({ type: 'int', unsigned: true, nullable: false })
  fk_category_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  item_name: string;

  @Column({ type: 'text', nullable: true })
  item_description: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  item_number: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size: string | null;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  unit_price: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    generatedType: 'STORED',
    asExpression: 'quantity * unit_price',
  })
  total: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.0 })
  tax_rate: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // Related data IDs (not stored in database, computed at runtime)
  knitcolors_production_order?: number[];
  body_production_order_color?: number[];
  packaging_production_order?: number[];
}
