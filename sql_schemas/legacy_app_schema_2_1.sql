/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     28/05/2025 5:38:27 am                        */
/*==============================================================*/


alter table Addresses 
   drop foreign key FK_ADDRESSES_CUSTOMER_ID;

alter table Contacts 
   drop foreign key FK_CONTACTS_CUSTOMER_ID;

alter table Customers 
   drop foreign key FK_CUSTOMER_ORG_ID;

alter table InvoiceItems 
   drop foreign key FK_IITEMS_PRODUCTS_ID;

alter table InvoiceItems 
   drop foreign key FK_IITEMS_INVOICES_ID;

alter table Invoices 
   drop foreign key FK_INVOICES_CUSTOMER_ID;

alter table OrderItems 
   drop foreign key FK_OITEMS_ORDERS_ID;

alter table OrderItems 
   drop foreign key FK_OITEMS_PRODUCTS_ID;

alter table Orders 
   drop foreign key FK_ORDERS_CUSTOMER_ID;

alter table Products 
   drop foreign key FK_PRODUCTS_CATEGORY_ID;

alter table PurchaseOrders 
   drop foreign key FK_PURCHASE_VENDORS_ID;

alter table QuoteItems 
   drop foreign key FK_QITEMS_QUOTES_ID;

alter table QuoteItems 
   drop foreign key FK_QITEMS_PRODUCTS_ID;

alter table Quotes 
   drop foreign key FK_QUOTES_CUSTOMER_ID;


alter table Addresses 
   drop foreign key FK_ADDRESSES_CUSTOMER_ID;

drop table if exists Addresses;


alter table Contacts 
   drop foreign key FK_CONTACTS_CUSTOMER_ID;

drop table if exists Contacts;


alter table Customers 
   drop foreign key FK_CUSTOMER_ORG_ID;

drop table if exists Customers;


alter table InvoiceItems 
   drop foreign key FK_IITEMS_INVOICES_ID;

alter table InvoiceItems 
   drop foreign key FK_IITEMS_PRODUCTS_ID;

drop table if exists InvoiceItems;


alter table Invoices 
   drop foreign key FK_INVOICES_CUSTOMER_ID;

drop table if exists Invoices;


alter table OrderItems 
   drop foreign key FK_OITEMS_ORDERS_ID;

alter table OrderItems 
   drop foreign key FK_OITEMS_PRODUCTS_ID;

drop table if exists OrderItems;


alter table Orders 
   drop foreign key FK_ORDERS_CUSTOMER_ID;

drop table if exists Orders;

drop table if exists Organizations;

drop table if exists ProductCategory;

drop table if exists ProductionOrders;


alter table Products 
   drop foreign key FK_PRODUCTS_CATEGORY_ID;

drop table if exists Products;


alter table PurchaseOrders 
   drop foreign key FK_PURCHASE_VENDORS_ID;

drop table if exists PurchaseOrders;


alter table QuoteItems 
   drop foreign key FK_QITEMS_QUOTES_ID;

alter table QuoteItems 
   drop foreign key FK_QITEMS_PRODUCTS_ID;

drop table if exists QuoteItems;


alter table Quotes 
   drop foreign key FK_QUOTES_CUSTOMER_ID;

drop table if exists Quotes;

drop table if exists Users;

drop table if exists Vendors;

/*==============================================================*/
/* Table: Addresses                                             */
/*==============================================================*/
create table Addresses
(
   pk_address_id        int not null auto_increment  comment '',
   fk_customer_id       int  comment '',
   billing_address      text  comment '',
   shipping_address     text  comment '',
   city                 varchar(100)  comment '',
   state                varchar(100)  comment '',
   postal_code          varchar(100)  comment '',
   country              varchar(100)  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_address_id)
);

