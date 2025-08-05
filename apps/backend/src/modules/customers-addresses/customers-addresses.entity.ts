import { Entity, PrimaryGeneratedColumn, ForeignKey, Column } from 'typeorm';

@Entity('Addresses')
export class CustomersAddressesEntity {
  @PrimaryGeneratedColumn()
  pk_address_id: number;

  @Column()
  fk_customer_id: number;

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
