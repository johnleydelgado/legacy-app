--
-- Table structure for table `Yarn`
--

DROP TABLE IF EXISTS `Yarn`;

CREATE TABLE `Yarn` (
  `pk_yarn_id` int unsigned NOT NULL AUTO_INCREMENT,
  `yarn_color` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `card_number` int DEFAULT NULL,
  `color_code` varchar(20) DEFAULT NULL,
  `yarn_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`pk_yarn_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Yarn`
--

LOCK TABLES `Yarn` WRITE;

INSERT INTO `Yarn` VALUES (1,'Optic White',NULL,'Optic White','Cotton - Standard Stock'),(2,'Soft White',NULL,'B005','Cotton - Standard Stock'),(3,'Off White',1,'L12','Cotton - Standard Stock');

UNLOCK TABLES;
