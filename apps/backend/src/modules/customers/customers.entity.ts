import { Entity, PrimaryGeneratedColumn, ForeignKey, Column } from 'typeorm';

@Entity('Customers')
export class CustomersEntity {
  @PrimaryGeneratedColumn()
  pk_customer_id: number;

  @Column()
  fk_organization_id: number;

  @Column()
  name: string;

  @Column()
  owner_name: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column()
  mobile_number: string;

  @Column()
  website_url: string;

  @Column()
  billing_address: string;

  @Column()
  shipping_address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  postal_code: string;

  @Column()
  country: string;

  @Column()
  industry: string;

  @Column()
  customer_type: string;

  @Column()
  status: string;

  @Column()
  source: string;

  @Column()
  converted_at: Date;

  @Column()
  notes: string;

  @Column()
  vat_number: string;

  @Column()
  tax_id: string;

  @Column()
  tags: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
