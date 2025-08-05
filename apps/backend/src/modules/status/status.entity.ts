import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

@Entity('Status')
export class StatusEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  platform: string;

  @Column()
  process: string;

  @Column()
  status: string;

  @Column()
  color: string;
}
