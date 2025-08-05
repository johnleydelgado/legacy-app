import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ProductsCategoryEntity } from './products-category.entity';
import { CreateProductsCategoryDto, UpdateProductsCategoryDto } from './products-category.dto';

@Injectable()
export class ProductsCategoryService {
  constructor(
    @Inject('PRODUCTS_CATEGORY_REPOSITORY')
    private productsCategoryRepository: Repository<ProductsCategoryEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.productsCategoryRepository, options);
  }

  findOne(pk_product_category_id: number): Promise<ProductsCategoryEntity | null> {
    return this.productsCategoryRepository.findOne({ where: { pk_product_category_id } });
  }

  async create(createProductsCategoryDto: CreateProductsCategoryDto): Promise<ProductsCategoryEntity> {
    // Use repository.create() method - this is the recommended approach
    const newProductsCategory = this.productsCategoryRepository.create({
      category_name: createProductsCategoryDto.categoryName,
      description: createProductsCategoryDto?.description || '',
    });
    
    return await this.productsCategoryRepository.save(newProductsCategory);
  }

  async remove(pk_product_category_id: number) {
    const result = await this.productsCategoryRepository.delete(pk_product_category_id);
    if (result.affected === 0) {
      throw new NotFoundException('Product category not found');
    }
    return result;
  }

  async update(id: number, updateProductsCategoryDto: UpdateProductsCategoryDto): Promise<ProductsCategoryEntity> {
    const toUpdate = await this.productsCategoryRepository.findOne({ where: { pk_product_category_id: id } });
    
    if (!toUpdate) {
      throw new NotFoundException('Product category not found');
    }

    toUpdate.category_name = updateProductsCategoryDto.categoryName;
    if (updateProductsCategoryDto.description !== undefined) {
      toUpdate.description = updateProductsCategoryDto.description;
    }
    toUpdate.updated_at = new Date();

    return await this.productsCategoryRepository.save(toUpdate);
  }
}
