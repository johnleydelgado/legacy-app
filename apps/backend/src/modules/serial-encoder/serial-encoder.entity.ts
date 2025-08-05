import { Entity, PrimaryGeneratedColumn, ForeignKey, Column } from 'typeorm';

@Entity('SerialEncoder')
export class SerialEncoderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  purpose: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
