import { Entity, PrimaryGeneratedColumn, ForeignKey, Column } from 'typeorm';

@Entity('Contacts')
export class ContactsEntity {
  @PrimaryGeneratedColumn()
  pk_contact_id: number;

  @Column()
  fk_id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column()
  mobile_number: string;

  @Column()
  position_title: string;

  @Column()
  contact_type: string;

  @Column()
  table: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
