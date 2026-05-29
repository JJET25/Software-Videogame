-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: catcafe
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cats`
--

DROP TABLE IF EXISTS `cats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `personality` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cats`
--

LOCK TABLES `cats` WRITE;
/*!40000 ALTER TABLE `cats` DISABLE KEYS */;
INSERT INTO `cats` VALUES (1,'Mochi',3,'Playful & curious','Images/Cat_1.jpg'),(2,'Luna',5,'Calm & affectionate','Images/Cat_2.jpg'),(3,'Nori',2,'Shy but sweet','Images/Cat_3.jpg'),(4,'Churro',4,'Bold & friendly','Images/Cat_4.jpg'),(5,'Boba',1,'Energetic & silly','Images/Cat_5.jpg');
/*!40000 ALTER TABLE `cats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `day` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (7,'monday','American Coffee',45.00,'Images/Menu_Items/AmericanCoffee.jpg'),(8,'monday','Blueberry Muffin',55.00,'Images/Menu_Items/BlueberryMuffin.png'),(9,'monday','Classic Croissant',48.00,'Images/Menu_Items/Croissant.jpg'),(10,'monday','Green Tea',40.00,'Images/Menu_Items/GreenTea.jpg'),(11,'monday','Ham and Cheese Bagel',85.00,'Images/Menu_Items/Bagel.jpg'),(12,'monday','Orange Juice',35.00,'Images/Menu_Items/OrangeJuice.jpeg'),(13,'tuesday','Cappuccino',58.00,'Images/Menu_Items/Capuchino.jpg'),(14,'tuesday','Chocolate Cookie',32.00,'Images/Menu_Items/ChocolateCookie.jpg'),(15,'tuesday','Avocado Toast',110.00,'Images/Menu_Items/AvocadoToast.jpg'),(16,'tuesday','Iced Latte',65.00,'Images/Menu_Items/IceLatte.jpg'),(17,'tuesday','Banana Bread',45.00,'Images/Menu_Items/BananaBread.jpg'),(18,'tuesday','Early Grey Tea',42.00,'Images/Menu_Items/GreenTea.jpg'),(19,'wednesday','Espresso',38.00,'Images/Menu_Items/Espresso.jpg'),(20,'wednesday','Ham and Cheese Bagel',85.00,'Images/Menu_Items/Bagel.jpg'),(21,'wednesday','Cinnamon Roll',52.00,'Images/Menu_Items/CinnamonRoll.jpg'),(22,'wednesday','Hot Chocolate',55.00,'Images/Menu_Items/HotChocolate.jpg'),(23,'wednesday','Fruit Bowl',75.00,'Images/Menu_Items/FruitBowl.jpg'),(24,'wednesday','American Coffee',45.00,'Images/Menu_Items/AmericanCoffee.jpg'),(25,'thursday','Flat White',62.00,'Images/Menu_Items/FlatWhite.jpg'),(26,'thursday','Chicken Sandwich',95.00,'Images/Menu_Items/ChickenSandwich.jpg'),(27,'thursday','Brownie',48.00,'Images/Menu_Items/Brownie.jpg'),(28,'thursday','Chai Latte',68.00,'Images/Menu_Items/ChaiLatte.jpg'),(29,'thursday','Classic Croissant',48.00,'Images/Menu_Items/Croissant.jpg'),(30,'thursday','Cold Brew',60.00,'Images/Menu_Items/ColdBrew.jpg'),(31,'friday','Mocha Coffee',65.00,'Images/Menu_Items/Mocha.jpg'),(32,'friday','Grilled Cheese Sandwich',88.00,'Images/Menu_Items/GrilledCheese.jpg'),(33,'friday','Blueberry Muffin',55.00,'Images/Menu_Items/BlueberryMuffin.png'),(34,'friday','Matcha Latte',72.00,'Images/Menu_Items/Matcha.jpg'),(35,'friday','Greek Yogurt Parfait',82.00,'Images/Menu_Items/Parfait.jpg'),(36,'friday','Iced Latte',65.00,'Images/Menu_Items/IceLatte.jpg'),(37,'saturday','Caramel Macchiato',70.00,'Images/Menu_Items/CaramelMacchiato.jpeg'),(38,'saturday','Waffles with Syrup',105.00,'Images/Menu_Items/Waffle.jpg'),(39,'saturday','Chocolate Cookie',32.00,'Images/Menu_Items/ChocolateCookie.jpg'),(40,'saturday','Orange Juice',35.00,'Images/Menu_Items/OrangeJuice.jpeg'),(41,'saturday','Avocado Toast',110.00,'Images/Menu_Items/AvocadoToast.jpg'),(42,'saturday','Cappuccino',58.00,'Images/Menu_Items/Capuchino.jpg'),(43,'sunday','Cold Brew',60.00,'Images/Menu_Items/ColdBrew.jpg'),(44,'sunday','Grilled Cheese Sandwich',88.00,'Images/Menu_Items/GrilledCheese.jpg'),(45,'sunday','Cinnamon Roll',52.00,'Images/Menu_Items/CinnamonRoll.jpg'),(46,'sunday','American Coffee',45.00,'Images/Menu_Items/AmericanCoffee.jpg'),(47,'sunday','Chicken Sandwich',95.00,'Images/Menu_Items/ChickenSandwich.jpg'),(48,'sunday','Fruit Bowl',75.00,'Images/Menu_Items/FruitBowl.jpg');
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-29 14:22:03
