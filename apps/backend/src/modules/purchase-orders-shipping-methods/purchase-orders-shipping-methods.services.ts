import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { IPaginationOptions, paginate } from "nestjs-typeorm-paginate";
import { PurchaseOrdersShippingMethodsEntity } from "./purchase-orders-shipping-methods.entity";


@Injectable()
export class PurchaseOrdersShippingMethodsService {
  constructor(
    @Inject('PURCHASE_ORDERS_SHIPPING_METHODS_REPOSITORY')
    private purchaseOrdersShippingMethodsRepository: Repository<PurchaseOrdersShippingMethodsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.purchaseOrdersShippingMethodsRepository, options);
  }

  async findOne(pk_po_shipping_method_id: number): Promise<PurchaseOrdersShippingMethodsEntity | null> {
    return this.purchaseOrdersShippingMethodsRepository.findOne({ where: { pk_po_shipping_method_id } });
  }

  async findByTransactionType(transactionType: string, options: IPaginationOptions) {
    const queryBuilder = this.purchaseOrdersShippingMethodsRepository
      .createQueryBuilder('po_shipping_method')
      .where('JSON_CONTAINS(po_shipping_method.transaction_type, :transactionType)', {
        transactionType: JSON.stringify(transactionType)
      });

    return paginate(queryBuilder, options);
  }

  async findByFromFactory(options: IPaginationOptions) {
    const queryBuilder = this.purchaseOrdersShippingMethodsRepository
      .createQueryBuilder('po_shipping_method')
      .where('JSON_EXTRACT(po_shipping_method.transaction_type, "$.fromFactory") = :fromFactory', {
        fromFactory: true
      });

    return paginate(queryBuilder, options);
  }

  async findByFromCustomer(options: IPaginationOptions) {
    const queryBuilder = this.purchaseOrdersShippingMethodsRepository
      .createQueryBuilder('po_shipping_method')
      .where('JSON_EXTRACT(po_shipping_method.transaction_type, "$.fromCustomer") = :fromCustomer', {
        fromCustomer: true
      });

    return paginate(queryBuilder, options);
  }
}
