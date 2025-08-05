import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ProductPricesEntity } from './product-prices.entity';
import {
  CreateProductPricesDto,
  UpdateProductPricesDto,
} from './product-prices.dto';

@Injectable()
export class ProductPricesService {
  constructor(
    @Inject('PRODUCT_PRICES_REPOSITORY')
    private productPricesRepository: Repository<ProductPricesEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.productPricesRepository, options, {
      relations: ['product'],
    });
  }

  findOne(id: number): Promise<ProductPricesEntity | null> {
    return this.productPricesRepository.findOne({
      where: { id },
      relations: ['product'],
    });
  }

  async findAllByProductId(options: IPaginationOptions, productId: number) {
    const { page, limit } = options;

    const skip = (Number(page || 0) - 1) * Number(limit || 0);
    const take = Number(limit || 0);

    const [productPrices, total] =
      await this.productPricesRepository.findAndCount({
        where: {
          fk_product_id: productId,
        },
        relations: ['product'],
        take,
        skip,
      });

    return { items: productPrices, totalItems: total };
  }

  async create(
    createProductPricesDto: CreateProductPricesDto,
  ): Promise<ProductPricesEntity> {
    const newProductPrice = new ProductPricesEntity();

    newProductPrice.max_qty = createProductPricesDto.max_qty;
    newProductPrice.price = createProductPricesDto.price;
    newProductPrice.fk_product_id = createProductPricesDto.fk_product_id;
    newProductPrice.created_at = new Date();
    newProductPrice.updated_at = new Date();

    return await this.productPricesRepository.save(newProductPrice);
  }

  async remove(id: number) {
    return await this.productPricesRepository.delete(id);
  }

  async update(id: number, updateProductPricesDto: UpdateProductPricesDto) {
    const toUpdate = await this.productPricesRepository.findOne({
      where: { id },
    });

    if (!toUpdate) {
      throw new Error('ProductPrice not found');
    }

    const updated = Object.assign(
      {
        id: toUpdate.id,
        max_qty: toUpdate.max_qty,
        price: toUpdate.price,
        fk_product_id: toUpdate.fk_product_id,
        created_at: toUpdate.created_at,
        updated_at: toUpdate.updated_at,
      },
      {
        max_qty:
          updateProductPricesDto.max_qty !== undefined
            ? updateProductPricesDto.max_qty
            : toUpdate.max_qty,
        price:
          updateProductPricesDto.price !== undefined
            ? updateProductPricesDto.price
            : toUpdate.price,
        fk_product_id:
          updateProductPricesDto.fk_product_id !== undefined
            ? updateProductPricesDto.fk_product_id
            : toUpdate.fk_product_id,
        updated_at: new Date(),
      },
    );

    return await this.productPricesRepository.save(updated);
  }
}
