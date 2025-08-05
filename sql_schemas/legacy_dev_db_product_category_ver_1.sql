--
-- Table structure for table `ProductCategory`
--

DROP TABLE IF EXISTS `ProductCategory`;

CREATE TABLE `ProductCategory` (
  `pk_product_category_id` int NOT NULL,
  `category_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`pk_product_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ProductCategory`
--

LOCK TABLES `ProductCategory` WRITE;

INSERT INTO `ProductCategory` VALUES (1,'Accessories',NULL,NULL,NULL),(2,'Beanies',NULL,NULL,NULL),(3,'Socks',NULL,NULL,NULL);

UNLOCK TABLES;
