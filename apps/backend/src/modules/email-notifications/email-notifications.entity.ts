import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('EmailNotifications')
export class EmailNotificationsEntity {
  @PrimaryGeneratedColumn()
  pk_email_notification_id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email_address: string;

  @Column({
    type: 'enum',
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status: 'Active' | 'Inactive';

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 3 })
  updated_at: Date;
}
