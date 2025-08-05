import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('InvoiceItems')
export class InvoicesItemsEntity {
  @PrimaryGeneratedColumn()
  pk_invoice_item_id: number;

  @Column()
  fk_invoice_id: number;

  @Column()
  fk_product_id: number;

  @Column()
  item_number: string;

  @Column()
  item_name: string;

  @Column()
  item_description: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unit_price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax_rate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  line_total: number;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
