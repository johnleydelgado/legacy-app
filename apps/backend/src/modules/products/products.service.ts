/* eslint-disable prettier/prettier */
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ProductsEntity } from './products.entity';
import { CreateProductsDto, UpdateProductsDto } from './products.dto';
import { ContactsEntity } from '../contacts/contacts.entity';
import { ILike } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRODUCTS_REPOSITORY')
    private productsRepository: Repository<ProductsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.productsRepository, options, {
      relations: ['product_category', 'vendor'],
    });
  }

  async findAllWithPrices(options: IPaginationOptions) {
    return paginate(this.productsRepository, options, {
      relations: ['product_category', 'product_prices'],
    });
  }

  findOne(pk_product_id: number): Promise<ProductsEntity | null> {
    return this.productsRepository.findOne({
      where: { pk_product_id },
      relations: ['product_category'],
    });
  }

  findOneWithPrices(pk_product_id: number): Promise<ProductsEntity | null> {
    return this.productsRepository.findOne({
      where: { pk_product_id },
      relations: ['product_category', 'product_prices'],
    });
  }

  async findAllByCategoryID(options: IPaginationOptions, categoryID: number) {
    const { page, limit } = options;

    const skip = (Number(page || 0) - 1) * Number(limit || 0);
    const take = Number(limit || 0);

    const [products, total] = await this.productsRepository.findAndCount({
      where: {
        fk_category_id: categoryID,
      },
      take,
      skip,
    });

    return { items: products, totalItems: total };
  }

  async findAllByCategoryIDWithPrices(
    options: IPaginationOptions,
    categoryID: number,
  ) {
    const { page, limit } = options;

    const skip = (Number(page || 0) - 1) * Number(limit || 0);
    const take = Number(limit || 0);

    const [products, total] = await this.productsRepository.findAndCount({
      where: {
        fk_category_id: categoryID,
      },
      relations: ['product_category', 'product_prices'],
      take,
      skip,
    });

    return { items: products, totalItems: total };
  }

  async searchByProductName(options: IPaginationOptions, searchTerm: string) {
    const { page, limit } = options;

    const skip = (Number(page || 0) - 1) * Number(limit || 0);
    const take = Number(limit || 0);

    const [products, total] = await this.productsRepository.findAndCount({
      where: {
        product_name: searchTerm ? ILike(`%${searchTerm}%`) : undefined,
      },
      relations: ['product_category'],
      take,
      skip,
    });

    return { items: products, totalItems: total };
  }

  async searchByProductNameWithPrices(
    options: IPaginationOptions,
    searchTerm: string,
  ) {
    const { page, limit } = options;

    const skip = (Number(page || 0) - 1) * Number(limit || 0);
    const take = Number(limit || 0);

    const [products, total] = await this.productsRepository.findAndCount({
      where: {
        product_name: searchTerm ? ILike(`%${searchTerm}%`) : undefined,
      },
      relations: ['product_category', 'product_prices'],
      take,
      skip,
    });

    return { items: products, totalItems: total };
  }

  async create(createProductsDto: CreateProductsDto): Promise<ProductsEntity> {
    const newProducts = new ProductsEntity();

    newProducts.fk_organization_id = createProductsDto.organizationID;
    newProducts.fk_category_id = createProductsDto.productCategoryID;
    newProducts.inventory = createProductsDto.inventory;
    newProducts.style = createProductsDto.style;
    newProducts.product_name = createProductsDto.productName;
    newProducts.status = createProductsDto.status;
    newProducts.product_price = createProductsDto.productPrice;
    newProducts.image_url = createProductsDto.imageURL;
    newProducts.image_urls = createProductsDto.imageURLs;
    newProducts.sku = createProductsDto.sku;
    newProducts.yarn = createProductsDto.yarn;
    newProducts.trims = createProductsDto.trims;
    newProducts.packaging = createProductsDto.packaging;
    newProducts.created_at = new Date();
    newProducts.updated_at = new Date();

    if (createProductsDto.fk_vendor_id) {
      newProducts.fk_vendor_id = createProductsDto.fk_vendor_id;
    }

    try {
      return await this.productsRepository.save(newProducts);
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  async remove(pk_production_id: number) {
    return await this.productsRepository.delete(pk_production_id);
  }

  async update(id: number, updateProductsDto: UpdateProductsDto) {
    const toUpdate = await this.productsRepository.findOne({
      where: { pk_product_id: id },
    });

    const updated = Object.assign(
      {
        pk_product_id: toUpdate?.pk_product_id,
        fk_organization_id: toUpdate?.fk_organization_id,
        fk_category_id: toUpdate?.fk_category_id,
        inventory: toUpdate?.inventory,
        style: toUpdate?.style,
        product_name: toUpdate?.product_name,
        status: toUpdate?.status,
        product_price: toUpdate?.product_price,
        image_url: toUpdate?.image_url,
        image_urls: toUpdate?.image_urls,
        sku: toUpdate?.sku,
        yarn: toUpdate?.yarn,
        trims: toUpdate?.trims,
        packaging: toUpdate?.packaging,
        created_at: toUpdate?.created_at,
        updated_at: toUpdate?.updated_at,
        fk_vendor_id: toUpdate?.fk_vendor_id,
      },
      {
        fk_category_id: updateProductsDto.productCategoryID,
        inventory: updateProductsDto.inventory,
        style: updateProductsDto.style,
        product_name: updateProductsDto.productName,
        status: updateProductsDto.status,
        product_price: updateProductsDto.productPrice,
        image_url: updateProductsDto.imageURL,
        image_urls: updateProductsDto.imageURLs,
        sku: updateProductsDto.sku,
        yarn: updateProductsDto.yarn,
        trims: updateProductsDto.trims,
        packaging: updateProductsDto.packaging,
        fk_vendor_id: updateProductsDto.fk_vendor_id,
        updated_at: new Date(),
      },
    );

    return await this.productsRepository.save(updated);
  }
}
