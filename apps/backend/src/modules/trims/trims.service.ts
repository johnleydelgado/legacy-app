/* eslint-disable prettier/prettier */
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { TrimsEntity } from './trims.entity';


@Injectable()
export class TrimsService {
  constructor(
    @Inject('TRIMS_REPOSITORY')
    private trimsRepository: Repository<TrimsEntity>,
  ) { }

  async findAll(options: IPaginationOptions) {
    return paginate(this.trimsRepository, options);
  }

  findOne(pk_trim_id: number): Promise<TrimsEntity | null> {
    return this.trimsRepository.findOne({
      where: { pk_trim_id },
    });
  }

  // async create(createProductsDto: CreateProductsDto): Promise<ProductsEntity> {
  //   const newProducts = new ProductsEntity();
  //
  //   newProducts.fk_organization_id = createProductsDto.organizationID;
  //   newProducts.fk_category_id = createProductsDto.productCategoryID;
  //   newProducts.inventory = createProductsDto.inventory;
  //   newProducts.supplier_phone = createProductsDto.supplierPhone;
  //   newProducts.supplier_name = createProductsDto.supplierName;
  //   newProducts.supplier_email = createProductsDto.supplierEmail;
  //   newProducts.supplier_contact_name = createProductsDto.supplierContactName;
  //   newProducts.supplier_address = createProductsDto.supplierAddress;
  //   newProducts.style = createProductsDto.style;
  //   newProducts.product_name = createProductsDto.productName;
  //   newProducts.status = createProductsDto.status;
  //   newProducts.product_price = createProductsDto.productPrice;
  //   newProducts.image_url = createProductsDto.imageURL;
  //   newProducts.sku = createProductsDto.sku;
  //   newProducts.yarn = createProductsDto.yarn;
  //   newProducts.trims = createProductsDto.trims;
  //   newProducts.packaging = createProductsDto.packaging;
  //   newProducts.created_at = new Date();
  //   newProducts.updated_at = new Date();
  //
  //   return await this.packagingRepository.save(newProducts);
  // }
  //
  // async remove(pk_production_id: number) {
  //   return await this.packagingRepository.delete(pk_production_id);
  // }
  //
  // async update(id: number, updateProductsDto: UpdateProductsDto) {
  //   const toUpdate = await this.packagingRepository.findOne({
  //     where: { pk_product_id: id },
  //   });
  //
  //   const updated = Object.assign(
  //     {
  //       pk_product_id: toUpdate?.pk_product_id,
  //       fk_organization_id: toUpdate?.fk_organization_id,
  //       fk_category_id: toUpdate?.fk_category_id,
  //       inventory: toUpdate?.inventory,
  //       supplier_phone: toUpdate?.supplier_phone,
  //       supplier_name: toUpdate?.supplier_name,
  //       supplier_email: toUpdate?.supplier_email,
  //       supplier_contact_name: toUpdate?.supplier_contact_name,
  //       supplier_address: toUpdate?.supplier_address,
  //       style: toUpdate?.style,
  //       product_name: toUpdate?.product_name,
  //       status: toUpdate?.status,
  //       product_price: toUpdate?.product_price,
  //       image_url: toUpdate?.image_url,
  //       sku: toUpdate?.sku,
  //       yarn: toUpdate?.yarn,
  //       trims: toUpdate?.trims,
  //       packaging: toUpdate?.packaging,
  //       created_at: toUpdate?.created_at,
  //       updated_at: toUpdate?.updated_at,
  //     },
  //     {
  //       product_category_id: updateProductsDto.productCategoryID,
  //       inventory: updateProductsDto.inventory,
  //       supplier_phone: updateProductsDto.supplierPhone,
  //       supplier_name: updateProductsDto.supplierName,
  //       supplier_email: updateProductsDto.supplierEmail,
  //       supplier_contact_name: updateProductsDto.supplierContactName,
  //       supplier_address: updateProductsDto.supplierAddress,
  //       style: updateProductsDto.style,
  //       product_name: updateProductsDto.productName,
  //       status: updateProductsDto.status,
  //       product_price: updateProductsDto.productPrice,
  //       image_url: updateProductsDto.imageURL,
  //       sku: updateProductsDto.sku,
  //       yarn: updateProductsDto.yarn,
  //       trims: updateProductsDto.trims,
  //       packaging: updateProductsDto.packaging,
  //       updated_at: new Date(),
  //     },
  //   );
  //
  //   return await this.packagingRepository.save(updated);
  // }
}