/*==============================================================*/
/* Table: Contacts                                              */
/*==============================================================*/
create table Contacts
(
   pk_contact_id        int not null auto_increment  comment '',
   fk_customer_id       int  comment '',
   first_name           varchar(100)  comment '',
   last_name            varchar(100)  comment '',
   email                varchar(191)  comment '',
   phone_number         varchar(30)  comment '',
   mobile_number        varchar(30)  comment '',
   position_title       varchar(100)  comment '',
   contact_type         varchar(50)  comment 'PRIMARY','BILLING','TECH','DECISION_MAKER','OTHER',
   created_at           timestamp  comment '',
   updated_at           timestamp  comment '',
   primary key (pk_contact_id)
);

/*==============================================================*/
/* Table: Customers                                             */
/*==============================================================*/
create table Customers
(
   pk_customer_id       int not null auto_increment  comment '',
   fk_organization_id   int  comment '',
   name                 varchar(191)  comment '',
   email                varchar(191)  comment '',
   phone_number         varchar(30)  comment '',
   mobile_number        varchar(30)  comment '',
   website_url          text  comment '',
   industry             varchar(100)  comment '',
   customer_type        varchar(10)  comment 'enum(''LEAD'',''PROSPECT'',''CLIENT'') DEFAULT ''LEAD''',
   status               varchar(10)  comment 'enum(''ACTIVE'',''INACTIVE'',''ARCHIVED'') DEFAULT ''ACTIVE'',',
   source               varchar(100)  comment '',
   converted_at         datetime  comment '',
   notes                text  comment '',
   vat_number           varchar(50)  comment '',
   tax_id               varchar(50)  comment '',
   tags                 text  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_customer_id)
);

/*==============================================================*/
/* Table: InvoiceItems                                          */
/*==============================================================*/
create table InvoiceItems
(
   pk_invoice_item_id   int not null auto_increment  comment '',
   fk_invoice_id        int  comment '',
   fk_product_id        int  comment '',
   item_name            varchar(191)  comment '',
   item_description     text  comment '',
   quantity             decimal(10,2)  comment '',
   unit_price           decimal(12,2)  comment '',
   tax_rate             decimal(5,2)  comment '',
   line_total           decimal(12,2)  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_invoice_item_id)
);

/*==============================================================*/
/* Table: Invoices                                              */
/*==============================================================*/
create table Invoices
(
   pk_invoice_id        int not null auto_increment  comment '',
   fk_customer_id       int  comment '',
   invoice_number       varchar(50)  comment '',
   invoice_date         date  comment '',
   due_date             date  comment '',
   status               varchar(15)  comment 'enum(''DRAFT'',''SENT'',''PAID'',''PARTIALLY_PAID'',''OVERDUE'',''VOID'') DEFAULT ''DRAFT''',
   subtotal             decimal(12,2)  comment '',
   taxtotal             decimal(12,2)  comment '',
   total_amount         decimal(12,2)  comment '',
   currency             varchar(10)  comment 'DEFAULT ''USD''',
   notes                text  comment '',
   terms                text  comment '',
   tags                 text  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_invoice_id)
);

/*==============================================================*/
/* Table: OrderItems                                            */
/*==============================================================*/
create table OrderItems
(
   pk_order_item_id     int not null auto_increment  comment '',
   fk_order_id          int  comment '',
   fk_product_id        int  comment '',
   item_name            varchar(191)  comment '',
   item_description     text  comment '',
   quantity             decimal(10,2)  comment '',
   unit_price           decimal(12,2)  comment '',
   tax_rate             decimal(5,2)  comment '',
   line_total           decimal(12,2)  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_order_item_id)
);

/*==============================================================*/
/* Table: Orders                                                */
/*==============================================================*/
create table Orders
(
   pk_order_id          int not null auto_increment  comment '',
   fk_customer_id       int  comment '',
   order_number         varchar(50)  comment '',
   order_date           date  comment '',
   status               varchar(10)  comment 'enum(''DRAFT'',''CONFIRMED'',''FULFILLED'',''CANCELLED'',''ON_HOLD'') DEFAULT ''DRAFT''',
   subtotal             decimal(12,2)  comment '',
   tax_total            decimal(12,2)  comment '',
   total_amount         decimal(12,2)  comment '',
   currency             varchar(10)  comment '',
   notes                text  comment '',
   tags                 text  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_order_id)
);

