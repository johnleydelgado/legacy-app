import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ProductionOrdersBodyColors')
export class ProductionOrdersBodyColorsEntity {
  @PrimaryGeneratedColumn()
  pk_production_orders_body_color_id: number;

  @Column()
  fk_production_order_item_id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column()
  fk_yarn_id: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ 
    type: 'enum', 
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updated_at: Date;
}