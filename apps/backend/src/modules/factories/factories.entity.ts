import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

export enum FactoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('Factories')
export class FactoriesEntity {
  @PrimaryGeneratedColumn()
  pk_factories_id: number;

  @Column()
  fk_factories_type_id: number;
  
  @Column()
  fk_factories_service_id: number;

  @Column()
  fk_location_id: number;

  @Column({
    type: 'enum',
    enum: FactoryStatus,
    default: FactoryStatus.ACTIVE,
  })
  status: FactoryStatus;

  @Column({ length: 191 })
  name: string;

  @Column({ length: 191, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  website_url: string;

  @Column({ length: 100, nullable: true })
  industry: string;

  @Column('json', { nullable: true })
  tags: any;

  @Column('text', { nullable: true })
  notes: string;

  @Column()
  user_owner: string;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
