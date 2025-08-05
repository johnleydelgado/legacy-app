--
-- Table structure for table `Trims`
--

DROP TABLE IF EXISTS `Trims`;

CREATE TABLE `Trims` (
  `pk_trim_id` int unsigned NOT NULL AUTO_INCREMENT,
  `trim` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`pk_trim_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Trims`
--

LOCK TABLES `Trims` WRITE;

INSERT INTO `Trims` VALUES (1,'Woven Labels'),(2,'Patch'),(3,'N/A');

UNLOCK TABLES;
