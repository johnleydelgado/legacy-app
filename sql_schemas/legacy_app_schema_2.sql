/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     27/05/2025 7:30:45 pm                        */
/*==============================================================*/

ALTER TABLE Addresses
    DROP FOREIGN KEY FK_ADDRESSES_CUSTOMER_ID;

DROP TABLE IF EXISTS Addresses;

ALTER TABLE Contacts
    DROP FOREIGN KEY FK_CONTACTS_CUSTOMER_ID;

DROP TABLE IF EXISTS Contacts;

ALTER TABLE InvoiceItems
    DROP FOREIGN KEY FK_IITEMS_INVOICES_ID;

ALTER TABLE InvoiceItems
    DROP FOREIGN KEY FK_IITEMS_PRODUCTS_ID;

DROP TABLE IF EXISTS InvoiceItems;

ALTER TABLE Invoices
    DROP FOREIGN KEY FK_INVOICES_CUSTOMER_ID;

DROP TABLE IF EXISTS Invoices;

ALTER TABLE OrderItems
    DROP FOREIGN KEY FK_OITEMS_ORDERS_ID;

ALTER TABLE OrderItems
    DROP FOREIGN KEY FK_OITEMS_PRODUCTS_ID;

DROP TABLE IF EXISTS OrderItems;

ALTER TABLE Orders
    DROP FOREIGN KEY FK_ORDERS_CUSTOMER_ID;

DROP TABLE IF EXISTS Orders;

ALTER TABLE PurchaseOrders
    DROP FOREIGN KEY FK_PURCHASE_VENDORS_ID;

DROP TABLE IF EXISTS PurchaseOrders;

ALTER TABLE QuoteItems
    DROP FOREIGN KEY FK_QITEMS_QUOTES_ID;

ALTER TABLE QuoteItems
    DROP FOREIGN KEY FK_QITEMS_PRODUCTS_ID;

DROP TABLE IF EXISTS QuoteItems;

ALTER TABLE Quotes
    DROP FOREIGN KEY FK_QUOTES_CUSTOMER_ID;

DROP TABLE IF EXISTS Quotes;

ALTER TABLE Products
    DROP FOREIGN KEY FK_PRODUCTS_CATEGORY_ID;

DROP TABLE IF EXISTS Products;

DROP TABLE IF EXISTS ProductCategory;

DROP TABLE IF EXISTS ProductionOrders;

ALTER TABLE Customers
    DROP FOREIGN KEY FK_CUSTOMER_ORG_ID;

DROP TABLE IF EXISTS Customers;

DROP TABLE IF EXISTS Organizations;

DROP TABLE IF EXISTS Users;

DROP TABLE IF EXISTS Vendors;

/*==============================================================*/
/* Table: Addresses                                             */
/*==============================================================*/
CREATE TABLE IF NOT EXISTS Addresses
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
CREATE TABLE IF NOT EXISTS Contacts
(
   pk_contact_id        int not null auto_increment  comment '',
   fk_customer_id       int  comment '',
   first_name           varchar(100)  comment '',
   last_name            varchar(100)  comment '',
   email                varchar(191)  comment '',
   phone_number         varchar(30)  comment '',
   mobile_number        varchar(30)  comment '',
   position_title       varchar(100)  comment '',
   contact_type         varchar(50)  comment '\'PRIMARY\',\'BILLING\',\'TECH\',\'DECISION_MAKER\',\'OTHER\'',
   created_at           timestamp  comment '',
   updated_at           timestamp  comment '',
   primary key (pk_contact_id)
);

