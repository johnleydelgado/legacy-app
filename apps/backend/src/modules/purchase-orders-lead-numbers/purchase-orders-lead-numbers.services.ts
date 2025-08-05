import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { PurchaseOrdersLeadNumbersEntity } from "./purchase-orders-lead-numbers.entity";
import { IPaginationOptions, paginate } from "nestjs-typeorm-paginate";


@Injectable()
export class PurchaseOrdersLeadNumbersService {
  constructor(
    @Inject('PURCHASE_ORDERS_LEAD_NUMBERS_REPOSITORY')
    private purchaseOrdersLeadNumbersRepository: Repository<PurchaseOrdersLeadNumbersEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.purchaseOrdersLeadNumbersRepository, options);
  }

  async findOne(pk_po_lead_number_id: number): Promise<PurchaseOrdersLeadNumbersEntity | null> {
    return this.purchaseOrdersLeadNumbersRepository.findOne({ where: { pk_po_lead_number_id } });
  }
}
