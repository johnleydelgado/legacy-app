import { DataSource } from 'typeorm';
import { SerialEncoderEntity } from './serial-encoder.entity';

export const SerialEncoderProvider = [
  {
    provide: 'SERIAL_ENCODER_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SerialEncoderEntity),
    inject: ['DATA_SOURCE'],
  },
];
