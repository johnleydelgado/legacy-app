--
-- Table structure for table `Organizations`
--

-- DROP TABLE IF EXISTS `Organizations`;

-- CREATE TABLE `Organizations` (
--   `pk_organization_id` int unsigned NOT NULL AUTO_INCREMENT,
--   `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
--   `industry` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
--   `website_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
--   `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
--   `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
--   `billing_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
--   `shipping_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
--   `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
--   `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
--   `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
--   `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
--   `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
--   `tags` json DEFAULT NULL,
--   `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
--   `updated_at` datetime(3) NOT NULL,
--   PRIMARY KEY (`pk_organization_id`)
-- ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Organizations`
--

LOCK TABLES `Organizations` WRITE;

INSERT INTO `Organizations` VALUES (1,'Legacy',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-29 19:09:04.763','0000-00-00 00:00:00.000');

UNLOCK TABLES;
