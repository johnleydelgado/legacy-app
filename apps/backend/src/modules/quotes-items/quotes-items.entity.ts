import { Entity, PrimaryGeneratedColumn, ForeignKey, Column } from 'typeorm';

@Entity('QuoteItems')
export class QuotesItemsEntity {
  @PrimaryGeneratedColumn()
  pk_quote_item_id: number;

  @Column()
  fk_quote_id: number;

  @Column()
  fk_product_id: number;

  @Column()
  fk_packaging_id: number;

  @Column()
  fk_trim_id: number;

  @Column()
  fk_yarn_id: number;

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
