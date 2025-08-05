--
-- Table structure for table `VendorsType`
--

DROP TABLE IF EXISTS `VendorsType`;

CREATE TABLE `VendorsType` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `VendorsType`
--

LOCK TABLES `VendorsType` WRITE;

INSERT INTO `VendorsType` VALUES (1,'Contractor','2025-07-02 15:17:11','2025-07-02 15:17:11'),(2,'Supplier','2025-07-02 15:17:11','2025-07-02 15:17:11');

UNLOCK TABLES;
