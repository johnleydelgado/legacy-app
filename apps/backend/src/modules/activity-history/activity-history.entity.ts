import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Activities')
export class ActivityHistoryEntity {
  @PrimaryGeneratedColumn()
  pk_activity_id: number;

  @Column()
  fk_customer_id: number;

  @Column()
  status: number;

  @Column({ type: 'tinyblob' })
  tags: Buffer | null;

  @Column()
  activity: string;

  @Column()
  activity_type: string;

  @Column()
  document_id: number;

  @Column()
  document_type: string;

  @Column()
  user_owner: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
