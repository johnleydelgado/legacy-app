import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { SerialEncoderEntity } from './serial-encoder.entity';
import { CreateSerialEncoderDto, UpdateSerialEncoderDto } from './serial-encoder.dto';


@Injectable()
export class SerialEncoderService {
  constructor(
    @Inject('SERIAL_ENCODER_REPOSITORY')
    private serialEncoderRepository: Repository<SerialEncoderEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.serialEncoderRepository, options);
  }

  findOne(id: number): Promise<SerialEncoderEntity | null> {
    return this.serialEncoderRepository.findOne({ where: { id } });
  }

  async create(serialEncoderDto: CreateSerialEncoderDto): Promise<SerialEncoderEntity> {
    const newSerialEncoder = new SerialEncoderEntity()

    newSerialEncoder.purpose = JSON.parse(serialEncoderDto.purpose);
    newSerialEncoder.created_at = new Date();
    newSerialEncoder.updated_at = new Date();

    return this.serialEncoderRepository.save(newSerialEncoder);
  }

  async remove(id: number) {
    return await this.serialEncoderRepository.delete(id);
  }

  async update(id: number, updateSerialEncoderDto: UpdateSerialEncoderDto) {
    const toUpdate = await this.serialEncoderRepository.findOne({ where: { id } });

    const updated = Object.assign({
      id: toUpdate?.id,
      purpose: toUpdate?.purpose,
      created_at: toUpdate?.created_at,
      updated_at: toUpdate?.updated_at,
    }, {
      purpose: JSON.parse(updateSerialEncoderDto.purpose),
      updated_at: new Date()
    });

    return await this.serialEncoderRepository.save(updated);
  }

  async findByPurposeQuoteId(quoteId: number): Promise<SerialEncoderEntity | null> {
    // Using TypeORM's query builder to search in the JSON field
    return this.serialEncoderRepository
      .createQueryBuilder('serial_encoder')
      .where(`JSON_EXTRACT(serial_encoder.purpose, '$.quote_id') = :quoteId`, { quoteId })
      .getOne();
  }

  async findByPurposeOrderId(orderId: number): Promise<SerialEncoderEntity | null> {
    // Using TypeORM's query builder to search in the JSON field
    return this.serialEncoderRepository
      .createQueryBuilder('serial_encoder')
      .where(`JSON_EXTRACT(serial_encoder.purpose, '$.order_id') = :orderId`, { orderId })
      .getOne();
  }

  async findByPurposeShippingOrderId(shippingOrderId: number): Promise<SerialEncoderEntity | null> {
    // Using TypeORM's query builder to search in the JSON field
    return this.serialEncoderRepository
      .createQueryBuilder('serial_encoder')
      .where(`JSON_EXTRACT(serial_encoder.purpose, '$.shipping_order_id') = :shippingOrderId`, { shippingOrderId })
      .getOne();
  }
}
