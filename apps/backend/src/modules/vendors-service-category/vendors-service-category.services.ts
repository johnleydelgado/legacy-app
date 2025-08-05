import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { VendorsServiceCategoryEntity } from "./vendors-service-category.entity";
import { IPaginationOptions, paginate } from "nestjs-typeorm-paginate";



@Injectable()
export class VendorsServiceCategoryService {
  constructor(
    @Inject('VENDORS_SERVICE_CATEGORY_REPOSITORY')
    private vendorsServiceCategoryRepository: Repository<VendorsServiceCategoryEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.vendorsServiceCategoryRepository, options);
  }

  async findOne(id: number): Promise<VendorsServiceCategoryEntity | null> {
    return this.vendorsServiceCategoryRepository.findOne({ where: { id } });
  }
}
