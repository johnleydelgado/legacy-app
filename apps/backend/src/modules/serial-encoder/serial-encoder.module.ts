import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SerialEncoderProvider } from './serial-encoder.provider';
import { SerialEncoderService } from './serial-encoder.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [...SerialEncoderProvider, SerialEncoderService],
  exports: [SerialEncoderService],
})
export class SerialEncoderModule {}
