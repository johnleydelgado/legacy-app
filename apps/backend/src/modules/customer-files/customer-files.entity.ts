import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CustomersEntity } from '../customers/customers.entity';

@Entity('CustomerFiles')
export class CustomerFilesEntity {
  @PrimaryGeneratedColumn()
  pk_customer_file_id: number;

  @Column({ name: 'fk_customer_id' })
  fk_customer_id: number;

  @ManyToOne(() => CustomersEntity, (customer) => customer.pk_customer_id, {
    eager: false,
  })
  @JoinColumn({ name: 'fk_customer_id' })
  customer: CustomersEntity;

  @Column({ length: 255 })
  file_name: string;

  @Column({ type: 'text' })
  public_url: string;

  @Column({ length: 150 })
  mime_type: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploaded_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ type: 'json', nullable: true })
  metadata: any;
}
