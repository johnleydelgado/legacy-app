-- First drop all tables in reverse order of dependencies
DROP TABLE IF EXISTS `Activities`;
DROP TABLE IF EXISTS `ActivityTypes`;
DROP TABLE IF EXISTS `AddressTypes`;
DROP TABLE IF EXISTS `Addresses`;
DROP TABLE IF EXISTS `Contacts`;
DROP TABLE IF EXISTS `CustomerFiles`;
DROP TABLE IF EXISTS `QuoteItems`;
DROP TABLE IF EXISTS `Quotes`;
DROP TABLE IF EXISTS `OrderItems`;
DROP TABLE IF EXISTS `Orders`;
DROP TABLE IF EXISTS `InvoiceItems`;
DROP TABLE IF EXISTS `Invoices`;
DROP TABLE IF EXISTS `Customers`;
DROP TABLE IF EXISTS `ImageGallery`;
DROP TABLE IF EXISTS `Organizations`;
DROP TABLE IF EXISTS `Packaging`;
DROP TABLE IF EXISTS `Preferences`;
DROP TABLE IF EXISTS `ProductCategory`;
DROP TABLE IF EXISTS `ProductPrices`;
DROP TABLE IF EXISTS `ProductionOrders`;
DROP TABLE IF EXISTS `Products`;
DROP TABLE IF EXISTS `PurchaseOrders`;
DROP TABLE IF EXISTS `QuotesApproval`;
DROP TABLE IF EXISTS `SerialEncoder`;
DROP TABLE IF EXISTS `ShippingOrderItems`;
DROP TABLE IF EXISTS `Status`;
DROP TABLE IF EXISTS `Styles`;
DROP TABLE IF EXISTS `Trims`;
DROP TABLE IF EXISTS `Users`;
DROP TABLE IF EXISTS `VendorServiceCategory`;
DROP TABLE IF EXISTS `Vendors`;
DROP TABLE IF EXISTS `VendorsType`;
DROP TABLE IF EXISTS `Yarn`;

-- Create tables in order of dependencies (parent tables first)

