import { Entity, PrimaryGeneratedColumn, ForeignKey, Column } from 'typeorm';

@Entity('Quotes')
export class QuotesEntity {
  @PrimaryGeneratedColumn()
  pk_quote_id: number;

  @Column()
  fk_customer_id: number;

  @Column()
  fk_status_id: number;

  @Column()
  fk_serial_encoder_id: number;

  @Column()
  quote_number: string;

  @Column()
  quote_date: Date;

  @Column()
  expiration_date: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax_total: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column()
  currency: string;

  @Column()
  notes: string;

  @Column()
  terms: string;

  @Column()
  tags: string;

  @Column()
  user_owner: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
