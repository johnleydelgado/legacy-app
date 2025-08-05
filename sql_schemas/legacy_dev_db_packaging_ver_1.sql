--
-- Table structure for table `Packaging`
--

DROP TABLE IF EXISTS `Packaging`;

CREATE TABLE `Packaging` (
  `pk_packaging_id` int unsigned NOT NULL AUTO_INCREMENT,
  `packaging` varchar(100) DEFAULT NULL,
  `instruction` text,
  PRIMARY KEY (`pk_packaging_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Packaging`
--

LOCK TABLES `Packaging` WRITE;

INSERT INTO `Packaging` VALUES (1,'Header Card',NULL),(2,'Wrap',NULL);

UNLOCK TABLES;
