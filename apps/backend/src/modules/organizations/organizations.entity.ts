import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Organizations')
export class OrganizationsEntity {
  @PrimaryGeneratedColumn()
  pk_organization_id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  industry: string;

  @Column()
  website_url: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

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
  logo_image_url: string;

  @Column()
  notes: string;

  @Column()
  tags: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
