import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ShippingPackageSpecificationsEntity } from './shipping-package-specifications.entity';
import {
  CreateShippingPackageSpecificationsDto,
  UpdateShippingPackageSpecificationsDto,
} from './shipping-package-specifications.dto';

@Injectable()
export class ShippingPackageSpecificationsService {
  constructor(
    @Inject('SHIPPING_PACKAGE_SPECIFICATIONS_REPOSITORY')
    private shippingPackageSpecificationsRepository: Repository<ShippingPackageSpecificationsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.shippingPackageSpecificationsRepository, options);
  }

  findOne(
    pk_shipping_package_spec_id: number,
  ): Promise<ShippingPackageSpecificationsEntity | null> {
    return this.shippingPackageSpecificationsRepository.findOne({
      where: { pk_shipping_package_spec_id },
    });
  }

  async findByShippingOrderId(
    shippingOrderId: number,
    options: IPaginationOptions,
  ) {
    const queryBuilder = this.shippingPackageSpecificationsRepository
      .createQueryBuilder('shipping_package_specifications')
      .where(
        'shipping_package_specifications.fk_shipping_order_id = :shippingOrderId',
        {
          shippingOrderId,
        },
      )
      .orderBy('shipping_package_specifications.created_at', 'ASC');

    return paginate(queryBuilder, options);
  }

  async create(
    createShippingPackageSpecificationsDto: CreateShippingPackageSpecificationsDto,
  ): Promise<ShippingPackageSpecificationsEntity> {
    const newShippingPackageSpecification =
      this.shippingPackageSpecificationsRepository.create({
        fk_shipping_order_id:
          createShippingPackageSpecificationsDto.fkShippingOrderId,
        name: createShippingPackageSpecificationsDto.name,
        company_name: createShippingPackageSpecificationsDto.companyName,
        phone_number: createShippingPackageSpecificationsDto.phoneNumber,
        length: createShippingPackageSpecificationsDto.length,
        width: createShippingPackageSpecificationsDto.width,
        height: createShippingPackageSpecificationsDto.height,
        weight: createShippingPackageSpecificationsDto.weight,
        measurement_unit:
          createShippingPackageSpecificationsDto.measurementUnit,
        fk_dimension_preset_id:
          createShippingPackageSpecificationsDto.fkDimensionPresetId,
        fk_weight_preset_id:
          createShippingPackageSpecificationsDto.fkWeightPresetId,
        address: createShippingPackageSpecificationsDto.address,
        city: createShippingPackageSpecificationsDto.city,
        state: createShippingPackageSpecificationsDto.state,
        zip: createShippingPackageSpecificationsDto.zip,
        country: createShippingPackageSpecificationsDto.country,
        // Shipping rate fields
        carrier: createShippingPackageSpecificationsDto.carrier,
        service: createShippingPackageSpecificationsDto.service,
        carrier_description:
          createShippingPackageSpecificationsDto.carrierDescription,
        shipping_rate_id: createShippingPackageSpecificationsDto.shippingRateId,
        easypost_shipment_id:
          createShippingPackageSpecificationsDto.easypostShipmentId,
        easypost_shipment_rate_id:
          createShippingPackageSpecificationsDto.easypostShipmentRateId,
        tracking_code: createShippingPackageSpecificationsDto.trackingCode,
        label_url: createShippingPackageSpecificationsDto.labelUrl,
        shipment_status: createShippingPackageSpecificationsDto.shipmentStatus,
        estimated_delivery_days:
          createShippingPackageSpecificationsDto.estimatedDeliveryDays,
      });

    return this.shippingPackageSpecificationsRepository.save(
      newShippingPackageSpecification,
    );
  }

  async remove(pk_shipping_package_spec_id: number) {
    return this.shippingPackageSpecificationsRepository.delete({
      pk_shipping_package_spec_id,
    });
  }

  async update(
    id: number,
    updateShippingPackageSpecificationsDto: UpdateShippingPackageSpecificationsDto,
  ): Promise<ShippingPackageSpecificationsEntity | null> {
    const updateData: any = {};

    if (updateShippingPackageSpecificationsDto.name !== undefined) {
      updateData.name = updateShippingPackageSpecificationsDto.name;
    }
    if (updateShippingPackageSpecificationsDto.companyName !== undefined) {
      updateData.company_name =
        updateShippingPackageSpecificationsDto.companyName;
    }
    if (updateShippingPackageSpecificationsDto.phoneNumber !== undefined) {
      updateData.phone_number =
        updateShippingPackageSpecificationsDto.phoneNumber;
    }
    if (updateShippingPackageSpecificationsDto.length !== undefined) {
      updateData.length = updateShippingPackageSpecificationsDto.length;
    }
    if (updateShippingPackageSpecificationsDto.width !== undefined) {
      updateData.width = updateShippingPackageSpecificationsDto.width;
    }
    if (updateShippingPackageSpecificationsDto.height !== undefined) {
      updateData.height = updateShippingPackageSpecificationsDto.height;
    }
    if (updateShippingPackageSpecificationsDto.weight !== undefined) {
      updateData.weight = updateShippingPackageSpecificationsDto.weight;
    }
    if (updateShippingPackageSpecificationsDto.measurementUnit !== undefined) {
      updateData.measurement_unit =
        updateShippingPackageSpecificationsDto.measurementUnit;
    }
    if (updateShippingPackageSpecificationsDto.address !== undefined) {
      updateData.address = updateShippingPackageSpecificationsDto.address;
    }
    if (updateShippingPackageSpecificationsDto.city !== undefined) {
      updateData.city = updateShippingPackageSpecificationsDto.city;
    }
    if (updateShippingPackageSpecificationsDto.state !== undefined) {
      updateData.state = updateShippingPackageSpecificationsDto.state;
    }
    if (updateShippingPackageSpecificationsDto.zip !== undefined) {
      updateData.zip = updateShippingPackageSpecificationsDto.zip;
    }
    if (updateShippingPackageSpecificationsDto.country !== undefined) {
      updateData.country = updateShippingPackageSpecificationsDto.country;
    }

    // Shipping rate fields
    if (updateShippingPackageSpecificationsDto.carrier !== undefined) {
      updateData.carrier = updateShippingPackageSpecificationsDto.carrier;
    }
    if (updateShippingPackageSpecificationsDto.service !== undefined) {
      updateData.service = updateShippingPackageSpecificationsDto.service;
    }
    if (
      updateShippingPackageSpecificationsDto.carrierDescription !== undefined
    ) {
      updateData.carrier_description =
        updateShippingPackageSpecificationsDto.carrierDescription;
    }
    if (updateShippingPackageSpecificationsDto.shippingRateId !== undefined) {
      updateData.shipping_rate_id =
        updateShippingPackageSpecificationsDto.shippingRateId;
    }
    if (
      updateShippingPackageSpecificationsDto.easypostShipmentId !== undefined
    ) {
      updateData.easypost_shipment_id =
        updateShippingPackageSpecificationsDto.easypostShipmentId;
    }
    if (
      updateShippingPackageSpecificationsDto.easypostShipmentRateId !==
      undefined
    ) {
      updateData.easypost_shipment_rate_id =
        updateShippingPackageSpecificationsDto.easypostShipmentRateId;
    }
    if (updateShippingPackageSpecificationsDto.trackingCode !== undefined) {
      updateData.tracking_code =
        updateShippingPackageSpecificationsDto.trackingCode;
    }
    if (updateShippingPackageSpecificationsDto.labelUrl !== undefined) {
      updateData.label_url = updateShippingPackageSpecificationsDto.labelUrl;
    }
    if (updateShippingPackageSpecificationsDto.shipmentStatus !== undefined) {
      updateData.shipment_status =
        updateShippingPackageSpecificationsDto.shipmentStatus;
    }
    if (
      updateShippingPackageSpecificationsDto.estimatedDeliveryDays !== undefined
    ) {
      updateData.estimated_delivery_days =
        updateShippingPackageSpecificationsDto.estimatedDeliveryDays;
    }

    updateData.updated_at = new Date();

    await this.shippingPackageSpecificationsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async removeByShippingOrderId(shippingOrderId: number) {
    return this.shippingPackageSpecificationsRepository.delete({
      fk_shipping_order_id: shippingOrderId,
    });
  }

  async getPackageSpecificationsByShippingOrder(shippingOrderId: number) {
    const query = `
      SELECT 
        COUNT(*) as total_packages,
        COALESCE(SUM(weight), 0) as total_weight,
        COALESCE(SUM(length * width * height), 0) as total_volume
      FROM ShippingPackageSpecifications 
      WHERE fk_shipping_order_id = ?
    `;

    const result = await this.shippingPackageSpecificationsRepository.query(
      query,
      [shippingOrderId],
    );

    return {
      shipping_order_id: shippingOrderId,
      total_packages: parseInt(result[0]?.total_packages || 0, 10),
      total_weight: parseFloat(result[0]?.total_weight || 0),
      total_volume: parseFloat(result[0]?.total_volume || 0),
    };
  }
}
