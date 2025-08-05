import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';


@Entity('PurchaseOrdersItems')
export class PurchaseOrdersItemsEntity {
  @PrimaryGeneratedColumn()
  pk_purchase_order_item_id: number;

  @Column()
  fk_purchase_order_id: number;

  @Column()
  fk_product_id: number; 

  @Column()
  item_number: string;

  @Column()
  item_sku: number;

  @Column()
  item_name: string;

  @Column()
  item_description: string;

  @Column('json', { nullable: true })
  item_specifications: any;

  @Column()
  item_notes: string;

  @Column('json', { nullable: true })
  packaging_instructions: any;

  @Column()
  quantity: number; 

  @Column('decimal', { precision: 10, scale: 2 })
  unit_price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  rate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  line_total: number;

  @Column()
  currency: string;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
