import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { PurchaseOrdersItemsEntity } from './purchase-orders-items.entity';
import { CreatePurchaseOrdersItemsDto, UpdatePurchaseOrdersItemsDto } from './purchase-orders-items.dto';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';


@Injectable()
export class PurchaseOrdersItemsService {
  constructor(
    @Inject('PURCHASE_ORDERS_ITEMS_REPOSITORY')
    private purchaseOrdersItemsRepository: Repository<PurchaseOrdersItemsEntity>,
    private purchaseOrdersService: PurchaseOrdersService,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.purchaseOrdersItemsRepository, options);
  }

  findOne(pk_purchase_order_item_id: number): Promise<PurchaseOrdersItemsEntity | null> {
    return this.purchaseOrdersItemsRepository.findOne({ where: { pk_purchase_order_item_id } });
  }

  async create(createPurchaseOrdersItemsDto: CreatePurchaseOrdersItemsDto): Promise<PurchaseOrdersItemsEntity> {
    const newPurchaseOrdersItems = new PurchaseOrdersItemsEntity()

    const lineTotal = createPurchaseOrdersItemsDto.unitPrice * createPurchaseOrdersItemsDto.quantity + ( 1 * createPurchaseOrdersItemsDto.rate);

    newPurchaseOrdersItems.fk_purchase_order_id = createPurchaseOrdersItemsDto.purchaseOrderID;
    newPurchaseOrdersItems.fk_product_id = createPurchaseOrdersItemsDto.productID;
    newPurchaseOrdersItems.item_sku = createPurchaseOrdersItemsDto.itemSku;
    newPurchaseOrdersItems.item_name = createPurchaseOrdersItemsDto.itemName;
    newPurchaseOrdersItems.item_description = createPurchaseOrdersItemsDto.itemDescription;
    newPurchaseOrdersItems.item_specifications = createPurchaseOrdersItemsDto.itemSpecifications ? JSON.parse(createPurchaseOrdersItemsDto.itemSpecifications) : {};
    newPurchaseOrdersItems.item_notes = createPurchaseOrdersItemsDto.itemNotes;
    newPurchaseOrdersItems.packaging_instructions = createPurchaseOrdersItemsDto.packagingInstructions ? JSON.parse(createPurchaseOrdersItemsDto.packagingInstructions) : {};
    newPurchaseOrdersItems.quantity = createPurchaseOrdersItemsDto.quantity;
    newPurchaseOrdersItems.unit_price = createPurchaseOrdersItemsDto.unitPrice;
    newPurchaseOrdersItems.rate = createPurchaseOrdersItemsDto.rate;
    newPurchaseOrdersItems.line_total = lineTotal;
    newPurchaseOrdersItems.currency = createPurchaseOrdersItemsDto.currency;
    newPurchaseOrdersItems.created_at = new Date();
    newPurchaseOrdersItems.updated_at = new Date();

    const savedPurchaseOrdersItems = await this.purchaseOrdersItemsRepository.save(newPurchaseOrdersItems);
    const purchaseOrdersData = await this.purchaseOrdersService.findOne(createPurchaseOrdersItemsDto.purchaseOrderID);

    savedPurchaseOrdersItems.item_number = `${purchaseOrdersData?.fk_serial_encoder_id}-${purchaseOrdersData?.pk_purchase_order_id}-${savedPurchaseOrdersItems.pk_purchase_order_item_id}`
    savedPurchaseOrdersItems.updated_at = new Date();

    return await this.purchaseOrdersItemsRepository.save(savedPurchaseOrdersItems);
  }

  async remove(pk_purchase_order_item_id: number) {
    return await this.purchaseOrdersItemsRepository.delete(pk_purchase_order_item_id);
  }

  async update(id: number, updatePurchaseOrdersItemsDto: UpdatePurchaseOrdersItemsDto) {
    const toUpdate = await this.purchaseOrdersItemsRepository.findOne({ where: { pk_purchase_order_item_id: id } });

    const updated = Object.assign({
      pk_purchase_order_item_id: toUpdate?.pk_purchase_order_item_id,
      fk_purchase_order_id: toUpdate?.fk_purchase_order_id,
      fk_product_id: toUpdate?.fk_product_id,
      item_sku: toUpdate?.item_sku,
      item_name: toUpdate?.item_name,
      item_description: toUpdate?.item_description,
      item_specifications: toUpdate?.item_specifications,
      item_notes: toUpdate?.item_notes,
      packaging_instructions: toUpdate?.packaging_instructions,
      quantity: toUpdate?.quantity,
      unit_price: toUpdate?.unit_price,
      rate: toUpdate?.rate,
      line_total: toUpdate?.line_total,
      created_at: toUpdate?.created_at,
      updated_at: toUpdate?.updated_at,
    }, {
      fk_product_id: updatePurchaseOrdersItemsDto.productID,
      item_sku: updatePurchaseOrdersItemsDto.itemSku,
      item_name: updatePurchaseOrdersItemsDto.itemName,
      item_description: updatePurchaseOrdersItemsDto.itemDescription,
      item_specifications: updatePurchaseOrdersItemsDto.itemSpecifications ? JSON.parse(updatePurchaseOrdersItemsDto.itemSpecifications) : toUpdate?.item_specifications,
      item_notes: updatePurchaseOrdersItemsDto.itemNotes,
      packaging_instructions: updatePurchaseOrdersItemsDto.packagingInstructions ? JSON.parse(updatePurchaseOrdersItemsDto.packagingInstructions) : toUpdate?.packaging_instructions,
      quantity: updatePurchaseOrdersItemsDto.quantity,
      unit_price: updatePurchaseOrdersItemsDto.unitPrice,
      rate: updatePurchaseOrdersItemsDto.rate,
      updated_at: new Date()
    });

    return await this.purchaseOrdersItemsRepository.save(updated);
  }

  async findByPurchaseOrderId(purchaseOrderId: number, options: IPaginationOptions) {
    const queryBuilder = this.purchaseOrdersItemsRepository
      .createQueryBuilder('purchase_order_item')
      .where('purchase_order_item.fk_purchase_order_id = :purchaseOrderId', { purchaseOrderId })
      .orderBy('purchase_order_item.created_at', 'DESC');

    return paginate(queryBuilder, options);
  }

  async getPurchaseOrderTotals(purchaseOrderId: number) {
    return await this.purchaseOrdersItemsRepository
      .createQueryBuilder('purchase_order_item')
      .select('COALESCE(SUM(purchase_order_item.quantity), 0)', 'totalQuantity')
      .addSelect('COALESCE(SUM(purchase_order_item.unit_price), 0)', 'totalUnitPrice')
      .addSelect('COALESCE(SUM(purchase_order_item.tax_rate), 0)', 'totalTaxRate')
      .addSelect('COALESCE(SUM(purchase_order_item.line_total), 0)', 'totalLineTotal')
      .where('purchase_order_item.fk_purchase_order_id = :purchaseOrderId', { purchaseOrderId })
      .getRawOne();
  }
}
