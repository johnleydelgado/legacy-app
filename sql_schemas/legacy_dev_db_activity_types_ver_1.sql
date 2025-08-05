--
-- Table structure for table `ActivityTypes`
--

DROP TABLE IF EXISTS `ActivityTypes`;

CREATE TABLE `ActivityTypes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ActivityTypes`
--

LOCK TABLES `ActivityTypes` WRITE;

INSERT INTO `ActivityTypes` VALUES (1,'Create','oklch(62.3% 0.214 259.815)','2025-07-01 05:19:11','2025-07-01 05:19:11'),(2,'Update','oklch(79.5% 0.184 86.047)','2025-07-01 05:19:12','2025-07-01 05:19:12'),(3,'Delete','oklch(63.7% 0.237 25.331)','2025-07-01 05:19:13','2025-07-01 05:19:13'),(4,'Email','oklch(60.6% 0.25 292.717)','2025-07-01 05:19:13','2025-07-01 05:19:13'),(5,'Status Change','oklch(55.4% 0.046 257.417)','2025-07-01 05:19:14','2025-07-01 05:19:14'),(6,'Convert','oklch(68.5% 0.169 237.323)','2025-07-01 05:20:15','2025-07-01 05:20:15'),(7,'Upload','oklch(76.9% 0.188 70.08)','2025-07-04 07:26:26','2025-07-04 07:26:26');

UNLOCK TABLES;
