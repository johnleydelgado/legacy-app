import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Addresses')
export class AddressesEntity {
  @PrimaryGeneratedColumn()
  pk_address_id: number;

  @Column()
  fk_id: number;

  @Column({ length: 100 })
  address1: string;

  @Column({ length: 100, nullable: true })
  address2: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 20 })
  state: string;

  @Column({ length: 50 })
  zip: string;

  @Column({ length: 20 })
  country: string;

  @Column({ type: 'enum', enum: ['BILLING', 'SHIPPING'] })
  address_type: string;

  @Column({ length: 30 })
  table: string;
}
