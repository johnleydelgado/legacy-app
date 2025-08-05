import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Invoices')
export class InvoicesEntity {
  @PrimaryGeneratedColumn()
  pk_invoice_id: number;

  @Column()
  fk_customer_id: number;

  @Column()
  fk_status_id: number;

  @Column()
  fk_serial_encoder_id: number;

  @Column()
  invoice_number: string;

  @Column()
  invoice_date: Date;

  @Column()
  due_date: Date;

  @Column()
  subtotal: number;

  @Column()
  tax_total: number;

  @Column()
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

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
