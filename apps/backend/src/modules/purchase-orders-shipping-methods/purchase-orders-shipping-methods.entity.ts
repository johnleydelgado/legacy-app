import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PurchaseOrderShippingMethods')
export class PurchaseOrdersShippingMethodsEntity {
  @PrimaryGeneratedColumn()
  pk_po_shipping_method_id: number;

  @Column({ length: 191 })
  name: string;

  @Column({ length: 191 })
  color: string;

  @Column({ type: 'json' })
  transaction_type: any;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
