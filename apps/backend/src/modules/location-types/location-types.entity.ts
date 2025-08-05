import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('LocationTypes')
export class LocationTypesEntity {
  @PrimaryGeneratedColumn()
  pk_location_type_id: number;

  @Column()
  name: string;

  @Column()
  color: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