-- Independent tables (no foreign key dependencies)
CREATE TABLE `ActivityTypes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `AddressTypes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Packaging` (
  `pk_packaging_id` int unsigned NOT NULL AUTO_INCREMENT,
  `packaging` varchar(100) DEFAULT NULL,
  `instruction` text,
  PRIMARY KEY (`pk_packaging_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Preferences` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tax` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ProductCategory` (
  `pk_product_category_id` int NOT NULL,
  `category_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`pk_product_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `SerialEncoder` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `purpose` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Status` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `platform` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `process` varchar(25) DEFAULT NULL,
  `status` varchar(25) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Styles` (
  `pk_style_id` int unsigned NOT NULL AUTO_INCREMENT,
  `style_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`pk_style_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Trims` (
  `pk_trim_id` int unsigned NOT NULL AUTO_INCREMENT,
  `trim` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`pk_trim_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Users` (
  `pk_user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `cognito_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('ADMIN','EMPLOYEE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EMPLOYEE',
  `mobile_number` int DEFAULT NULL,
  PRIMARY KEY (`pk_user_id`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_cognitoId_key` (`cognito_id`),
  UNIQUE KEY `User_username_key` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `VendorServiceCategory` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `VendorsType` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Yarn` (
  `pk_yarn_id` int unsigned NOT NULL AUTO_INCREMENT,
  `yarn_color` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `card_number` int DEFAULT NULL,
  `color_code` varchar(20) DEFAULT NULL,
  `yarn_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`pk_yarn_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- First level of dependencies
CREATE TABLE `Organizations` (
  `pk_organization_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `industry` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `shipping_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tags` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`pk_organization_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Vendors` (
  `pk_vendor_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_vendor_type_id` int unsigned DEFAULT NULL,
  `fk_vendor_service_category_id` int unsigned DEFAULT NULL,
  `status` enum('ACTIVE','BLOCKED') DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `website_url` varchar(255) DEFAULT NULL,
  `billing_address` text,
  `shipping_address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `location` varchar(15) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `vat_number` varchar(50) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `notes` text,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`pk_vendor_id`),
  KEY `idx_vendor_name` (`name`),
  KEY `idx_vendor_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Products` (
  `fk_organization_id` int NOT NULL,
  `pk_product_id` int unsigned NOT NULL AUTO_INCREMENT,
  `inventory` int DEFAULT NULL,
  `fk_category_id` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` timestamp NOT NULL,
  `style` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `product_price` double DEFAULT NULL,
  `image_url` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `trims` varchar(100) DEFAULT NULL,
  `yarn` varchar(100) DEFAULT NULL,
  `packaging` varchar(100) DEFAULT NULL,
  `image_urls` json DEFAULT NULL,
  `fk_vendor_id` int DEFAULT NULL,
  PRIMARY KEY (`pk_product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1051 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Second level of dependencies
CREATE TABLE `Customers` (
  `pk_customer_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_organization_id` int unsigned DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `owner_name` varchar(100) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `website_url` varchar(255) DEFAULT NULL,
  `account_owner` varchar(100) DEFAULT NULL,
  `billing_address` text,
  `shipping_address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `customer_type` enum('LEAD','PROSPECT','CLIENT') DEFAULT 'LEAD',
  `status` enum('ACTIVE','INACTIVE','ARCHIVED') DEFAULT 'ACTIVE',
  `source` varchar(100) DEFAULT NULL,
  `converted_at` datetime(3) DEFAULT NULL,
  `notes` text,
  `vat_number` varchar(50) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`pk_customer_id`),
  KEY `idx_customer_name` (`name`),
  KEY `idx_customer_email` (`email`),
  KEY `idx_customer_type_status` (`customer_type`,`status`),
  KEY `idx_fk_organization_id` (`fk_organization_id`),
  CONSTRAINT `fk_customers_organizations` FOREIGN KEY (`fk_organization_id`) REFERENCES `Organizations` (`pk_organization_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=224 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Third level of dependencies
CREATE TABLE `Activities` (
  `pk_activity_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_customer_id` int NOT NULL,
  `status` int NOT NULL,
  `tags` tinyblob,
  `activity` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `activity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `document_id` int NOT NULL,
  `document_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  PRIMARY KEY (`pk_activity_id`)
) ENGINE=InnoDB AUTO_INCREMENT=484 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Addresses` (
  `pk_address_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_id` int NOT NULL,
  `address1` varchar(100) DEFAULT NULL,
  `address2` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(20) DEFAULT NULL,
  `zip` varchar(50) DEFAULT NULL,
  `country` varchar(20) DEFAULT NULL,
  `address_type` enum('BILLING','SHIPPING') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `table` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`pk_address_id`)
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Contacts` (
  `pk_contact_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_id` int unsigned NOT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position_title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_type` enum('PRIMARY','BILLING','SHIPPING','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'OTHER',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `table` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`pk_contact_id`),
  KEY `fk_customer_id` (`fk_id`)
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `CustomerFiles` (
  `pk_customer_file_id` bigint NOT NULL AUTO_INCREMENT,
  `fk_customer_id` bigint NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `public_url` text NOT NULL,
  `mime_type` varchar(150) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  PRIMARY KEY (`pk_customer_file_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Invoices` (
  `pk_invoice_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_customer_id` int unsigned NOT NULL,
  `fk_status_id` int unsigned NOT NULL DEFAULT '11',
  `fk_serial_encoder_id` int unsigned DEFAULT NULL,
  `invoice_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) GENERATED ALWAYS AS ((`tax_total` + `subtotal`)) STORED,
  `currency` varchar(10) DEFAULT 'USD',
  `notes` text,
  `terms` text,
  `tags` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`pk_invoice_id`),
  KEY `idx_fk_customer_id` (`fk_customer_id`),
  CONSTRAINT `fk_invoices_customers` FOREIGN KEY (`fk_customer_id`) REFERENCES `Customers` (`pk_customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Orders` (
  `pk_order_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_status_id` int unsigned NOT NULL,
  `fk_customer_id` int unsigned NOT NULL,
  `fk_serial_encoder_id` int unsigned DEFAULT NULL,
  `order_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `order_date` date NOT NULL,
  `delivery_date` date DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) GENERATED ALWAYS AS ((`tax_total` + `subtotal`)) STORED,
  `currency` varchar(10) DEFAULT 'USD',
  `notes` text,
  `terms` text,
  `tags` json DEFAULT NULL,
  `address_json` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`pk_order_id`),
  KEY `idx_fk_customer_id_orders` (`fk_customer_id`),
  CONSTRAINT `fk_orders_customers` FOREIGN KEY (`fk_customer_id`) REFERENCES `Customers` (`pk_customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=309 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `PurchaseOrders` (
  `pk_purchase_order_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_vendor_id` int unsigned NOT NULL,
  `brand_name` varchar(100) DEFAULT NULL,
  `po_number` varchar(50) NOT NULL,
  `order_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `status` enum('DRAFT','ORDERED','RECEIVED','CANCELLED','PARTIALLY_RECEIVED') DEFAULT 'DRAFT',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) DEFAULT 'USD',
  `is_outsourced` tinyint(1) DEFAULT '0',
  `production_notes` text,
  `notes` text,
  `tags` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`pk_purchase_order_id`),
  UNIQUE KEY `uniq_po_number` (`po_number`),
  KEY `idx_fk_vendor_id` (`fk_vendor_id`),
  CONSTRAINT `fk_purchaseorders_vendors` FOREIGN KEY (`fk_vendor_id`) REFERENCES `Vendors` (`pk_vendor_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Quotes` (
  `pk_quote_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_customer_id` int unsigned NOT NULL,
  `fk_status_id` int unsigned NOT NULL,
  `fk_serial_encoder_id` int unsigned DEFAULT NULL,
  `quote_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `quote_date` date NOT NULL,
  `expiration_date` date DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) GENERATED ALWAYS AS ((`tax_total` + `subtotal`)) STORED,
  `currency` varchar(10) DEFAULT 'USD',
  `notes` text,
  `terms` text,
  `tags` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`pk_quote_id`),
  KEY `idx_fk_customer_id_quotes` (`fk_customer_id`),
  CONSTRAINT `fk_quotes_customers` FOREIGN KEY (`fk_customer_id`) REFERENCES `Customers` (`pk_customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Final level of dependencies
CREATE TABLE `ImageGallery` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_item_id` int unsigned DEFAULT NULL,
  `fk_item_type` enum('QUOTES','ORDERS','INVOICE','PURCHASE','PRODUCTION') DEFAULT NULL,
  `url` text,
  `filename` varchar(191) DEFAULT NULL,
  `file_extension` varchar(20) DEFAULT NULL,
  `type` enum('LOGO','ARTWORK','OTHER') DEFAULT 'OTHER',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `InvoiceItems` (
  `pk_invoice_item_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_invoice_id` int unsigned NOT NULL,
  `fk_product_id` int unsigned DEFAULT NULL,
  `fk_serial_encoder_id` int unsigned DEFAULT NULL,
  `item_number` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `item_name` varchar(191) NOT NULL,
  `item_description` text,
  `quantity` decimal(10,2) NOT NULL DEFAULT '1.00',
  `unit_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_rate` decimal(5,2) DEFAULT '0.00',
  `line_total` decimal(12,2) GENERATED ALWAYS AS (((`quantity` * `unit_price`) * (1 + `tax_rate`))) STORED,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`pk_invoice_item_id`),
  KEY `idx_fk_invoice_id` (`fk_invoice_id`),
  KEY `idx_fk_product_id` (`fk_product_id`),
  CONSTRAINT `fk_invoiceitems_invoices` FOREIGN KEY (`fk_invoice_id`) REFERENCES `Invoices` (`pk_invoice_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invoiceitems_products` FOREIGN KEY (`fk_product_id`) REFERENCES `Products` (`pk_product_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `OrderItems` (
  `pk_order_item_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_order_id` int unsigned NOT NULL,
  `fk_product_id` int unsigned DEFAULT NULL,
  `fk_shipping_address_id` int unsigned NOT NULL,
  `fk_packaging_id` int unsigned DEFAULT NULL,
  `fk_trim_id` int unsigned DEFAULT NULL,
  `fk_yarn_id` int unsigned DEFAULT NULL,
  `item_number` varchar(191) DEFAULT NULL,
  `item_name` varchar(191) NOT NULL,
  `item_description` text,
  `artwork_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `quantity` decimal(10,2) NOT NULL DEFAULT '1.00',
  `unit_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_rate` decimal(5,2) DEFAULT '0.00',
  `line_total` decimal(12,2) GENERATED ALWAYS AS (((`quantity` * `unit_price`) * (1 + `tax_rate`))) STORED,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`pk_order_item_id`),
  KEY `idx_fk_order_id` (`fk_order_id`),
  KEY `idx_fk_product_id_order_items` (`fk_product_id`),
  CONSTRAINT `fk_orderitems_orders` FOREIGN KEY (`fk_order_id`) REFERENCES `Orders` (`pk_order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orderitems_products` FOREIGN KEY (`fk_product_id`) REFERENCES `Products` (`pk_product_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1700 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ProductPrices` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `max_qty` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `fk_product_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ProductionOrders` (
  `pk_production_order_id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`pk_production_order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `QuoteItems` (
  `pk_quote_item_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_quote_id` int unsigned NOT NULL,
  `fk_product_id` int unsigned DEFAULT NULL,
  `fk_shipping_address_id` int unsigned DEFAULT NULL,
  `fk_packaging_id` int unsigned DEFAULT NULL,
  `fk_trim_id` int unsigned DEFAULT NULL,
  `fk_yarn_id` int unsigned DEFAULT NULL,
  `item_number` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `item_name` varchar(191) NOT NULL,
  `item_description` text,
  `artwork_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `quantity` decimal(10,2) NOT NULL DEFAULT '1.00',
  `unit_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_rate` decimal(5,2) DEFAULT '0.00',
  `line_total` decimal(12,2) GENERATED ALWAYS AS (((`quantity` * `unit_price`) * (1 + `tax_rate`))) STORED,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`pk_quote_item_id`),
  KEY `idx_fk_quote_id` (`fk_quote_id`),
  KEY `idx_fk_product_id_quote_items` (`fk_product_id`),
  CONSTRAINT `fk_quoteitems_products` FOREIGN KEY (`fk_product_id`) REFERENCES `Products` (`pk_product_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_quoteitems_quotes` FOREIGN KEY (`fk_quote_id`) REFERENCES `Quotes` (`pk_quote_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=320 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `QuotesApproval` (
  `pk_quote_approval_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `fk_quote_id` bigint unsigned NOT NULL,
  `fk_customer_id` bigint unsigned NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL,
  `reason` varchar(250) DEFAULT NULL,
  `token_hash` char(64) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payload` json DEFAULT NULL,
  PRIMARY KEY (`pk_quote_approval_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ShippingOrderItems` (
  `pk_shipping_order_item_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_shipping_order_id` int unsigned NOT NULL,
  `fk_product_id` int unsigned DEFAULT NULL,
  `fk_shipping_address_id` int unsigned NOT NULL,
  `fk_packaging_id` int unsigned DEFAULT NULL,
  `fk_trim_id` int unsigned DEFAULT NULL,
  `fk_yarn_id` int unsigned DEFAULT NULL,
  `item_number` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `item_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `item_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `artwork_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `quantity` decimal(10,2) NOT NULL DEFAULT '1.00',
  `unit_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_rate` decimal(5,2) DEFAULT '0.00',
  `line_total` decimal(12,2) GENERATED ALWAYS AS (((`quantity` * `unit_price`) * (1 + (`tax_rate` / 100)))) STORED,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`pk_shipping_order_item_id`),
  KEY `fk_orderitems_orders_copy` (`fk_shipping_order_id`),
  KEY `fk_orderitems_products_copy` (`fk_product_id`),
  CONSTRAINT `fk_orderitems_orders_copy` FOREIGN KEY (`fk_shipping_order_id`) REFERENCES `Orders` (`pk_order_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_orderitems_products_copy` FOREIGN KEY (`fk_product_id`) REFERENCES `Products` (`pk_product_id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
