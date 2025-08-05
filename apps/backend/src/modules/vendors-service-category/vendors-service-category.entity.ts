import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('VendorServiceCategory')
export class VendorsServiceCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 191 })
  name: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
