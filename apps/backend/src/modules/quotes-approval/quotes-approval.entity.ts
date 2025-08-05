import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('QuotesApproval')
export class QuotesApprovalEntity {
  @PrimaryGeneratedColumn({ name: 'pk_quote_approval_id' })
  id: number;

  @Column({ name: 'fk_quote_id', type: 'bigint', unsigned: true })
  quoteId: number;

  @Column({ name: 'fk_customer_id', type: 'bigint', unsigned: true })
  customerId: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string;

  @Column({ name: 'token_hash', type: 'char', length: 64 })
  tokenHash: string;

  @Column({ type: 'json', nullable: true })
  payload: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
