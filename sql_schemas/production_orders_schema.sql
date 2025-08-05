-- Production Orders Database Schema
-- Created: 2025-07-31
-- Description: Complete schema for ProductionOrders and related tables

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS `ProductionOrderYarnColors`;
DROP TABLE IF EXISTS `ProductionOrderKnitColors`;
DROP TABLE IF EXISTS `ProductionOrderItems`;
DROP TABLE IF EXISTS `ProductionOrders`;

-- Create ProductionOrders table
CREATE TABLE `ProductionOrders` (
  `pk_production_order_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_customer_id` int unsigned NOT NULL,
  `fk_factory_id` int unsigned NOT NULL,
  `fk_serial_encoder_id` int unsigned DEFAULT NULL,
  `fk_status_id` int unsigned DEFAULT NULL,
  `production_order_number` varchar(50) NOT NULL,
  `order_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `actual_delivery_date` date DEFAULT NULL,
  `priority` enum('URGENT','HIGH','NORMAL','LOW') DEFAULT 'NORMAL',
  `status` enum('DRAFT','SENT_TO_FACTORY','IN_PRODUCTION','COMPLETED','CANCELLED','ON_HOLD') DEFAULT 'DRAFT',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) DEFAULT 'USD',
  `client_name` varchar(255) DEFAULT NULL,
  `client_description` text DEFAULT NULL,
  `tech_pack_name` varchar(255) DEFAULT NULL,
  `rep_name` varchar(255) DEFAULT NULL,
  `ec_name` varchar(255) DEFAULT NULL,
  `shipping_method` varchar(100) DEFAULT NULL,
  `production_notes` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `user_owner` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`pk_production_order_id`),
  UNIQUE KEY `uniq_production_order_number` (`production_order_number`),
  KEY `idx_fk_customer_id` (`fk_customer_id`),
  KEY `idx_fk_factory_id` (`fk_factory_id`),
  KEY `idx_fk_serial_encoder_id` (`fk_serial_encoder_id`),
  KEY `idx_fk_status_id` (`fk_status_id`),
  KEY `idx_order_date` (`order_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_productionorders_customers` FOREIGN KEY (`fk_customer_id`) REFERENCES `Customers` (`pk_customer_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_productionorders_factories` FOREIGN KEY (`fk_factory_id`) REFERENCES `Factories` (`pk_factory_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_productionorders_serialencoder` FOREIGN KEY (`fk_serial_encoder_id`) REFERENCES `SerialEncoder` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_productionorders_status` FOREIGN KEY (`fk_status_id`) REFERENCES `Status` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create ProductionOrderItems table
CREATE TABLE `ProductionOrderItems` (
  `pk_production_order_item_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_production_order_id` int unsigned NOT NULL,
  `fk_product_id` int unsigned DEFAULT NULL,
  `fk_category_id` int unsigned DEFAULT NULL,
  `fk_trim_id` int unsigned DEFAULT NULL,
  `fk_packaging_id` int unsigned DEFAULT NULL,
  `fk_yarn_id` int unsigned DEFAULT NULL,
  `item_number` varchar(50) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `item_description` text DEFAULT NULL,
  `body_color` varchar(100) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT '1.00',
  `unit_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_price` decimal(12,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  `tax_rate` decimal(5,4) DEFAULT '0.0800',
  `artwork_url` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`pk_production_order_item_id`),
  KEY `idx_fk_production_order_id` (`fk_production_order_id`),
  KEY `idx_fk_product_id` (`fk_product_id`),
  KEY `idx_fk_category_id` (`fk_category_id`),
  KEY `idx_fk_trim_id` (`fk_trim_id`),
  KEY `idx_fk_packaging_id` (`fk_packaging_id`),
  KEY `idx_fk_yarn_id` (`fk_yarn_id`),
  CONSTRAINT `fk_productionorderitems_productionorders` FOREIGN KEY (`fk_production_order_id`) REFERENCES `ProductionOrders` (`pk_production_order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_productionorderitems_products` FOREIGN KEY (`fk_product_id`) REFERENCES `Products` (`pk_product_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_productionorderitems_productcategory` FOREIGN KEY (`fk_category_id`) REFERENCES `ProductCategory` (`pk_product_category_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_productionorderitems_trims` FOREIGN KEY (`fk_trim_id`) REFERENCES `Trims` (`pk_trim_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_productionorderitems_packaging` FOREIGN KEY (`fk_packaging_id`) REFERENCES `Packaging` (`pk_packaging_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_productionorderitems_yarn` FOREIGN KEY (`fk_yarn_id`) REFERENCES `Yarn` (`pk_yarn_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create ProductionOrderKnitColors table for knit-in color specifications
CREATE TABLE `ProductionOrderKnitColors` (
  `pk_knit_color_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_production_order_item_id` int unsigned NOT NULL,
  `color_name` varchar(255) NOT NULL,
  `color_type` varchar(100) NOT NULL COMMENT 'e.g., Leg Logo, Toe Logo, Design',
  `yarn_type` varchar(100) DEFAULT NULL COMMENT 'e.g., Texas Orange Nylon',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`pk_knit_color_id`),
  KEY `idx_fk_production_order_item_id` (`fk_production_order_item_id`),
  CONSTRAINT `fk_knitcolors_productionorderitems` FOREIGN KEY (`fk_production_order_item_id`) REFERENCES `ProductionOrderItems` (`pk_production_order_item_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create ProductionOrderYarnColors table for yarn color specifications
CREATE TABLE `ProductionOrderYarnColors` (
  `pk_yarn_color_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_production_order_id` int unsigned NOT NULL,
  `color_name` varchar(255) NOT NULL,
  `color_hex` varchar(7) DEFAULT NULL COMMENT 'Hex color code',
  `yarn_type` varchar(100) DEFAULT NULL COMMENT 'e.g., Natural Cotton, Nylon',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`pk_yarn_color_id`),
  KEY `idx_fk_production_order_id` (`fk_production_order_id`),
  CONSTRAINT `fk_yarncolors_productionorders` FOREIGN KEY (`fk_production_order_id`) REFERENCES `ProductionOrders` (`pk_production_order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create Factories table if it doesn't exist
CREATE TABLE IF NOT EXISTS `Factories` (
  `pk_factory_id` int unsigned NOT NULL AUTO_INCREMENT,
  `factory_name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `specialties` json DEFAULT NULL COMMENT 'Production capabilities',
  `lead_time_days` int DEFAULT '0',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`pk_factory_id`),
  KEY `idx_factory_name` (`factory_name`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- NOTES:
-- 1. This schema supports all fields shown in the PDF preview dialog
-- 2. ProductionOrders uses factories instead of vendors (key difference from PurchaseOrders)
-- 3. total_price in ProductionOrderItems is auto-calculated (quantity * unit_price)
-- 4. Includes support for knit-in colors and yarn color specifications
-- 5. Make sure referenced tables exist before running foreign key constraints