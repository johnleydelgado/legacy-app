import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ShippingWeightPresets')
export class ShippingWeightPresetsEntity {
  @PrimaryGeneratedColumn()
  pk_weight_preset_id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  weight: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ['metric', 'imperial'],
    default: 'imperial',
  })
  measurement_unit: 'metric' | 'imperial';

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
