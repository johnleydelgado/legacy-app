import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { LocationTypesEntity } from './location-types.entity';


@Injectable()
export class LocationTypesService {
  constructor(
    @Inject('LOCATION_TYPES_REPOSITORY')
    private locationTypesRepository: Repository<LocationTypesEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.locationTypesRepository, options);
  }

  findOne(pk_location_type_id: number): Promise<LocationTypesEntity | null> {
    return this.locationTypesRepository.findOne({ where: { pk_location_type_id } });
  }

  findByName(name: string): Promise<LocationTypesEntity | null> {
    return this.locationTypesRepository.findOne({ where: { name: `${name}` } });
  }
}
