--
-- Table structure for table `Vendors`
--

-- DROP TABLE IF EXISTS `Vendors`;

-- CREATE TABLE `Vendors` (
--   `pk_vendor_id` int unsigned NOT NULL AUTO_INCREMENT,
--   `fk_vendor_type_id` int unsigned DEFAULT NULL,
--   `fk_vendor_service_category_id` int unsigned DEFAULT NULL,
--   `status` enum('ACTIVE','BLOCKED') DEFAULT NULL,
--   `name` varchar(191) NOT NULL,
--   `email` varchar(191) DEFAULT NULL,
--   `phone_number` varchar(20) DEFAULT NULL,
--   `website_url` varchar(255) DEFAULT NULL,
--   `billing_address` text,
--   `shipping_address` text,
--   `city` varchar(100) DEFAULT NULL,
--   `state` varchar(100) DEFAULT NULL,
--   `location` varchar(15) DEFAULT NULL,
--   `postal_code` varchar(20) DEFAULT NULL,
--   `country` varchar(100) DEFAULT NULL,
--   `industry` varchar(100) DEFAULT NULL,
--   `vat_number` varchar(50) DEFAULT NULL,
--   `tax_id` varchar(50) DEFAULT NULL,
--   `tags` json DEFAULT NULL,
--   `notes` text,
--   `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
--   `updated_at` datetime(3) NOT NULL,
--   PRIMARY KEY (`pk_vendor_id`),
--   KEY `idx_vendor_name` (`name`),
--   KEY `idx_vendor_email` (`email`)
-- ) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Vendors`
--

LOCK TABLES `Vendors` WRITE;

INSERT INTO `Vendors` VALUES 
(1,1,3,'ACTIVE','Haining Joy Trading Company',NULL,NULL,NULL,'No23 WenLi Rd\n1802 Room, Building 5\nHaining City, Zhejiang','No23 WenLi Rd\n1802 Room, Building 5\nHaining City, Zhejiang',NULL,NULL,'Import',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-29 18:26:39.549','2025-05-29 18:26:39.000'),
(2,2,1,'ACTIVE','GD Cap',NULL,NULL,NULL,'No.68-8, Lane 3029 Huaxu Road, Huaxin Town, Qingpu District, Shanghai 201705','No.68-8, Lane 3029 Huaxu Road, Huaxin Town, Qingpu District, Shanghai 201705',NULL,NULL,'Import',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-29 18:26:39.549','2025-05-29 18:26:39.000'),
(3,2,6,'ACTIVE','Wellfaire Unlimited Caps',NULL,NULL,NULL,'No 2 Shang Sheng Rd, Xin An Community\nChang An Town, Dongguan City, China 523882','No 2 Shang Sheng Rd, Xin An Community\nChang An Town, Dongguan City, China 523882',NULL,NULL,'Import',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-29 18:26:39.549','2025-05-29 18:26:39.000'),
(4,1,2,'ACTIVE','Rev Group',NULL,NULL,NULL,'777 S. Alameda Street, Office #2043\nLos Angeles, CA 90021','777 S. Alameda Street, Office #2043\nLos Angeles, CA 90021',NULL,NULL,'Import',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-29 18:26:39.549','2025-05-29 18:26:39.000'),
(5,2,5,'ACTIVE','Harris & Covington',NULL,NULL,NULL,'1250 Hickory Chapel Rd, High Point, NC 27260','1250 Hickory Chapel Rd, High Point, NC 27260',NULL,NULL,'Domestic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-29 18:26:39.549','2025-05-29 18:26:39.000'),
(6,1,5,'ACTIVE','Twin Cities Knitting',NULL,NULL,NULL,'104 Rock Barn Road NE, Conover, North Carolina, 28613','104 Rock Barn Road NE, Conover, North Carolina, 28613',NULL,NULL,'Domestic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-29 18:26:39.549','2025-05-29 18:26:39.000'),
(7,1,4,'ACTIVE','Ivars',NULL,NULL,NULL,'408 I-40, Graham, NC 27253','408 I-40, Graham, NC 27253',NULL,NULL,'Domestic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-29 18:26:39.549','2025-05-29 18:26:39.000'),
(8,2,6,'ACTIVE','America\'s Best Printers',NULL,NULL,NULL,'6910 Aragon Circle, Buena Park, CA 90620','6910 Aragon Circle, Buena Park, CA 90620',NULL,NULL,'Domestic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-29 18:26:39.549','2025-05-29 18:26:39.000'),
(9,2,2,'ACTIVE','Conover Plastics',NULL,NULL,NULL,'1803 Conover Blvd E, Conover, NC 28613','1803 Conover Blvd E, Conover, NC 28613',NULL,NULL,'Domestic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-29 18:26:39.549','2025-05-29 18:26:39.000'),(10,1,3,'ACTIVE','Accugraphix',NULL,NULL,NULL,'4879 E La Palma Ave #206\nAnaheim, CA 92807\n714/632-9000','4879 E La Palma Ave #206\nAnaheim, CA 92807\n714/632-9000',NULL,NULL,'Domestic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-29 18:26:39.549','2025-05-29 18:26:39.000'),(11,2,1,'ACTIVE','Port City Apparel',NULL,NULL,NULL,'3310 Kitty Hawk Rd.STE 100, Wilmington, NC 28405','3310 Kitty Hawk Rd.STE 100, Wilmington, NC 28405',NULL,NULL,'Domestic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-29 18:26:39.549','2025-05-29 18:26:39.000'),(12,1,1,'ACTIVE','Test Vendor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-06-12 22:17:04.655','0000-00-00 00:00:00.000');

UNLOCK TABLES;
