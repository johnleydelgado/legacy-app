import { Inject, Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import * as moment from 'moment';
import { isValidJSON } from '../../utils/string_tools';
import { InvoicesItemsEntity } from './invoices-items.entity';
import { CreateInvoicesItemsDTO, UpdateInvoicesItemsDTO } from './invoices-items.dto';
import { InvoicesService } from '../invoices/invoices.service';


@Injectable()
export class InvoicesItemsService {
  constructor(
    @Inject('INVOICES_ITEMS_REPOSITORY')
    private invoicesItemsRepository: Repository<InvoicesItemsEntity>,
    private invoicesService: InvoicesService,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.invoicesItemsRepository, options);
  }

  findOne(pk_invoice_item_id: number): Promise<InvoicesItemsEntity | null> {
    return this.invoicesItemsRepository.findOne({ where: { pk_invoice_item_id } });
  }

  async findAllByInvoiceID(
    fk_invoice_id: number,
    options: IPaginationOptions
  ): Promise<Pagination<InvoicesItemsEntity>> {
    const queryBuilder = this.invoicesItemsRepository
      .createQueryBuilder('invoicesItems')
      .where('invoicesItems.fk_invoice_id = :fk_invoice_id', { fk_invoice_id })
      .orderBy('invoicesItems.pk_invoice_item_id', 'ASC'); // Optional: order by most recent first

    return paginate(queryBuilder, options);
  }

  async create(createInvoicesItemsDto: CreateInvoicesItemsDTO): Promise<InvoicesItemsEntity> {
    const newInvoicesItems = new InvoicesItemsEntity();

    newInvoicesItems.fk_invoice_id = createInvoicesItemsDto.invoiceID;
    newInvoicesItems.fk_product_id = createInvoicesItemsDto.productID;
    newInvoicesItems.item_name = createInvoicesItemsDto.itemName;
    newInvoicesItems.item_description = createInvoicesItemsDto.itemDescription;
    newInvoicesItems.quantity = createInvoicesItemsDto.quantity;
    newInvoicesItems.unit_price = createInvoicesItemsDto.unitPrice;
    newInvoicesItems.tax_rate = createInvoicesItemsDto.taxRate;

    newInvoicesItems.created_at = new Date();
    newInvoicesItems.updated_at = new Date();

    const savedInvoiceItems = await this.invoicesItemsRepository.save(newInvoicesItems);
    const invoiceData = await this.invoicesService.findOne(createInvoicesItemsDto.invoiceID);

    savedInvoiceItems.item_number = `${invoiceData?.fk_serial_encoder_id}-${invoiceData?.pk_invoice_id}-${savedInvoiceItems.pk_invoice_item_id}`
    savedInvoiceItems.updated_at = new Date();

    return await this.invoicesItemsRepository.save(savedInvoiceItems);
  }

  async remove(pk_invoice_id: number) {
    return await this.invoicesItemsRepository.delete(pk_invoice_id);
  }

  async update(id: number, updateInvoicesItemsDto: UpdateInvoicesItemsDTO) {
    const toUpdate = await this.invoicesItemsRepository.findOne({
      where: { pk_invoice_item_id: id },
    });

    const updated = Object.assign(
      {
        pk_invoice_item_id: toUpdate?.pk_invoice_item_id,
        fk_invoice_id: toUpdate?.fk_invoice_id,
        fk_product_id: toUpdate?.fk_product_id,
        item_name: toUpdate?.item_name,
        item_description: toUpdate?.item_description,
        quantity: toUpdate?.quantity,
        unit_price: toUpdate?.unit_price,
        tax_rate: toUpdate?.tax_rate,
        line_total: toUpdate?.line_total,
        created_at: toUpdate?.created_at,
        updated_at: toUpdate?.updated_at,
      },
      {
        fk_product_id: updateInvoicesItemsDto.productID,
        fk_shipping_address_id: updateInvoicesItemsDto.addressID,
        item_name: updateInvoicesItemsDto.itemName,
        item_description: updateInvoicesItemsDto.itemDescription,
        artwork_url: updateInvoicesItemsDto.artworkURL,
        quantity: updateInvoicesItemsDto.quantity,
        unit_price: updateInvoicesItemsDto.unitPrice,
        tax_rate: updateInvoicesItemsDto.taxRate,
        updated_at: new Date(),
      },
    );

    return await this.invoicesItemsRepository.save(updated);
  }
}