/*==============================================================*/
/* Table: Organizations                                         */
/*==============================================================*/
create table Organizations
(
   pk_organization_id   int not null auto_increment  comment '',
   name                 varchar(191)  comment '',
   industry             varchar(100)  comment '',
   website_url          text  comment '',
   email                varchar(191)  comment '',
   phone_number         varchar(30)  comment '',
   billing_address      text  comment '',
   shipping_address     text  comment '',
   city                 varchar(100)  comment '',
   state                varchar(100)  comment '',
   postal_code          varchar(30)  comment '',
   country              varchar(100)  comment '',
   notes                text  comment '',
   tags                 text  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_organization_id)
);

/*==============================================================*/
/* Table: ProductCategory                                       */
/*==============================================================*/
create table ProductCategory
(
   pk_product_category_id int not null auto_increment  comment '',
   category_name        varchar(100)  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_product_category_id)
);

/*==============================================================*/
/* Table: ProductionOrders                                      */
/*==============================================================*/
create table ProductionOrders
(
   pk_production_orders_id int not null auto_increment  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_production_orders_id)
);

/*==============================================================*/
/* Table: Products                                              */
/*==============================================================*/
create table Products
(
   pk_production_id     int not null auto_increment  comment '',
   fk_category_id       int  comment '',
   image_url            text  comment '',
   product_name         varchar(100)  comment '',
   style                varchar(100)  comment '',
   status               varchar(20)  comment '',
   product_price        double  comment '',
   inventory            integer  comment '',
   supplier_name        varchar(100)  comment '',
   supplier_phone       varchar(30)  comment '',
   supplier_contact_name varchar(100)  comment '',
   supplier_email       varchar(191)  comment '',
   supplier_address     text  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_production_id)
);

/*==============================================================*/
/* Table: PurchaseOrders                                        */
/*==============================================================*/
create table PurchaseOrders
(
   pk_purchase_order_id int not null auto_increment  comment '',
   fk_vendor_id         int  comment '',
   brand_name           varchar(100)  comment '',
   po_number            varchar(50)  comment '',
   order_date           date  comment '',
   expected_delivery_date date  comment '',
   status               varchar(15)  comment ' enum(''DRAFT'',''ORDERED'',''RECEIVED'',''CANCELLED'',''PARTIALLY_RECEIVED'') DEFAULT ''DRAFT''',
   subtotal             decimal(12,2)  comment '',
   tax_total            decimal(12,2)  comment '',
   total_amount         decimal(12,2)  comment '',
   currency             varchar(10)  comment '',
   is_outsourced        boolean  comment '',
   production_notes     text  comment '',
   notes                text  comment '',
   tags                 text  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_purchase_order_id)
);

/*==============================================================*/
/* Table: QuoteItems                                            */
/*==============================================================*/
create table QuoteItems
(
   pk_quote_item_id     int not null auto_increment  comment '',
   fk_quote_id          int  comment '',
   fk_product_id        int  comment '',
   item_name            varchar(100)  comment '',
   item_description     text  comment '',
   quantity             decimal(10,2)  comment '',
   unit_price           decimal(12,2)  comment '',
   tax_rate             decimal(5,2)  comment '',
   line_total           decimal(12,2)  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_quote_item_id)
);

/*==============================================================*/
/* Table: Quotes                                                */
/*==============================================================*/
create table Quotes
(
   pk_quote_id          int not null auto_increment  comment '',
   fk_customer_id       int  comment '',
   quote_number         varchar(50)  comment '',
   quote_date           date  comment '',
   expiration_date      date  comment '',
   status               varchar(15)  comment 'enum(''DRAFT'',''SENT'',''ACCEPTED'',''REJECTED'',''EXPIRED'') DEFAULT ''DRAFT''',
   subtotal             decimal(12,2)  comment '',
   tax_total            decimal(12,2)  comment '',
   total_amount         decimal(12,2)  comment '',
   currency             varchar(10)  comment '',
   notes                text  comment '',
   terms                text  comment '',
   tags                 text  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_quote_id)
);

