import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { OrderItemsEntity } from './order-items.entity';
import { CreateOrderItemsDTO, UpdateOrderItemsDTO } from './order-items.dto';
import { OrdersService } from '../orders/orders.service';


@Injectable()
export class OrderItemsService {
  constructor(
    @Inject('ORDER_ITEMS_REPOSITORY')
    private orderItemsRepository: Repository<OrderItemsEntity>,
    private ordersService: OrdersService,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.orderItemsRepository, options);
  }

  findOne(pk_order_item_id: number): Promise<OrderItemsEntity | null> {
    return this.orderItemsRepository.findOne({ where: { pk_order_item_id } });
  }

  async create(createOrderItemsDTO: CreateOrderItemsDTO): Promise<OrderItemsEntity> {
    const newOrderItems = new OrderItemsEntity()

    newOrderItems.fk_order_id = createOrderItemsDTO.orderID;
    newOrderItems.fk_product_id = createOrderItemsDTO.productID;
    newOrderItems.fk_shipping_address_id = createOrderItemsDTO.addressID;
    newOrderItems.fk_packaging_id = createOrderItemsDTO.packagingID;
    newOrderItems.fk_trim_id = createOrderItemsDTO.trimID;
    newOrderItems.fk_yarn_id = createOrderItemsDTO.yarnID;
    newOrderItems.item_name = createOrderItemsDTO.itemName;
    newOrderItems.item_description = createOrderItemsDTO.itemDescription;
    newOrderItems.artwork_url = createOrderItemsDTO.artworkURL;
    newOrderItems.quantity = createOrderItemsDTO.quantity;
    newOrderItems.unit_price = createOrderItemsDTO.unitPrice;
    newOrderItems.tax_rate = createOrderItemsDTO.taxRate;
    newOrderItems.created_at = new Date();
    newOrderItems.updated_at = new Date();

    const savedOrdersItems = await this.orderItemsRepository.save(newOrderItems);
    const ordersData = await this.ordersService.findOne(createOrderItemsDTO.orderID);

    savedOrdersItems.item_number = `${ordersData?.fk_serial_encoder_id}-${ordersData?.pk_order_id}-${savedOrdersItems.pk_order_item_id}`
    savedOrdersItems.updated_at = new Date();

    return await this.orderItemsRepository.save(savedOrdersItems);
  }

  async remove(pk_order_item_id: number) {
    return await this.orderItemsRepository.delete(pk_order_item_id);
  }

  async update(id: number, updateOrderItemsDTO: UpdateOrderItemsDTO) {
    const toUpdate = await this.orderItemsRepository.findOne({ where: { pk_order_item_id: id } });

    const updated = Object.assign({
      pk_order_item_id: toUpdate?.pk_order_item_id,
      fk_order_id: toUpdate?.fk_order_id,
      fk_product_id: toUpdate?.fk_product_id,
      fk_shipping_address_id: toUpdate?.fk_shipping_address_id,
      fk_packaging_id: toUpdate?.fk_packaging_id,
      fk_trim_id: toUpdate?.fk_trim_id,
      fk_yarn_id: toUpdate?.fk_yarn_id,
      item_name: toUpdate?.item_name,
      item_description: toUpdate?.item_description,
      artwork_url: toUpdate?.artwork_url,
      quantity: toUpdate?.quantity,
      unit_price: toUpdate?.unit_price,
      tax_rate: toUpdate?.tax_rate,
      line_total: toUpdate?.line_total,
      created_at: toUpdate?.created_at,
      updated_at: toUpdate?.updated_at,
    }, {
      fk_product_id: updateOrderItemsDTO.productID,
      fk_shipping_address_id: updateOrderItemsDTO.addressID,
      fk_packaging_id: updateOrderItemsDTO.packagingID,
      fk_trim_id: updateOrderItemsDTO.trimID,
      fk_yarn_id: updateOrderItemsDTO.yarnID,
      item_name: updateOrderItemsDTO.itemName,
      item_description: updateOrderItemsDTO.itemDescription,
      artwork_url: updateOrderItemsDTO.artworkURL,
      quantity: updateOrderItemsDTO.quantity,
      unit_price: updateOrderItemsDTO.unitPrice,
      tax_rate: updateOrderItemsDTO.taxRate,
      updated_at: new Date()
    });

    return await this.orderItemsRepository.save(updated);
  }

  async findByOrderId(orderId: number, options: IPaginationOptions) {
    const queryBuilder = this.orderItemsRepository
      .createQueryBuilder('order_item')
      .where('order_item.fk_order_id = :orderId', { orderId })
      .orderBy('order_item.created_at', 'DESC');

    return paginate(queryBuilder, options);
  }

  async getOrderTotals(orderId: number) {
    return await this.orderItemsRepository
      .createQueryBuilder('order_item')
      .select('COALESCE(SUM(order_item.quantity), 0)', 'totalQuantity')
      .addSelect('COALESCE(SUM(order_item.unit_price), 0)', 'totalUnitPrice')
      .addSelect('COALESCE(SUM(order_item.tax_rate), 0)', 'totalTaxRate')
      .addSelect('COALESCE(SUM(order_item.line_total), 0)', 'totalLineTotal')
      .where('order_item.fk_order_id = :orderId', { orderId })
      .getRawOne();
  }
}
