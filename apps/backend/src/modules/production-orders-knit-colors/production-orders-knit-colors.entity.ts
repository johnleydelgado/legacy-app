import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ProductionOrdersKnitColors')
export class ProductionOrdersKnitColorsEntity {
  @PrimaryGeneratedColumn({ name: 'pk_production_orders_knit_color_id' })
  pk_production_orders_knit_color_id: number;

  @Column({ name: 'fk_production_order_item_id', type: 'int', nullable: false })
  fk_production_order_item_id: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'fk_yarn_id', type: 'int', nullable: false })
  fk_yarn_id: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ 
    name: 'status',
    type: 'enum', 
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  })
  status: 'ACTIVE' | 'INACTIVE';

  @Column({ 
    name: 'created_at',
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  created_at: Date;

  @Column({ 
    name: 'updated_at',
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updated_at: Date;
}