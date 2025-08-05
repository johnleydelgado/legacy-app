import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ActivityTypes')
export class ActivityTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type_name: string;

  @Column()
  color: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
