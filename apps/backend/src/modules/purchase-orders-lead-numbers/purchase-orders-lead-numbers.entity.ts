import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PurchaseOrderLeadNumbers')
export class PurchaseOrdersLeadNumbersEntity {
  @PrimaryGeneratedColumn()
  pk_po_lead_number_id: number;

  @Column({ length: 191 })
  name: string;

  @Column({ length: 191 })
  color: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
