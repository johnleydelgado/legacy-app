--
-- Table structure for table `VendorServiceCategory`
--

DROP TABLE IF EXISTS `VendorServiceCategory`;

CREATE TABLE `VendorServiceCategory` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `VendorServiceCategory`
--

LOCK TABLES `VendorServiceCategory` WRITE;

INSERT INTO `VendorServiceCategory` VALUES (1,'Office Supplies','2025-07-02 15:20:02','2025-07-02 15:20:02'),(2,'Constraction','2025-07-02 15:20:02','2025-07-02 15:20:02'),(3,'IT Services','2025-07-02 15:21:08','2025-07-02 15:21:08'),(4,'Landscpaing','2025-07-02 15:21:08','2025-07-02 15:21:08'),(5,'Logistics','2025-07-02 15:21:09','2025-07-02 15:21:09'),(6,'Graphic Design','2025-07-02 15:21:09','2025-07-02 15:21:09');

UNLOCK TABLES;