/*==============================================================*/
/* Table: Customers                                             */
/*==============================================================*/
CREATE TABLE IF NOT EXISTS Customers
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
CREATE TABLE IF NOT EXISTS InvoiceItems
(
   pk_invoice_item_id   int not null auto_increment comment '',
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
CREATE TABLE IF NOT EXISTS Invoices
(
   pk_invoice_id        int not null auto_increment comment '',
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
CREATE TABLE IF NOT EXISTS OrderItems
(
   pk_order_item_id     int not null auto_increment comment '',
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
CREATE TABLE IF NOT EXISTS Orders
(
   pk_order_id          int not null auto_increment comment '',
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
/* Table: Organizations                                          */
/*==============================================================*/
CREATE TABLE IF NOT EXISTS Organizations
(
   pk_organization_id   int not null auto_increment comment '',
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
CREATE TABLE IF NOT EXISTS ProductCategory
(
   pk_product_category_id int not null auto_increment comment '',
   category_name        varchar(100)  comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_product_category_id)
);

/*==============================================================*/
/* Table: ProductionOrders                                      */
/*==============================================================*/
CREATE TABLE IF NOT EXISTS ProductionOrders
(
   pk_production_orders_id int not null auto_increment comment '',
   created_at           datetime  comment '',
   updated_at           datetime  comment '',
   primary key (pk_production_orders_id)
);

/*==============================================================*/
/* Table: Products                                              */
/*==============================================================*/
CREATE TABLE IF NOT EXISTS Products
(
   pk_production_id     int not null auto_increment comment '',
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
CREATE TABLE IF NOT EXISTS PurchaseOrders
(
   pk_purchase_order_id int not null auto_increment comment '',
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
CREATE TABLE IF NOT EXISTS QuoteItems
(
   pk_quote_item_id     int not null auto_increment comment '',
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
CREATE TABLE IF NOT EXISTS Quotes
(
   pk_quote_id          int not null auto_increment comment '',
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
CREATE TABLE IF NOT EXISTS Users
(
   pk_user_id           int not null auto_increment comment '',
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
CREATE TABLE IF NOT EXISTS Vendors
(
   pk_vendor_id         int not null auto_increment comment '',
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

ALTER TABLE Addresses add constraint FK_ADDRESSES_CUSTOMER_ID foreign key (fk_customer_id)
      references Customers (pk_customer_id) on delete restrict on update restrict;

ALTER TABLE Contacts add constraint FK_CONTACTS_CUSTOMER_ID foreign key (fk_customer_id)
      references Customers (pk_customer_id) on delete restrict on update restrict;

ALTER TABLE Customers add constraint FK_CUSTOMER_ORG_ID foreign key (fk_organization_id)
      references Organizations (pk_organization_id) on delete restrict on update restrict;

ALTER TABLE InvoiceItems add constraint FK_IITEMS_PRODUCTS_ID foreign key (fk_product_id)
      references Products (pk_production_id) on delete restrict on update restrict;

ALTER TABLE InvoiceItems add constraint FK_IITEMS_INVOICES_ID foreign key (fk_invoice_id)
      references Invoices (pk_invoice_id) on delete restrict on update restrict;

ALTER TABLE Invoices add constraint FK_INVOICES_CUSTOMER_ID foreign key (fk_customer_id)
      references Customers (pk_customer_id) on delete restrict on update restrict;

ALTER TABLE OrderItems add constraint FK_OITEMS_ORDERS_ID foreign key (fk_order_id)
      references Orders (pk_order_id) on delete restrict on update restrict;

ALTER TABLE OrderItems add constraint FK_OITEMS_PRODUCTS_ID foreign key (fk_product_id)
      references Products (pk_production_id) on delete restrict on update restrict;

ALTER TABLE Orders add constraint FK_ORDERS_CUSTOMER_ID foreign key (fk_customer_id)
      references Customers (pk_customer_id) on delete restrict on update restrict;

ALTER TABLE Products add constraint FK_PRODUCTS_CATEGORY_ID foreign key (fk_category_id)
      references ProductCategory (pk_product_category_id) on delete restrict on update restrict;

ALTER TABLE PurchaseOrders add constraint FK_PURCHASE_VENDORS_ID foreign key (fk_vendor_id)
      references Vendors (pk_vendor_id) on delete restrict on update restrict;

ALTER TABLE QuoteItems add constraint FK_QITEMS_QUOTES_ID foreign key (fk_quote_id)
      references Quotes (pk_quote_id) on delete restrict on update restrict;

ALTER TABLE QuoteItems add constraint FK_QITEMS_PRODUCTS_ID foreign key (fk_product_id)
      references Products (pk_production_id) on delete restrict on update restrict;

ALTER TABLE Quotes add constraint FK_QUOTES_CUSTOMER_ID foreign key (fk_customer_id)
      references Customers (pk_customer_id) on delete restrict on update restrict;

