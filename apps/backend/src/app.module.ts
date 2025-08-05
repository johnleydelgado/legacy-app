import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ContactsModule } from './modules/contacts/contacts.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CustomerFilesModule } from './modules/customer-files/customer-files.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProductsCategoryModule } from './modules/products-category/products-category.module';
import { CustomersAddressesModule } from './modules/customers-addresses/customers-addresses.module';
import { OrderItemsModule } from './modules/order-items/order-items.module';
import { ProductsEntity } from './modules/products/products.entity';
import { ProductsCategoryEntity } from './modules/products-category/products-category.entity';
import { AddressesModule } from './modules/addresses/addresses.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { QuoteItemsModule } from './modules/quotes-items/quote-items.module';
import { ShippingOrdersModule } from './modules/shipping-orders/shipping-orders.module';
import { ShippingOrderItemsModule } from './modules/shipping-order-items/shipping-order-items.module';
import { ShippingPackageSpecificationsModule } from './modules/shipping-package-specifications/shipping-package-specifications.module';
import { ShippingPackageSpecItemsModule } from './modules/shipping-package-spec-items/shipping-package-spec-items.module';
import { TrimsModule } from './modules/trims/trims.module';
import { YarnsModule } from './modules/yarns/yarns.module';
import { PackagingModule } from './modules/packaging/packaging.module';
import { ProductPricesModule } from './modules/product-prices/product-prices.module';
import { ProductPricesEntity } from './modules/product-prices/product-prices.entity';
import { VendorsEntity } from './modules/vendors/vendors.entity';
import { VendorsModule } from './modules/vendors/vendors.module';
import { StatusModule } from './modules/status/status.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { InvoicesItemsModule } from './modules/invoices-items/invoices-items.module';
import { QuotesApprovalModule } from './modules/quotes-approval/quotes-approval.module';
import { ActivityHistoryModule } from './modules/activity-history/activity-history.module';
import { ActivityTypeModule } from './modules/activity-type/activity-type.module';
import { SerialEncoderModule } from './modules/serial-encoder/serial-encoder.module';
import { ImageGalleryModule } from './modules/image-gallery/image-gallery.module';
import { S3Module } from './modules/s3/s3.module';
import { VendorsTypeModule } from './modules/vendors-type/vendors-type.module';
import { VendorsServiceCategoryModule } from './modules/vendors-service-category/vendors-service-category.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { LocationTypesModule } from './modules/location-types/location-types.module';
import { PurchaseOrdersLeadNumbersModule } from './modules/purchase-orders-lead-numbers/purchase-orders-lead-numbers.module';
import { PurchaseOrdersShippingMethodsModule } from './modules/purchase-orders-shipping-methods/purchase-orders-shipping-methods.module';
import { EmailNotificationsModule } from './modules/email-notifications/email-notifications.module';
import { EmailNotificationsEntity } from './modules/email-notifications/email-notifications.entity';
import { FactoriesModule } from './modules/factories/factories.module';
import { PurchaseOrdersItemsModule } from './modules/purchase-orders-items/purchase-orders-items.module';
import { ShippingDimensionPresetsModule } from './modules/shipping-dimension-presets/shipping-dimension-presets.module';
import { ShippingWeightPresetsModule } from './modules/shipping-weight-presets/shipping-weight-presets.module';
import { ShippingDimensionPresetsEntity } from './modules/shipping-dimension-presets/shipping-dimension-presets.entity';
import { ShippingWeightPresetsEntity } from './modules/shipping-weight-presets/shipping-weight-presets.entity';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProductionOrdersModule } from './modules/production-orders/production-orders.module';
import { ProductionOrderItemsModule } from './modules/production-order-items/production-order-items.module';
import { ProductionOrdersKnitColorsModule } from './modules/production-orders-knit-colors/production-orders-knit-colors.module';
import { ProductionOrdersBodyColorsModule } from './modules/production-orders-body-colors/production-orders-body-colors.module';
import { ProductionOrdersPackagingModule } from './modules/production-orders-packaging/production-orders-packaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [
        ProductsEntity,
        ProductsCategoryEntity,
        ProductPricesEntity,
        VendorsEntity,
        EmailNotificationsEntity,
        ShippingDimensionPresetsEntity,
        ShippingWeightPresetsEntity,
      ], // explicit or use glob
      // or: entities: [__dirname + '/../../**/*.entity{.js,.ts}'],
      synchronize: false, // true only in dev
      autoLoadEntities: true, // lets forFeature() entities register themselves
    }),
    // AuthModule,
    DatabaseModule,
    ContactsModule,
    CustomersModule,
    CustomerFilesModule,
    OrdersModule,
    ProductsModule,
    OrganizationsModule,
    ProductsCategoryModule,
    CustomersAddressesModule,
    OrderItemsModule,
    AddressesModule,
    QuotesModule,
    QuoteItemsModule,
    ShippingOrdersModule,
    ShippingOrderItemsModule,
    ShippingPackageSpecificationsModule,
    ShippingPackageSpecItemsModule,
    TrimsModule,
    YarnsModule,
    PackagingModule,
    ProductPricesModule,
    VendorsModule,
    StatusModule,
    InvoicesModule,
    InvoicesItemsModule,
    QuotesApprovalModule,
    ActivityHistoryModule,
    ActivityTypeModule,
    SerialEncoderModule,
    ImageGalleryModule,
    S3Module,
    VendorsTypeModule,
    VendorsServiceCategoryModule,
    PurchaseOrdersModule,
    LocationTypesModule,
    PurchaseOrdersLeadNumbersModule,
    PurchaseOrdersShippingMethodsModule,
    EmailNotificationsModule,
    FactoriesModule,
    PurchaseOrdersItemsModule,
    ShippingDimensionPresetsModule,
    ShippingWeightPresetsModule,
    DashboardModule,
    ProductionOrdersModule,
    ProductionOrderItemsModule,
    ProductionOrdersKnitColorsModule,
    ProductionOrdersBodyColorsModule,
    ProductionOrdersPackagingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