/*==============================================================*/
/* Table: Users                                                 */
/*==============================================================*/
create table Users
(
   pk_user_id           int not null auto_increment  comment '',
   username             varchar(191)  comment '',
   email                varchar(191)  comment '',
   cognito_id           varchar(191)  comment '',
   first_name           varchar(191)  comment '',
   last_name            varchar(191)  comment '',
   role                 varchar(20)  comment 'enum(''ADMIN'',''EMPLOYEE'') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''EMPLOYEE''',
   mobile_number        int  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_user_id)
);

/*==============================================================*/
/* Table: Vendors                                               */
/*==============================================================*/
create table Vendors
(
   pk_vendor_id         int not null auto_increment  comment '',
   name                 varchar(191)  comment '',
   email                varchar(191)  comment '',
   phone_number         varchar(30)  comment '',
   website_url          text  comment '',
   billing_address      text  comment '',
   shipping_address     text  comment '',
   city                 varchar(100)  comment '',
   state                varchar(100)  comment '',
   postal_code          varchar(50)  comment '',
   country              varchar(100)  comment '',
   industry             varchar(100)  comment '',
   vat_number           varchar(50)  comment '',
   tax_id               varchar(50)  comment '',
   tags                 text  comment '',
   notes                text  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_vendor_id)
);

alter table Addresses add constraint FK_ADDRESSES_CUSTOMER_ID foreign key (fk_customer_id)
      references Customers (pk_customer_id) on delete restrict on update restrict;

alter table Contacts add constraint FK_CONTACTS_CUSTOMER_ID foreign key (fk_customer_id)
      references Customers (pk_customer_id) on delete restrict on update restrict;

alter table Customers add constraint FK_CUSTOMER_ORG_ID foreign key (fk_organization_id)
      references Organizations (pk_organization_id) on delete restrict on update restrict;

alter table InvoiceItems add constraint FK_IITEMS_PRODUCTS_ID foreign key (fk_product_id)
      references Products (pk_production_id) on delete restrict on update restrict;

alter table InvoiceItems add constraint FK_IITEMS_INVOICES_ID foreign key (fk_invoice_id)
      references Invoices (pk_invoice_id) on delete restrict on update restrict;

alter table Invoices add constraint FK_INVOICES_CUSTOMER_ID foreign key (fk_customer_id)
      references Customers (pk_customer_id) on delete restrict on update restrict;

alter table OrderItems add constraint FK_OITEMS_ORDERS_ID foreign key (fk_order_id)
      references Orders (pk_order_id) on delete restrict on update restrict;

alter table OrderItems add constraint FK_OITEMS_PRODUCTS_ID foreign key (fk_product_id)
      references Products (pk_production_id) on delete restrict on update restrict;

alter table Orders add constraint FK_ORDERS_CUSTOMER_ID foreign key (fk_customer_id)
      references Customers (pk_customer_id) on delete restrict on update restrict;

alter table Products add constraint FK_PRODUCTS_CATEGORY_ID foreign key (fk_category_id)
      references ProductCategory (pk_product_category_id) on delete restrict on update restrict;

alter table PurchaseOrders add constraint FK_PURCHASE_VENDORS_ID foreign key (fk_vendor_id)
      references Vendors (pk_vendor_id) on delete restrict on update restrict;

alter table QuoteItems add constraint FK_QITEMS_QUOTES_ID foreign key (fk_quote_id)
      references Quotes (pk_quote_id) on delete restrict on update restrict;

alter table QuoteItems add constraint FK_QITEMS_PRODUCTS_ID foreign key (fk_product_id)
      references Products (pk_production_id) on delete restrict on update restrict;

alter table Quotes add constraint FK_QUOTES_CUSTOMER_ID foreign key (fk_customer_id)
      references Customers (pk_customer_id) on delete restrict on update restrict;

