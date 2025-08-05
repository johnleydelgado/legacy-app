--
-- Table structure for table `Status`
--

DROP TABLE IF EXISTS `Status`;

CREATE TABLE `Status` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `platform` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `process` varchar(25) DEFAULT NULL,
  `status` varchar(25) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Status`
--

LOCK TABLES `Status` WRITE;

INSERT INTO `Status` VALUES (1,'LK','Quote','Quote','#0981c8'),(2,'LK','Quote','Quote Approval Sent','#0f8dc1'),(3,'LK','Quote','Quote Approved','#2d37c3'),(4,'LK','Order','Order','#41cfab'),(5,'LK','Production','In Production','#d41219'),(6,'LK','Production','In Transit','#9204b3'),(7,'LK','Production','Received','#6dc107'),(8,'LK','Production','Shipped','#abb131'),(9,'LK','Art','Art Approval Sent','#bce452'),(10,'LK','Art','Art Approved','#c5f747'),(11,'LK','Invoicing','Open','#683109'),(12,'LK','Invoicing','Part Due','#41cfab'),(13,'LK','Invoicing','Paid','#a63075'),(23,'LK','Invoicing','Paid','#a63075');

UNLOCK TABLES;
