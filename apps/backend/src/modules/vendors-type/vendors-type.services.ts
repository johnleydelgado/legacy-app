import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { VendorsTypeEntity } from "./vendors-type.entity";
import { IPaginationOptions, paginate } from "nestjs-typeorm-paginate";


@Injectable()
export class VendorsTypeService {
  constructor(
    @Inject('VENDORS_TYPE_REPOSITORY')
    private vendorsTypeRepository: Repository<VendorsTypeEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.vendorsTypeRepository, options);
  }

  async findOne(id: number): Promise<VendorsTypeEntity | null> {
    return this.vendorsTypeRepository.findOne({ where: { id } });
  }
}
