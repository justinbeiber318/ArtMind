CREATE DATABASE  IF NOT EXISTS `artmind` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `artmind`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: artmind
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `analytics`
--

DROP TABLE IF EXISTS `analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `metric` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `value` double NOT NULL DEFAULT '1',
  `metadata` json DEFAULT NULL,
  `recorded_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `analytics_metric_recorded_at_idx` (`metric`,`recorded_at`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics`
--

LOCK TABLES `analytics` WRITE;
/*!40000 ALTER TABLE `analytics` DISABLE KEYS */;
INSERT INTO `analytics` VALUES (1,'search',NULL,NULL,1,'{\"query\": \"Show abstract blue paintings\", \"filters\": {\"color\": \"#1E3A5F\", \"style\": \"abstract\", \"category\": \"abstract\"}}','2026-06-04 11:38:46.596'),(2,'search',NULL,NULL,1,'{\"query\": \"show red paintings\", \"filters\": {\"color\": \"#8B2E2E\"}}','2026-06-04 11:40:46.700'),(3,'search',NULL,NULL,1,'{\"query\": \"Show abstract blue paintings\", \"filters\": {\"color\": \"#1E3A5F\", \"style\": \"abstract\", \"category\": \"abstract\"}}','2026-06-04 11:49:01.171'),(4,'search',NULL,NULL,1,'{\"query\": \"Show red painting\", \"filters\": {\"color\": \"#8B2E2E\"}}','2026-06-04 11:49:09.950'),(5,'search',NULL,NULL,1,'{\"query\": \"Show red painting\", \"filters\": {\"color\": \"#8B2E2E\"}}','2026-06-04 11:49:11.682'),(6,'search',NULL,NULL,1,'{\"query\": \"Show red painting\", \"filters\": {\"color\": \"#8B2E2E\"}}','2026-06-04 11:49:11.997'),(7,'search',NULL,NULL,1,'{\"query\": \"Show red painting\", \"filters\": {\"color\": \"#8B2E2E\"}}','2026-06-04 11:49:12.138'),(8,'search',NULL,NULL,1,'{\"query\": \"ảnh biển\", \"filters\": {\"search\": \"ảnh biển\", \"category\": \"landscape\"}}','2026-06-04 11:49:55.669'),(9,'search',NULL,NULL,1,'{\"query\": \"biển\", \"filters\": {\"search\": \"biển\", \"category\": \"landscape\"}}','2026-06-04 11:50:05.188'),(10,'search',NULL,NULL,1,'{\"query\": \"bãi biển\", \"filters\": {\"search\": \"beach\", \"category\": \"landscape\"}}','2026-06-04 11:50:12.545'),(11,'search',NULL,NULL,1,'{\"query\": \"mưa\", \"filters\": {\"search\": \"mưa\"}}','2026-06-04 11:50:29.872'),(12,'search',NULL,NULL,1,'{\"query\": \"rain\", \"filters\": {\"search\": \"rain\"}}','2026-06-04 11:50:33.787'),(13,'search',NULL,NULL,1,'{\"query\": \"rain\", \"filters\": {\"search\": \"rain\"}}','2026-06-04 11:56:30.923'),(14,'search',NULL,NULL,1,'{\"query\": \"nắng\", \"filters\": {\"search\": \"nắng\"}}','2026-06-04 11:57:10.652'),(15,'search',NULL,NULL,1,'{\"query\": \"red portraits\", \"filters\": {\"color\": \"#8B2E2E\", \"search\": \"portraits\", \"category\": \"portrait\"}}','2026-06-04 11:57:20.576'),(16,'search',NULL,NULL,1,'{\"query\": \"Bold red portraits, most popular first\", \"filters\": {\"sort\": \"popular\", \"color\": \"#8B2E2E\", \"search\": \"bold portraits, most first\", \"category\": \"portrait\"}}','2026-06-04 11:57:25.786'),(17,'search',NULL,NULL,1,'{\"query\": \"Bold red portraits, most popular first\", \"filters\": {\"sort\": \"popular\", \"color\": \"#8B2E2E\", \"search\": \"bold portraits, most first\", \"category\": \"portrait\"}}','2026-06-04 11:57:26.636'),(18,'search',NULL,NULL,1,'{\"query\": \"Show abstract blue paintings\", \"filters\": {\"color\": \"#1E3A5F\", \"style\": \"abstract\", \"category\": \"abstract\"}}','2026-06-04 11:57:27.739'),(19,'search',NULL,NULL,1,'{\"query\": \"Show abstract blue paintings\", \"filters\": {\"color\": \"#1E3A5F\", \"style\": \"abstract\", \"category\": \"abstract\"}}','2026-06-04 11:57:30.171'),(20,'recognition',NULL,NULL,1,NULL,'2026-06-04 11:59:16.251'),(21,'search',NULL,NULL,1,'{\"query\": \"rain\", \"filters\": {\"search\": \"rain\"}}','2026-06-04 11:59:28.582'),(22,'recognition',NULL,NULL,1,NULL,'2026-06-04 11:59:35.710'),(23,'recognition',NULL,NULL,1,NULL,'2026-06-04 11:59:43.921'),(24,'search',NULL,NULL,1,'{\"query\": \"abstract\", \"filters\": {\"style\": \"abstract\", \"category\": \"abstract\"}}','2026-06-04 12:00:39.440'),(25,'search',NULL,NULL,1,'{\"query\": \"Calm minimalist works on paper\", \"filters\": {\"search\": \"calm minimalist works\", \"surface\": \"paper\"}}','2026-06-04 12:03:31.231'),(26,'recognition',NULL,NULL,1,NULL,'2026-06-04 13:32:20.878'),(27,'recognition',NULL,NULL,1,NULL,'2026-06-06 16:34:48.069'),(28,'search',NULL,NULL,1,'{\"query\": \"blue paintings\", \"filters\": {\"color\": \"#1E3A5F\"}}','2026-06-11 11:37:57.206'),(29,'search',NULL,NULL,1,'{\"query\": \"blue painting\", \"filters\": {\"color\": \"#1E3A5F\"}}','2026-06-11 11:38:06.194'),(30,'recognition',NULL,NULL,1,NULL,'2026-06-11 11:40:47.964'),(31,'search',NULL,NULL,1,'{\"query\": \"**Minh** *\", \"filters\": {\"artist\": \"minh\", \"search\": \"**minh**\"}}','2026-06-11 12:17:26.452'),(32,'search',NULL,NULL,1,'{\"query\": \"Amara Okafor\", \"filters\": {\"artist\": \"amara-okafor\"}}','2026-06-11 12:27:32.665'),(33,'recognition',NULL,NULL,1,NULL,'2026-06-11 13:44:15.045'),(34,'recognition',NULL,NULL,1,NULL,'2026-06-23 11:11:45.291'),(35,'recognition',NULL,NULL,1,NULL,'2026-06-23 11:39:14.649'),(36,'search',NULL,NULL,1,'{\"query\": \"Show abstract blue paintings\", \"filters\": {\"color\": \"#1E3A5F\", \"style\": \"abstract\", \"category\": \"abstract\"}}','2026-06-23 12:13:07.843'),(37,'search',NULL,NULL,1,'{\"query\": \"Show abstract blue paintings\", \"filters\": {\"color\": \"#1E3A5F\", \"style\": \"abstract\", \"category\": \"abstract\"}}','2026-06-23 12:13:08.523'),(38,'search',NULL,NULL,1,'{\"query\": \"amara\", \"filters\": {\"artist\": \"amara\", \"search\": \"amara\"}}','2026-06-24 08:06:27.086'),(39,'search',NULL,NULL,1,'{\"query\": \"Show abstract blue paintings\", \"filters\": {\"color\": \"#1E3A5F\", \"style\": \"abstract\", \"category\": \"abstract\"}}','2026-06-24 08:08:05.870'),(40,'search',NULL,NULL,1,'{\"query\": \"Find watercolor landscape art\", \"filters\": {\"search\": \"watercolor\", \"category\": \"landscape\"}}','2026-06-24 08:08:08.318'),(41,'search',NULL,NULL,1,'{\"query\": \"Calm minimalist works on paper\", \"filters\": {\"search\": \"calm minimalist works\", \"surface\": \"paper\"}}','2026-06-24 08:08:09.957'),(42,'recognition',NULL,NULL,1,NULL,'2026-06-24 08:24:23.964'),(43,'recognition',NULL,NULL,1,NULL,'2026-06-24 08:34:36.443'),(44,'recognition',NULL,NULL,1,NULL,'2026-06-24 08:34:54.722'),(45,'recognition',NULL,NULL,1,NULL,'2026-06-24 08:35:01.567'),(46,'recognition',NULL,NULL,1,NULL,'2026-06-24 09:34:48.215'),(47,'recognition',NULL,NULL,1,NULL,'2026-06-26 15:31:08.985'),(48,'recognition',NULL,NULL,1,NULL,'2026-06-26 15:31:52.428'),(49,'ai_search',NULL,NULL,1,'{\"sort\": \"relevant\", \"query\": \"Show me modern abstract paintings\", \"filters\": {}, \"parsedIntent\": {\"mood\": \"modern\", \"color\": \"\", \"style\": \"Abstract\", \"theme\": \"modern\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"Abstract\"}}','2026-06-26 15:48:38.265'),(50,'ai_search',NULL,NULL,1,'{\"sort\": \"relevant\", \"query\": \"blue paintings\", \"filters\": {\"date\": \"\", \"color\": \"\", \"style\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\", \"popularity\": \"\"}, \"parsedIntent\": {\"mood\": \"\", \"color\": \"blue\", \"style\": \"\", \"theme\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\"}}','2026-06-26 15:48:48.835'),(51,'ai_search',NULL,NULL,1,'{\"sort\": \"relevant\", \"query\": \"Find blue landscape oil paintings\", \"filters\": {}, \"parsedIntent\": {\"mood\": \"\", \"color\": \"blue\", \"style\": \"\", \"theme\": \"\", \"artist\": \"\", \"medium\": \"oil\", \"surface\": \"\", \"category\": \"Landscape\"}}','2026-06-26 15:49:12.449'),(52,'ai_search',NULL,NULL,1,'{\"sort\": \"relevant\", \"query\": \"Find blue landscape oil paintings\", \"filters\": {}, \"parsedIntent\": {\"mood\": \"\", \"color\": \"blue\", \"style\": \"\", \"theme\": \"\", \"artist\": \"\", \"medium\": \"oil\", \"surface\": \"\", \"category\": \"Landscape\"}}','2026-06-26 15:49:35.917'),(53,'ai_search',NULL,NULL,1,'{\"sort\": \"mostFavorited\", \"query\": \"Abstract Paintings\", \"filters\": {}, \"parsedIntent\": {\"mood\": \"\", \"color\": \"\", \"style\": \"Abstract\", \"theme\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"Abstract\"}}','2026-06-26 15:49:43.555'),(54,'ai_search',NULL,NULL,1,'{\"sort\": \"relevant\", \"query\": \"blue paintings\", \"filters\": {\"date\": \"\", \"color\": \"\", \"style\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\", \"popularity\": \"\"}, \"parsedIntent\": {\"mood\": \"\", \"color\": \"blue\", \"style\": \"\", \"theme\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\"}}','2026-06-26 15:50:19.119'),(55,'ai_search',NULL,NULL,1,'{\"sort\": \"relevant\", \"query\": \"blue paintings\", \"filters\": {\"date\": \"\", \"color\": \"\", \"style\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\", \"popularity\": \"\"}, \"parsedIntent\": {\"mood\": \"\", \"color\": \"blue\", \"style\": \"\", \"theme\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\"}}','2026-06-26 15:50:30.621'),(56,'ai_search',NULL,NULL,1,'{\"sort\": \"relevant\", \"query\": \"blue paintings\", \"filters\": {\"date\": \"\", \"color\": \"\", \"style\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\", \"popularity\": \"\"}, \"parsedIntent\": {\"mood\": \"\", \"color\": \"blue\", \"style\": \"\", \"theme\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\"}}','2026-06-26 15:51:02.613'),(57,'ai_search',NULL,NULL,1,'{\"sort\": \"relevant\", \"query\": \"blue\", \"filters\": {}, \"parsedIntent\": {\"mood\": \"\", \"color\": \"blue\", \"style\": \"\", \"theme\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\"}}','2026-06-26 15:54:23.243'),(58,'recognition',NULL,NULL,1,NULL,'2026-06-27 11:39:29.415'),(59,'search',NULL,NULL,1,'{\"query\": \"blue\", \"filters\": {\"color\": \"#1E3A5F\"}}','2026-06-27 12:20:57.779'),(60,'recognition',NULL,NULL,1,NULL,'2026-06-27 12:21:17.534'),(61,'recognition',NULL,NULL,1,NULL,'2026-06-27 12:37:06.153'),(62,'recognition',NULL,NULL,1,NULL,'2026-06-27 13:16:48.665'),(63,'recognition',NULL,NULL,1,NULL,'2026-06-27 13:31:36.910'),(64,'recognition',NULL,NULL,1,NULL,'2026-07-02 11:25:35.817'),(65,'search',NULL,NULL,1,'{\"query\": \"blue\", \"filters\": {\"color\": \"#1E3A5F\"}}','2026-07-02 11:33:50.472'),(66,'recognition',NULL,NULL,1,NULL,'2026-07-02 12:13:52.237'),(67,'search',NULL,NULL,1,'{\"query\": \"abstract\", \"filters\": {\"style\": \"abstract\", \"category\": \"abstract\"}}','2026-07-02 12:40:37.239'),(68,'search',NULL,NULL,1,'{\"query\": \"abstract\", \"filters\": {\"style\": \"abstract\", \"category\": \"abstract\"}}','2026-07-02 13:16:35.031'),(69,'recognition',NULL,NULL,1,NULL,'2026-07-02 13:17:12.669'),(70,'recognition',NULL,NULL,1,NULL,'2026-07-06 08:59:12.908'),(71,'recognition',NULL,NULL,1,NULL,'2026-07-06 08:59:45.099'),(72,'recognition',NULL,NULL,1,NULL,'2026-07-06 09:01:12.793'),(73,'recognition',NULL,NULL,1,NULL,'2026-07-06 09:01:59.676'),(74,'recognition',NULL,NULL,1,NULL,'2026-07-06 09:11:42.030'),(75,'recognition',NULL,NULL,1,NULL,'2026-07-06 09:17:55.161'),(76,'recognition',NULL,NULL,1,NULL,'2026-07-06 09:18:26.004');
/*!40000 ALTER TABLE `analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `artists`
--

DROP TABLE IF EXISTS `artists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nationality` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `born_year` int DEFAULT NULL,
  `died_year` int DEFAULT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `portrait_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `artists_slug_key` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artists`
--

LOCK TABLES `artists` WRITE;
/*!40000 ALTER TABLE `artists` DISABLE KEYS */;
INSERT INTO `artists` VALUES (12,'Wassily Kandinsky','wassily-kandinsky','Russian',1866,1944,'A Russian painter, widely considered one of the pioneers of pure abstract art.','https://www.wassily-kandinsky.org/assets/img/wassily-kandinsky.jpg','2026-07-06 09:44:15.436'),(13,'Piet Mondrian','piet-mondrian','Dutch',1872,1944,'A Dutch painter, renowned for his geometric style using straight black lines and primary colors.','https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Piet_Mondrian_2.jpg/250px-Piet_Mondrian_2.jpg','2026-07-06 09:47:01.900'),(14,'Rembrandt van Rijn','rembrandt-van-rijn','Dutch',1606,1669,'A great Dutch master, highly famous for his dramatic use of light and shadow (chiaroscuro).','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcSzlDq7jTTT1VuKVapLjuJ-eLtwbZvzkaBwsoq8RBQ8Uf0yBpVUOxJh3m&s=10','2026-07-06 11:27:01.683'),(15,'Michelangelo Merisi da Caravaggio','michelangelo-merisi-da-caravaggio','Italian',1571,1610,'An Italian painter who had a profound influence on Baroque art with his intense realism combined with stark lighting contrasts','https://upload.wikimedia.org/wikipedia/commons/7/73/Bild-Ottavio_Leoni%2C_Caravaggio.jpg','2026-07-06 11:27:49.817'),(16,'Yayoi Kusama','yayoi-kusama','Japanese',1929,NULL,'A world-renowned Japanese artist known for her iconic paintings and installations featuring polka dots','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPZPxsbEHqxZHP7xdS_KUKhrBCWj8inS2GXLKSIGLnLA&s=10','2026-07-06 11:36:26.616'),(17,'Damien Hirst','damien-hirst','British',1965,NULL,'One of the most prominent and controversial British contemporary artists, famous for his conceptual artworks and physical installations.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqpWXINHj6BunZFH8lklZvUU6rSLBbsu15thA-SGRHJw&s=10','2026-07-06 11:37:26.266'),(18,'Edvard Munch','edvard-munch','Norwegian',1863,1944,'A Norwegian painter and creator of the iconic painting \"The Scream,\" which powerfully conveys human anxiety','https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Portrait_of_Edvard_Munch_%28cropped%29.png/250px-Portrait_of_Edvard_Munch_%28cropped%29.png','2026-07-06 11:38:16.868'),(19,'Egon Schiele','egon-schiele','Austrian',1890,1918,'An Austrian painter famous for his portraits expressing rawness, as well as twisted and exaggerated physical forms to reveal inner emotions.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH0ecIR00Dqa0OrBJ0VV2t8QbA-pUlLgW0iE_8W67DXQ&s=10','2026-07-06 11:40:27.190'),(20,'Claude Monet','claude-monet','French',1840,1926,'The founder and the most representative figure of French Impressionism.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVNgZpiFyM-2fCofJthFm6SXmnXLEiieCX6vgV4Eqm2A&s=10','2026-07-06 11:41:09.045'),(21,'Pierre-Auguste Renoir','pierre-auguste-renoir','French',1841,1919,'A French painter known for his paintings filled with natural light, bright colors, and a celebration of joyful life','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtoHCwhUJWXVZ4TgNDz5Zt0JgBifNs5NzXNjV4jnYfXg&s=10','2026-07-06 11:41:52.469'),(22,'Jean Désiré Gustave Courbet','jean-dsir-gustave-courbet','French',1819,1877,'The leader of the Realist movement in 19th-century France, known for painting only what is seen and experienced directly, without idealization.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdxGIkdG3N2crfNX-7MgTEOnt2sby2MyYZTKgUtpJ-zA&s=10','2026-07-06 11:42:40.139'),(23,'Jean-François Millet','jean-franois-millet','French',1814,1875,'Famous for his paintings depicting the realistic, rustic, and dignified lives of peasant farmers.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVJRtUA9NPmsfoIGcRJ_tMEcB2m8Az2ffNh3hy71KVUw&s=10','2026-07-06 11:43:16.198'),(24,'Paul Cézanne','paul-czanne','French',1839,1906,'He elevated the still life genre by breaking traditional perspective, laying the foundation for Cubism.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqx-7XJeC1NDfO8SoUy_cLaExwdVPoWO31Jgx3iY238g&s=10','2026-07-06 11:44:00.423'),(25,'Willem Claesz Heda','willem-claesz-heda','Dutch',1594,1680,'A master of Dutch Golden Age still life painting, known for his highly detailed \"vanitas\" banquet pieces.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQrwEUIoBMz4MPtsqhRZgWctjSqe3GLsDjnl-Q0C-ifehKocEnXgTCDxY&s=10','2026-07-06 11:45:08.190');
/*!40000 ALTER TABLE `artists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_key` (`name`),
  UNIQUE KEY `categories_slug_key` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (4,'Abstract','abstract'),(5,'History Painting','history-painting'),(7,'Group Portrait','group-portrait'),(8,'Religious','religious'),(9,'Mythological','mythological'),(10,'Pop Art','pop-art'),(11,'Mixed Media','mixed-media'),(12,'Figure','figure'),(13,'Portrait','portrait'),(14,'Landscape','landscape'),(15,'Self-Portrait','self-portrait'),(16,'Genre Painting','genre-painting'),(17,'Realism','realism'),(18,'Still life','still-life');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_logs`
--

DROP TABLE IF EXISTS `chat_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `prompt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `response` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokens_used` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `chat_logs_user_id_fkey` (`user_id`),
  CONSTRAINT `chat_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_logs`
--

LOCK TABLES `chat_logs` WRITE;
/*!40000 ALTER TABLE `chat_logs` DISABLE KEYS */;
INSERT INTO `chat_logs` VALUES (1,NULL,'hi\\','Hello! How can I assist you with art today?',168,'2026-06-04 11:49:17.567'),(2,NULL,'địt mẹ mày','I cannot assist with that language. Please ask me about art, artists, or the ArtMind gallery.',159,'2026-06-04 11:49:24.210'),(3,NULL,'fuck you','I\'m here to help with questions about art, artists, or navigating the ArtMind gallery. Please let me know if you have an art-related query.',342,'2026-06-04 11:49:32.729'),(4,NULL,'tìm cho tôi ảnh biển','Chào bạn! Để tìm ảnh biển, bạn có thể sử dụng:\n\n1.  **AI Search:** Nhập \"biển\", \"cảnh biển\", hoặc \"bãi biển\" vào ô tìm kiếm.\n2.  **Gallery:** Duyệt qua các danh mục hoặc sử dụng bộ lọc chủ đề nếu có.\n\nBạn muốn tôi hướng dẫn bạn đến trang nào để bắt đầu tìm kiếm không?',343,'2026-06-04 11:49:45.397'),(5,NULL,'có','Tuyệt vời!\n\nBạn có thể bắt đầu tại trang **AI Search**. Chỉ cần nhập từ khóa \"biển\" (hoặc \"cảnh biển\", \"bãi biển\") vào thanh tìm kiếm, và hệ thống sẽ hiển thị các tác phẩm có liên quan.\n\nBạn muốn tôi đưa bạn đến trang AI Search không?',384,'2026-06-04 11:50:59.134'),(6,NULL,'hi','Hello! How can I assist you today? Are you looking for information on an artist, a particular art movement, or perhaps help navigating the gallery?',147,'2026-06-04 12:19:10.012'),(7,NULL,'hi','Hello! How may I assist you today? Are you looking for information on an artist, a particular art movement, or perhaps help navigating the ArtMind gallery?',149,'2026-06-04 13:32:06.599'),(8,NULL,'tôi muốn tìm nảh','Chào bạn! Có vẻ như bạn đang gặp một chút khó khăn khi gõ. Bạn có thể cho tôi biết bạn muốn tìm gì không?\n\nTôi có thể giúp bạn tìm thông tin về:\n*   Các nghệ sĩ\n*   Các phong trào nghệ thuật\n*   Các tác phẩm cụ thể\n*   Hoặc hướng dẫn bạn trên trang web ArtMind.',445,'2026-06-04 13:32:39.988'),(9,NULL,'tôi muốn tìm tranh','Tuyệt vời! Bạn muốn tìm tranh dựa trên tiêu chí nào?\n\nVí dụ, bạn có thể cho tôi biết:\n*   **Tên nghệ sĩ** (ví dụ: \"tranh của Van Gogh\")\n*   **Tên một phong trào nghệ thuật** (ví dụ: \"tranh trường phái Ấn tượng\")\n*   **Một chủ đề cụ thể** (ví dụ: \"tranh phong cảnh\")\n*   Hoặc bạn có thể sử dụng chức năng **AI Search** trên trang web của chúng tôi để tìm kiếm nâng cao hơn.',366,'2026-06-04 13:32:50.058'),(10,NULL,'tranh trời mưa','Tuyệt vời! Bạn đang tìm tranh có chủ đề \"trời mưa\".\n\nBạn có thể tìm kiếm những tác phẩm này bằng cách:\n1.  Sử dụng thanh tìm kiếm trên trang **Gallery** của chúng tôi và nhập \"trời mưa\", \"cảnh mưa\" hoặc \"rainy day\".\n2.  Để có kết quả chính xác hơn, bạn có thể thử chức năng **AI Search** và mô tả chi tiết hơn về bức tranh bạn muốn tìm.\n\nBạn muốn tôi hướng dẫn bạn đến trang nào để bắt đầu tìm kiếm?',534,'2026-06-04 13:32:59.843'),(11,NULL,'hi','Hello! How can I assist you today? Are you looking for information on an artist, a particular art movement, or perhaps help navigating the gallery?',147,'2026-06-06 16:34:22.136'),(12,NULL,'hi','Hello! How can I assist you with the ArtMind collection today?',163,'2026-06-11 11:20:54.598'),(13,NULL,'minh','I\'m sorry, I don\'t have information on an artist named Minhminh in our records. Perhaps you could spell out the full name, or tell me more about what you\'re looking for?\n\nI\'d be happy to help you explore other artists or art movements.',261,'2026-06-11 12:15:54.763'),(14,NULL,'**Minh** *','Thank you for clarifying. I still don\'t have an artist named Minh Minh in our database.\n\nPerhaps you\'re looking for a different artist, or could you tell me more about their work or style? I can help you search our collection by movement, style, or other artist names.',356,'2026-06-11 12:17:31.669'),(15,NULL,'tôi muốn đăng ảnh lên','Tôi ở đây để giúp bạn khám phá các tác phẩm nghệ thuật, tìm hiểu về nghệ sĩ',623,'2026-06-11 13:20:50.112'),(16,NULL,'tôi muốn tìm hiểu thêm về tác giả Elena Marchetti','Elena Marchetti là một nghệ sĩ đương đại nổi tiếng với những bức tranh phong cảnh trừu tượng, thường sử dụng bảng màu rực rỡ và kết cấu phong phú để truyền tải cảm xúc và bầu không khí. Tác phẩm của cô khám phá mối quan hệ giữa con người và thiên nhiên, mời gọi người xem suy ngẫm về vẻ đẹp và sự mong manh của thế giới tự nhiên.',422,'2026-06-11 13:21:35.528'),(17,NULL,'có tác phẩm nào ko','Vâng, Aurelis có một số tác phẩm của Elena Marchetti. Một tác phẩm nổi bật là \"Echoes of the Horizon,\" một bức tranh khổ lớn thể hiện sự pha trộn đặc trưng của cô giữa màu sắc rực rỡ và hình thức trừu tượng, gợi lên cảm giác về không gian mở và sự yên bình.\n\nBạn có muốn xem tác phẩm này trên trang Gallery không?',331,'2026-06-11 13:21:51.259'),(18,NULL,'xin chào','Hello! How can I assist you with art today?',175,'2026-06-11 13:22:29.672'),(19,NULL,'tôi muốn upload ảnh lên thì làm như thế nào','Chào bạn! Để tải ảnh lên và tìm kiếm hoặc nhận diện tác phẩm nghệ thuật, bạn có thể sử dụng trang **AI Search** hoặc **AI Recognition** của chúng tôi.\n\nBạn muốn tìm kiếm một tác phẩm cụ thể hay nhận diện một bức ảnh bạn có?',324,'2026-06-11 13:22:42.281'),(20,NULL,'tôi muốn nhận diện 1 bức ảnh','Tuyệt vời! Để nhận diện một bức ảnh, bạn có thể truy cập trang **AI Recognition** trên trang web của chúng tôi.\n\nỞ đó, bạn sẽ tìm thấy tùy chọn để tải lên hình ảnh của mình.',263,'2026-06-11 13:23:53.419'),(21,NULL,'quang có khôn không','Tôi chỉ có thể hỗ trợ bạn với các câu hỏi liên quan đến nghệ thuật, các tác phẩm trong bộ sưu tập của Aurelis, hoặc cách sử dụng trang web của chúng tôi.\n\nBạn có câu hỏi nào về một bức tranh, một nghệ sĩ, hay một phong cách nghệ thuật không?',375,'2026-06-11 13:29:25.712'),(22,NULL,'chào bạn','Hello again! How can I assist you with art today?',206,'2026-06-11 13:33:07.505'),(23,NULL,'tôi muốn upload ảnh','To upload an image for recognition or search, please navigate to the **AI Recognition** or **AI Search** page on the Aurelis website.',260,'2026-06-11 13:33:28.584'),(24,NULL,'nói tiếng việt','Chào bạn! Xin lỗi, tôi đã không nhận ra bạn muốn nói tiếng Việt.\n\nĐể tải ảnh lên để nhận diện hoặc tìm kiếm, bạn vui lòng truy cập trang **AI Recognition** hoặc **AI Search** trên trang web của Aurelis.',229,'2026-06-11 13:33:35.756'),(25,NULL,'tôi muốn tìm hiểu thêm về các tác giả','Bạn muốn tìm hiểu về tác giả cụ thể nào? Hoặc bạn có thể duyệt qua các nghệ sĩ trong mục **Gallery** của chúng tôi.',306,'2026-06-11 13:33:55.890'),(26,NULL,'trang web có những tác giả nào','Bạn có thể khám phá danh sách các tác giả của chúng tôi trên trang **Gallery**. Ở đó, bạn sẽ tìm thấy thông tin về các nghệ sĩ và tác phẩm của họ.',330,'2026-06-11 13:34:41.809'),(27,NULL,'xin chào','Hello! Welcome to Aurelis. How can I assist you today?',182,'2026-06-11 13:41:19.845'),(28,NULL,'chào','Hello — I\'m the Aurelis concierge. Ask me about a movement, an artist, or how to find a piece.',186,'2026-06-23 12:00:56.703'),(29,NULL,'hi','Hello! How can I assist you with art today?',168,'2026-06-23 12:07:43.289'),(30,NULL,'bạn biết quang không','Tôi là trợ lý nghệ thuật của phòng trưng bày Aurelis. Tôi có thể giúp bạn tìm hiểu về các tác phẩm nghệ thuật, nghệ sĩ, phong cách hoặc điều hướng trang web của chúng tôi.\n\nBạn muốn biết gì về nghệ thuật hôm nay?',273,'2026-06-23 12:10:57.162'),(31,NULL,'quang là ai','Tôi là trợ lý nghệ thuật của phòng trưng bày Aurelis và tôi không có thông tin về một người tên là Quang.\n\nTôi có thể giúp bạn tìm hiểu về một nghệ sĩ, một tác phẩm, hoặc một phong cách nghệ thuật nào đó không?',314,'2026-06-23 12:11:06.629'),(32,NULL,'chó poddle là có cắn không','Tôi xin lỗi, tôi là trợ lý nghệ thuật của phòng trưng bày Aurelis và tôi chỉ có thể cung cấp thông tin liên quan đến nghệ thuật thị giác.\n\nBạn có câu hỏi nào về các tác phẩm nghệ thuật, nghệ sĩ, hoặc phong cách nghệ thuật không?',351,'2026-06-23 12:11:34.532'),(33,NULL,'xin chào','Hello! Welcome to Aurelis. How can I assist you today?',173,'2026-06-23 12:32:42.868'),(34,NULL,'chó poddle có cắn không','I\'m sorry, I can only assist with questions about art, artists, movements, or navigating the Aurelis gallery website. Can I help you with something related to our collection?',231,'2026-06-23 12:32:54.431'),(35,NULL,'những tác giả nào có các bức tranh abstract','Certainly! Many renowned artists are known for their abstract works. Some prominent examples include:\n\n*   **Wassily Kandinsky**\n*   **Piet Mondrian**\n*   **Jackson Pollock**\n*   **Mark Rothko**\n*   **Kazimir Malevich**\n*   **Hilma af Klint**\n\nWould you like to know more about any of these artists or explore abstract art further?',315,'2026-06-23 12:34:06.118'),(36,NULL,'xin chào','Chào bạn! Tôi là người hướng dẫn của Aurelis. Bạn muốn tìm hiểu về một trường phái nghệ thuật, một nghệ sĩ, hay cách tìm một tác phẩm?',264,'2026-06-24 08:05:18.066'),(37,NULL,'tôi muốn tìm hiểu về tác giả amara','Chào bạn! Tôi không có thông tin về một nghệ sĩ tên là Amara trong bộ sưu tập của chúng tôi. Bạn có chắc tên nghệ sĩ đó không?\n\nNếu bạn muốn tìm kiếm, bạn có thể thử sử dụng tính năng AI Search trên trang web của chúng tôi hoặc duyệt qua trang Gallery.',413,'2026-06-24 08:06:07.805'),(38,NULL,'who is quang','I don\'t have information about an artist named \"Quang\" in our collection.\n\nPerhaps you could try using our AI Search feature on the website, or browse through the Gallery page to discover new artists?',430,'2026-06-24 08:06:49.536'),(39,NULL,'chào','Chào bạn! Tôi là nhân viên hỗ trợ của Aurelis. Bạn muốn tìm hiểu về một trường phái, một nghệ sĩ, hay cách tìm một tác phẩm nào đó không?',277,'2026-06-24 08:40:06.629'),(40,NULL,'konichiwa','こんにちは！アウレリスのコンシェルジュです。美術の潮流、アーティスト、または作品の探し方について、何でもお尋ねください。',255,'2026-06-24 08:40:35.429'),(41,NULL,'hi','Hello! How can I assist you today at the Aurelis gallery?',264,'2026-06-24 08:45:50.183'),(42,NULL,'chào','Chào bạn! Bạn muốn tìm hiểu về tác phẩm nghệ thuật nào, hay có câu hỏi gì về các nghệ sĩ và phong cách hội họa không?',252,'2026-06-24 08:45:54.479'),(43,NULL,'xin chòa','Chào bạn! Rất vui được gặp bạn tại Aurelis. Tôi có thể giúp bạn khám phá các tác phẩm nghệ thuật, tìm hiểu về các họa sĩ, hoặc điều hướng trang web của chúng ta không?',291,'2026-06-24 09:06:42.017'),(44,NULL,'xin chào','Chào bạn! Chào mừng bạn đến với Aurelis. Tôi là trợ lý nghệ thuật AI của bạn. Bạn muốn tìm hiểu về tác phẩm nào, họa sĩ nào, hay phong cách nghệ thuật nào hôm nay?',366,'2026-06-24 09:06:45.959'),(45,3,'chào','Chào bạn! Rất vui được gặp bạn tại Aurelis. Tôi có thể giúp bạn tìm hiểu về các tác phẩm nghệ thuật, phong cách, nghệ sĩ hay điều hướng trang web của chúng ta không?',364,'2026-06-26 15:19:16.943'),(46,3,'tôi muốn xem những bức tranh có màu xanh dương','Chào bạn! Bạn muốn xem những bức tranh có màu xanh dương. Tuyệt vời!\n\nBạn có thể sử dụng tính năng \"AI Search\" trên trang web của chúng tôi để tìm kiếm các tác phẩm theo màu sắc. Chỉ cần nhập \"màu xanh dương\" hoặc \"blue\" vào ô tìm kiếm, hệ thống sẽ gợi ý những bức tranh phù hợp.\n\nBạn muốn tôi giúp bạn truy cập trang \"AI Search\" không?',368,'2026-06-26 15:51:23.270'),(47,3,'có','Tuyệt vời! Bạn có thể truy cập trang \"AI Search\" của Aurelis.\n\nTại đó, bạn có thể nhập \"màu xanh dương\" để khám phá các tác phẩm có gam màu này. Hãy thử nhé!',393,'2026-06-26 15:51:34.577'),(48,NULL,'chào','Chào bạn! Rất vui được hỗ trợ bạn tại Aurelis. Bạn muốn khám phá điều gì về nghệ thuật hôm nay?',269,'2026-06-27 12:13:27.818'),(49,NULL,'tôi muốn tìm hiểu về tác giả','Tuyệt vời! Bạn muốn tìm hiểu về tác giả nào? Hoặc bạn có muốn tôi gợi ý một số nghệ sĩ nổi bật trong bộ sưu tập của Aurelis không?',281,'2026-06-27 12:13:38.560'),(50,NULL,'Minh','Cảm ơn bạn. Tôi không tìm thấy thông tin về một nghệ sĩ tên \"MinhMinh\" trong bộ sưu tập của Aurelis.\n\nBạn có thể vui lòng kiểm tra lại tên hoặc cung cấp thêm chi tiết không? Hoặc bạn có muốn tôi giới thiệu một số nghệ sĩ Việt Nam nổi bật khác không?',584,'2026-06-27 12:13:50.907'),(51,3,'chào\\','Chào bạn! Tôi là trợ lý nghệ thuật AI của bạn tại Aurelis. Tôi có thể giúp bạn khám phá các tác phẩm nghệ thuật, tìm hiểu về phong cách hội họa, các nghệ sĩ, hoặc hướng dẫn bạn trên trang web của chúng tôi. Bạn muốn tìm hiểu điều gì hôm nay?',330,'2026-07-02 11:28:26.943'),(52,3,'bạn tên gì','Tôi là trợ lý nghệ thuật AI của phòng trưng bày Aurelis. Bạn có thể gọi tôi là Trợ lý Aurelis.',329,'2026-07-02 11:28:38.710'),(53,NULL,'xin ch�o','Xin chào! Tôi có thể giúp gì cho bạn hôm nay?',196,'2026-07-06 09:07:16.110'),(54,NULL,'xin chao','Xin chào! Chào mừng bạn đến với Aurelis. Tôi có thể giúp gì cho bạn hôm nay?',205,'2026-07-06 09:07:31.636'),(55,3,'xin chào','Xin chào! Tôi là Trợ lý Nghệ thuật AI của Aurelis. Tôi có thể giúp bạn khám phá tác phẩm nghệ thuật, tìm hiểu về các phong cách hội họa, tiểu sử nghệ sĩ, hoặc đề xuất các tác phẩm trong bộ sưu tập của chúng tôi. Bạn muốn tìm hiểu điều gì hôm nay?',332,'2026-07-06 09:08:36.266'),(56,3,'Wassily Kandinsky là ai','Wassily Kandinsky (1866–1944) là một họa sĩ người Nga, được công nhận rộng rãi là một trong những người tiên phong của nghệ thuật trừu tượng. Ông tin rằng nghệ thuật nên thể hiện thế giới nội tâm và cảm xúc, không chỉ đơn thuần sao chép thực tại.\n\nÔng là một thành viên sáng lập của nhóm nghệ sĩ \"The Blue Rider\" (Der Blaue Reiter) ở Munich, Đức. Các tác phẩm của ông thường khám phá mối liên hệ giữa màu sắc, hình dạng và âm nhạc.',514,'2026-07-06 09:10:06.875'),(57,3,'who is Wassily Kandinsky','Wassily Kandinsky (1866–1944) was a Russian painter, widely recognized as one of the pioneers of abstract art. He believed that art should express inner worlds and emotions, not merely replicate reality.\n\nHe was a founding member of \"The Blue Rider\" (Der Blaue Reiter) group of artists in Munich, Germany. His works often explored the connection between color, form, and music.',543,'2026-07-06 09:10:19.145'),(58,NULL,'Wassily Kandinsky là ai','Wassily Kandinsky là một họa sĩ người Nga, được coi là một trong những người tiên phong của nghệ thuật trừu tượng. Ông là một nhân vật quan trọng trong phong trào Biểu hiện và đồng sáng lập nhóm Der Blaue Reiter.',363,'2026-07-06 11:21:18.841');
/*!40000 ALTER TABLE `chat_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collection_items`
--

DROP TABLE IF EXISTS `collection_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `collection_id` int NOT NULL,
  `painting_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `collection_items_collection_id_painting_id_key` (`collection_id`,`painting_id`),
  KEY `collection_items_painting_id_fkey` (`painting_id`),
  CONSTRAINT `collection_items_collection_id_fkey` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `collection_items_painting_id_fkey` FOREIGN KEY (`painting_id`) REFERENCES `paintings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collection_items`
--

LOCK TABLES `collection_items` WRITE;
/*!40000 ALTER TABLE `collection_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `collection_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collections`
--

DROP TABLE IF EXISTS `collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `collections_user_id_fkey` (`user_id`),
  CONSTRAINT `collections_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collections`
--

LOCK TABLES `collections` WRITE;
/*!40000 ALTER TABLE `collections` DISABLE KEYS */;
/*!40000 ALTER TABLE `collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `painting_id` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorites_user_id_painting_id_key` (`user_id`,`painting_id`),
  KEY `favorites_painting_id_fkey` (`painting_id`),
  CONSTRAINT `favorites_painting_id_fkey` FOREIGN KEY (`painting_id`) REFERENCES `paintings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paintings`
--

DROP TABLE IF EXISTS `paintings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paintings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medium` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `surface` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dominant_colors` json DEFAULT NULL,
  `width_cm` double DEFAULT NULL,
  `height_cm` double DEFAULT NULL,
  `year` int DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `view_count` int NOT NULL DEFAULT '0',
  `trending_score` double NOT NULL DEFAULT '0',
  `ai_summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `artist_id` int NOT NULL,
  `category_id` int NOT NULL,
  `style_id` int DEFAULT NULL,
  `uploaded_by_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `paintings_slug_key` (`slug`),
  KEY `paintings_category_id_idx` (`category_id`),
  KEY `paintings_style_id_idx` (`style_id`),
  KEY `paintings_artist_id_idx` (`artist_id`),
  KEY `paintings_trending_score_idx` (`trending_score`),
  KEY `paintings_uploaded_by_id_idx` (`uploaded_by_id`),
  CONSTRAINT `paintings_artist_id_fkey` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `paintings_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `paintings_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `paintings_uploaded_by_id_fkey` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paintings`
--

LOCK TABLES `paintings` WRITE;
/*!40000 ALTER TABLE `paintings` DISABLE KEYS */;
INSERT INTO `paintings` VALUES (45,'Composition VII','composition-vii','Considered the apex of his artwork before the First World War, this painting is a complex culmination of his abstract theories regarding color and form.','https://upload.wikimedia.org/wikipedia/commons/b/b4/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsIt3nX5gCabwb2yP2Qzy3fq6JpP7D1pCc1oAvnUxXWg&s=10','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,3,0,NULL,1,'2026-07-06 11:50:10.330','2026-07-06 11:52:57.745',12,4,3,NULL),(46,'Yellow-Red-Blue','httpsencrypted-tbn0gstaticcomimagesqtbnand9gctatobbkmhuajkqtm1piw-a-qqxowphlny4tykzpdmoxgs10','A masterclass in color theory and geometric abstraction, balancing warm and cold colors on a large scale.','https://www.wassily-kandinsky.org/assets/img/paintings/Yellow-Red-Blue.jpg','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAToBBkMHuaJKqtM1piW-A-qqXowpHLNy4tyKzPDMoxg&s=10','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,3,0,NULL,1,'2026-07-06 11:50:59.190','2026-07-06 11:53:00.093',12,4,3,NULL),(47,'Composition with Red, Blue, and Yellow','composition-with-red-blue-and-yellow','A quintessential example of Neoplasticism, featuring a minimalist grid of black lines and primary colors','https://upload.wikimedia.org/wikipedia/commons/a/a4/Piet_Mondriaan%2C_1930_-_Mondrian_Composition_II_in_Red%2C_Blue%2C_and_Yellow.jpg','https://upload.wikimedia.org/wikipedia/commons/a/a4/Piet_Mondriaan%2C_1930_-_Mondrian_Composition_II_in_Red%2C_Blue%2C_and_Yellow.jpg','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,1,0,NULL,1,'2026-07-06 11:54:05.016','2026-07-06 11:54:08.498',13,4,3,NULL),(48,'Broadway Boogie Woogie','broadway-boogie-woogie','Inspired by the city grid of Manhattan and the upbeat rhythm of jazz music, marking a departure from his strict black lines.','https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Piet_Mondrian%2C_1942_-_Broadway_Boogie_Woogie.jpg/1280px-Piet_Mondrian%2C_1942_-_Broadway_Boogie_Woogie.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Piet_Mondrian%2C_1942_-_Broadway_Boogie_Woogie.jpg/1280px-Piet_Mondrian%2C_1942_-_Broadway_Boogie_Woogie.jpg','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,1,0,NULL,1,'2026-07-06 11:55:35.183','2026-07-06 11:55:40.322',13,4,3,NULL),(49,'The Night Watch','the-night-watch','Famous for its colossal size, dramatic use of light and shadow, and the dynamic perception of motion in a military portrait.','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/La_ronda_de_noche%2C_por_Rembrandt_van_Rijn.jpg/1280px-La_ronda_de_noche%2C_por_Rembrandt_van_Rijn.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/La_ronda_de_noche%2C_por_Rembrandt_van_Rijn.jpg/1280px-La_ronda_de_noche%2C_por_Rembrandt_van_Rijn.jpg','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,2,0,NULL,1,'2026-07-06 11:57:03.661','2026-07-06 12:01:37.260',14,5,4,NULL),(50,'The Anatomy Lesson of Dr. Nicolaes Tulp','the-anatomy-lesson-of-dr-nicolaes-tulp','A group portrait of a medical dissection, showcasing Rembrandt\'s early mastery of psychological realism and group dynamics.','https://upload.wikimedia.org/wikipedia/commons/4/4d/Rembrandt_-_The_Anatomy_Lesson_of_Dr_Nicolaes_Tulp.jpg','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf9q-kpHAO91opFXo52WSWInJb51aKuHTA_OlJwnVMmQ&s=10','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,2,0,NULL,1,'2026-07-06 11:58:44.613','2026-07-06 12:01:55.216',14,7,4,NULL),(51,'The Calling of St Matthew','the-calling-of-st-matthew','A masterpiece illustrating the moment Jesus inspires Matthew to follow him, notable for its stark and dramatic chiaroscuro.','https://upload.wikimedia.org/wikipedia/commons/5/59/Caravaggio_%E2%80%94_The_Calling_of_Saint_Matthew.jpg','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShTr8HXFEtnEGynkmZWlcflAn-_VC5U28y96NZvW3jRQ&s=10','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,4,0,NULL,1,'2026-07-06 12:03:44.058','2026-07-06 12:04:34.531',15,8,4,NULL),(52,'Medusa','medusa','Painted on a ceremonial shield, it captures the exact, horrifying moment of Medusa\'s execution with shocking realism.','https://upload.wikimedia.org/wikipedia/commons/1/15/Caravaggio_-_Medusa_-_Google_Art_Project.jpg','https://upload.wikimedia.org/wikipedia/commons/1/15/Caravaggio_-_Medusa_-_Google_Art_Project.jpg','Oil','Canvas mounted on a wooden shield',NULL,NULL,NULL,NULL,NULL,1,0,NULL,1,'2026-07-06 12:06:20.342','2026-07-06 12:06:44.338',15,9,4,NULL),(53,'Infinity Nets','infinity-nets','An early and ongoing series featuring a repetitive, obsessive pattern of tiny loops covering the entire canvas without a focal point.','https://sothebys-com.brightspotcdn.com/de/fb/dcef365641ae97aa093ce69c0538/hk1001-9mpjz-1.jpg','https://sothebys-com.brightspotcdn.com/de/fb/dcef365641ae97aa093ce69c0538/hk1001-9mpjz-1.jpg','Oil / Acrylic','Canvas',NULL,NULL,NULL,NULL,NULL,1,0,NULL,1,'2026-07-06 12:07:59.184','2026-07-06 12:08:02.093',16,4,6,NULL),(54,'Pumpkin','pumpkin','One of her most iconic and personal motifs, representing warmth and stability through her signature polka-dotted pumpkins.','https://cdn.sanity.io/images/dqllnil6/production/95c11d781a3808c9f75b26116c7eee44a6b6c4ba-1343x1010.jpg?w=1080&h=1080','https://cdn.sanity.io/images/dqllnil6/production/95c11d781a3808c9f75b26116c7eee44a6b6c4ba-1343x1010.jpg?w=1080&h=1080','Acrylic','Canvas',NULL,NULL,NULL,NULL,NULL,6,0,NULL,1,'2026-07-06 12:09:30.855','2026-07-06 12:21:35.796',16,10,6,NULL),(55,'L-Tyrosine (Spot Painting)','l-tyrosine-spot-painting','Part of his famous \"Spot Paintings\" series, featuring randomly colored dots arranged in a precise grid, exploring clinical precision.','https://cdn.sanity.io/images/dqllnil6/production/4bf0e156b392ca83f865f37fd8e0b2ec8f9185b1-1199x1200.jpg?w=3840&q=60&auto=format','https://cdn.sanity.io/images/dqllnil6/production/4bf0e156b392ca83f865f37fd8e0b2ec8f9185b1-1199x1200.jpg?w=3840&q=60&auto=format','Household gloss','Canvas',NULL,NULL,NULL,NULL,NULL,3,0,NULL,1,'2026-07-06 12:12:30.131','2026-07-06 12:13:57.402',17,4,6,NULL),(56,'I Am Become Death, Shatterer of Worlds','i-am-become-death-shatterer-of-worlds','A vibrant, kaleidoscopic mandala pattern made entirely from thousands of actual butterfly wings, exploring themes of life and death.','https://www.singulart.com/blog/wp-content/uploads/2024/03/I-Am-Become-Death-Shatterer-of-Worlds.jpg','https://www.singulart.com/blog/wp-content/uploads/2024/03/I-Am-Become-Death-Shatterer-of-Worlds.jpg','Acrylic','Canvas',NULL,NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-07-06 12:16:29.731','2026-07-06 12:17:47.654',17,11,6,NULL),(57,'The Scream','the-scream','A quintessential symbol of modern anxiety and existential dread, featuring an agonized figure against a blood-red sky.','https://upload.wikimedia.org/wikipedia/vi/a/a4/Scr.JPG','https://upload.wikimedia.org/wikipedia/vi/a/a4/Scr.JPG','Tempera and pastel','Cardboard',NULL,NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-07-06 12:19:24.582','2026-07-06 12:19:33.280',18,12,7,NULL),(58,'Madonna','madonna','An unconventional, highly sensual and psychological depiction of the Virgin Mary, exploring themes of life, death, and fertility.','https://upload.wikimedia.org/wikipedia/commons/f/f8/Edvard_Munch_-_Madonna_-_Google_Art_Project_%28495100%29.jpg','https://upload.wikimedia.org/wikipedia/commons/f/f8/Edvard_Munch_-_Madonna_-_Google_Art_Project_%28495100%29.jpg','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-07-06 12:20:58.619','2026-07-06 12:20:58.619',18,12,7,NULL),(59,'Portrait of Wally Neuzil','portrait-of-wally-neuzil','A melancholic, tender, and highly expressive portrait of his famous muse and lover, Walburga \"Wally\" Neuzil.','https://upload.wikimedia.org/wikipedia/commons/6/66/Egon_Schiele_-_Portrait_of_Wally_Neuzil_-_Google_Art_Project.jpg','https://upload.wikimedia.org/wikipedia/commons/6/66/Egon_Schiele_-_Portrait_of_Wally_Neuzil_-_Google_Art_Project.jpg','Oil','Wood Panel',NULL,NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-07-06 12:23:57.108','2026-07-06 12:24:19.997',19,13,7,NULL),(60,'Self-Portrait with Physalis','self-portrait-with-physalis','A striking, angular self-portrait demonstrating his signature twisted lines, intense gaze, and psychological depth.','https://upload.wikimedia.org/wikipedia/commons/b/b8/Egon_Schiele_-_Self-Portrait_with_Physalis_-_Google_Art_Project.jpg','https://upload.wikimedia.org/wikipedia/commons/b/b8/Egon_Schiele_-_Self-Portrait_with_Physalis_-_Google_Art_Project.jpg','Oil and gouache','Wood Panel',NULL,NULL,NULL,NULL,NULL,1,0,NULL,1,'2026-07-06 12:28:09.506','2026-07-06 12:30:20.678',19,15,7,NULL),(61,'Impression, Sunrise','impression-sunrise','The groundbreaking painting that gave the Impressionist movement its name, capturing the hazy morning light over the port of Le Havre.','https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/1280px-Monet_-_Impression%2C_Sunrise.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/1280px-Monet_-_Impression%2C_Sunrise.jpg','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,1,0,NULL,1,'2026-07-06 12:29:12.351','2026-07-06 12:30:22.956',20,14,1,NULL),(62,'Water Lilies (Nymphéas)','water-lilies-nymphas','Part of his monumental series depicting his flower garden at Giverny, focusing purely on the play of light and reflection on water.','https://upload.wikimedia.org/wikipedia/commons/0/02/Monet%2C_Claude_-_Water_Lilies_%28Nymph%C3%A9as%29_-_Google_Art_Project.jpg','https://upload.wikimedia.org/wikipedia/commons/0/02/Monet%2C_Claude_-_Water_Lilies_%28Nymph%C3%A9as%29_-_Google_Art_Project.jpg','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,1,0,NULL,1,'2026-07-06 12:30:10.974','2026-07-06 12:30:41.630',20,14,1,NULL),(63,'Bal du moulin de la Galette','bal-du-moulin-de-la-galette','A vibrant, joyous depiction of a typical Sunday afternoon gathering at a popular dance garden in 19th-century Paris.','https://upload.wikimedia.org/wikipedia/commons/2/21/Pierre-Auguste_Renoir%2C_Le_Moulin_de_la_Galette.jpg','https://upload.wikimedia.org/wikipedia/commons/2/21/Pierre-Auguste_Renoir%2C_Le_Moulin_de_la_Galette.jpg','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,2,0,NULL,1,'2026-07-06 12:31:38.590','2026-07-06 12:35:55.542',21,16,1,NULL),(64,'Luncheon of the Boating Party','luncheon-of-the-boating-party','Shows a richness of form, fluidity of brush stroke, and a flickering light across a relaxed, joyful gathering of the artist\'s friends.','https://upload.wikimedia.org/wikipedia/commons/8/8d/Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg','https://upload.wikimedia.org/wikipedia/commons/8/8d/Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-07-06 12:33:27.033','2026-07-06 12:33:27.033',21,16,1,NULL),(65,'A Burial at Ornans','a-burial-at-ornans','A massive painting recording an ordinary provincial funeral with unflinching, unidealized realism, shocking critics of the time.','https://upload.wikimedia.org/wikipedia/commons/a/a0/Gustave_Courbet_-_A_Burial_at_Ornans_-_Google_Art_Project_2.jpg','https://upload.wikimedia.org/wikipedia/commons/a/a0/Gustave_Courbet_-_A_Burial_at_Ornans_-_Google_Art_Project_2.jpg','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,2,0,NULL,1,'2026-07-06 12:35:52.208','2026-07-06 12:45:03.047',22,16,2,NULL),(66,'The Stone Breakers','the-stone-breakers','Depicts two peasants breaking rocks, serving as a powerful, unsentimental symbol of the harsh realities of rural, working-class life.','https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Gustave_Courbet_-_The_Stonebreakers_-_WGA05457.jpg/1280px-Gustave_Courbet_-_The_Stonebreakers_-_WGA05457.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Gustave_Courbet_-_The_Stonebreakers_-_WGA05457.jpg/1280px-Gustave_Courbet_-_The_Stonebreakers_-_WGA05457.jpg','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-07-06 12:36:46.238','2026-07-06 12:36:46.238',22,16,2,NULL),(67,'The Gleaners','the-gleaners','Features three peasant women gleaning a field of stray stalks of wheat after the harvest, elevating the poorest of society to a noble status.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8g5no-OfwWPlVHg7--lgXELG6eKhxmOvbWjVRJirCqg&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8g5no-OfwWPlVHg7--lgXELG6eKhxmOvbWjVRJirCqg&s=10','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-07-06 12:37:53.925','2026-07-06 12:37:53.925',23,16,2,NULL),(68,'The Angelus','the-angelus','Two peasants bowing in a field over a basket of potatoes to say a prayer, capturing the deep piety and quiet dignity of rural life.','https://upload.wikimedia.org/wikipedia/commons/1/17/JEAN-FRAN%C3%87OIS_MILLET_-_El_%C3%81ngelus_%28Museo_de_Orsay%2C_1857-1859._%C3%93leo_sobre_lienzo%2C_55.5_x_66_cm%29.jpg','https://upload.wikimedia.org/wikipedia/commons/1/17/JEAN-FRAN%C3%87OIS_MILLET_-_El_%C3%81ngelus_%28Museo_de_Orsay%2C_1857-1859._%C3%93leo_sobre_lienzo%2C_55.5_x_66_cm%29.jpg','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-07-06 12:39:08.233','2026-07-06 12:39:08.233',23,16,2,NULL),(69,'The Basket of Apples','the-basket-of-apples','Famous for its disjointed perspective and rejection of traditional rules, this painting bridges Impressionism and Cubism.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-3Uh8QE4ppOnaNS4VE3wzwJWxekJIP7WA-1cvhEW26Q&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-3Uh8QE4ppOnaNS4VE3wzwJWxekJIP7WA-1cvhEW26Q&s=10','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-07-06 12:41:15.390','2026-07-06 12:42:21.716',24,18,5,NULL),(70,'Still Life with Apples and Oranges','still-life-with-apples-and-oranges','A masterful study in shape, color, and compositional balance, turning a simple arrangement of fruit into a monumental visual experience.','https://upload.wikimedia.org/wikipedia/commons/f/f7/Nature_morte_aux_pommes_et_aux_oranges%2C_par_Paul_C%C3%A9zanne.jpg','https://upload.wikimedia.org/wikipedia/commons/f/f7/Nature_morte_aux_pommes_et_aux_oranges%2C_par_Paul_C%C3%A9zanne.jpg','Oil','Canvas',NULL,NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-07-06 12:41:57.725','2026-07-06 12:42:14.260',24,18,5,NULL),(71,'Still Life with a Gilt Cup','still-life-with-a-gilt-cup','A rich \"vanitas\" painting displaying incredible technical skill in rendering the reflective textures of glass, metal, and partially eaten food.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzEhFr3TA-w45KgA5H3gEVTJbBFXZfe_N1UlvdBHQZZQ&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzEhFr3TA-w45KgA5H3gEVTJbBFXZfe_N1UlvdBHQZZQ&s=10','Oil','Oak Panel',NULL,NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-07-06 12:43:55.899','2026-07-06 12:43:55.899',25,18,5,NULL),(72,'Breakfast Table with Blackberry Pie','breakfast-table-with-blackberry-pie','A nearly monochromatic masterpiece of a disturbed meal, emphasizing the fragile, transient nature of life, wealth, and luxury.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGkVQe4MiQjdTr7ANSYGajgId1HF9dWDx_Lj4CAjPePg&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGkVQe4MiQjdTr7ANSYGajgId1HF9dWDx_Lj4CAjPePg&s=10','Oil','Wood Panel',NULL,NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-07-06 12:44:54.847','2026-07-06 12:44:54.847',25,18,5,NULL);
/*!40000 ALTER TABLE `paintings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recommendations`
--

DROP TABLE IF EXISTS `recommendations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommendations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `painting_id` int NOT NULL,
  `score` double NOT NULL,
  `reason` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `recommendations_user_id_painting_id_key` (`user_id`,`painting_id`),
  KEY `recommendations_painting_id_fkey` (`painting_id`),
  CONSTRAINT `recommendations_painting_id_fkey` FOREIGN KEY (`painting_id`) REFERENCES `paintings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `recommendations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=505 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommendations`
--

LOCK TABLES `recommendations` WRITE;
/*!40000 ALTER TABLE `recommendations` DISABLE KEYS */;
/*!40000 ALTER TABLE `recommendations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `search_history`
--

DROP TABLE IF EXISTS `search_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `search_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `query` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parsed_intent` json NOT NULL,
  `result_count` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_sh_user` (`user_id`,`created_at`),
  CONSTRAINT `fk_sh_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `search_history`
--

LOCK TABLES `search_history` WRITE;
/*!40000 ALTER TABLE `search_history` DISABLE KEYS */;
INSERT INTO `search_history` VALUES (3,3,'blue paintings','{\"mood\": \"\", \"color\": \"blue\", \"style\": \"\", \"theme\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\"}',15,'2026-06-26 22:50:19.129'),(4,3,'blue paintings','{\"mood\": \"\", \"color\": \"blue\", \"style\": \"\", \"theme\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\"}',15,'2026-06-26 22:50:30.630'),(5,3,'blue paintings','{\"mood\": \"\", \"color\": \"blue\", \"style\": \"\", \"theme\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\"}',15,'2026-06-26 22:51:02.622'),(6,3,'blue','{\"mood\": \"\", \"color\": \"blue\", \"style\": \"\", \"theme\": \"\", \"artist\": \"\", \"medium\": \"\", \"surface\": \"\", \"category\": \"\"}',15,'2026-06-26 22:54:23.252');
/*!40000 ALTER TABLE `search_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `styles`
--

DROP TABLE IF EXISTS `styles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `styles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `styles_name_key` (`name`),
  UNIQUE KEY `styles_slug_key` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `styles`
--

LOCK TABLES `styles` WRITE;
/*!40000 ALTER TABLE `styles` DISABLE KEYS */;
INSERT INTO `styles` VALUES (1,'Impressionism','impressionism'),(2,'Realism','realism'),(3,'Abstract','abstract'),(4,'Baroque','baroque'),(5,'Still Life','still-life'),(6,'Contemporary','contemporary'),(7,'Expressionism','expressionism');
/*!40000 ALTER TABLE `styles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uploaded_images`
--

DROP TABLE IF EXISTS `uploaded_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uploaded_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `image_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `detected_style` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detected_category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dominant_colors` json DEFAULT NULL,
  `confidence` double DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `uploaded_images_user_id_fkey` (`user_id`),
  CONSTRAINT `uploaded_images_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uploaded_images`
--

LOCK TABLES `uploaded_images` WRITE;
/*!40000 ALTER TABLE `uploaded_images` DISABLE KEYS */;
INSERT INTO `uploaded_images` VALUES (1,NULL,'','Contemporary','Mixed Media','[\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"]',0.484,'2026-06-04 11:59:16.241'),(2,NULL,'','Contemporary','Mixed Media','[\"#CEC7C7\", \"#C4BBBA\", \"#B9B1B1\", \"#0E0C15\", \"#17162A\"]',0.074,'2026-06-04 11:59:35.702'),(3,NULL,'','Contemporary','Mixed Media','[\"#010101\", \"#FBA9A7\", \"#ABAB09\", \"#2D2D05\", \"#514F4E\"]',0.176,'2026-06-04 11:59:43.917'),(4,NULL,'','Contemporary','Mixed Media','[\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"]',0.484,'2026-06-04 13:32:20.874'),(5,NULL,'','Contemporary','Mixed Media','[\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"]',0.484,'2026-06-06 16:34:48.058'),(6,NULL,'','Contemporary','Mixed Media','[\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"]',0.484,'2026-06-11 11:40:47.960'),(7,NULL,'','Contemporary','Mixed Media','[\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"]',0.484,'2026-06-11 13:44:15.028'),(8,NULL,'','Contemporary','Mixed Media','[\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"]',0.484,'2026-06-23 11:11:45.283'),(9,NULL,'','Contemporary','Mixed Media','[\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"]',0.484,'2026-06-23 11:39:14.639'),(10,NULL,'','Contemporary','Mixed Media','[\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"]',0.484,'2026-06-24 08:24:23.957'),(11,NULL,'','Contemporary','Mixed Media','[\"#010101\", \"#FBA9A7\", \"#ABAB09\", \"#2D2D05\", \"#514F4E\"]',0.176,'2026-06-24 08:34:36.438'),(12,NULL,'','Contemporary','Mixed Media','[\"#CEC7C7\", \"#C4BBBA\", \"#B9B1B1\", \"#0E0C15\", \"#17162A\"]',0.074,'2026-06-24 08:34:54.695'),(13,NULL,'','Contemporary','Mixed Media','[\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"]',0.484,'2026-06-24 08:35:01.558'),(15,NULL,'http://localhost:4000/uploads/7ee0aadd-4d91-48cb-a07e-44f753d3d20c.jpg','Contemporary','Mixed Media','{\"colors\": [\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #010000, #4F0302, #330201. The model confidence is 48%, so the result should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/7ee0aadd-4d91-48cb-a07e-44f753d3d20c_thumb.jpg\", \"recommendations\": [5, 13, 21, 29, 37, 42]}',0.484,'2026-06-26 15:31:08.966'),(16,NULL,'http://localhost:4000/uploads/1d706d09-e1dc-447d-a570-3efc5e8bf4ba.jpg','Contemporary','Mixed Media','{\"colors\": [\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #010000, #4F0302, #330201. The model confidence is 48%, so the result should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/1d706d09-e1dc-447d-a570-3efc5e8bf4ba_thumb.jpg\", \"recommendations\": [5, 13, 21, 29, 37, 42]}',0.484,'2026-06-26 15:31:52.419'),(17,NULL,'http://localhost:4000/uploads/0a4cb374-3b5c-4782-b883-db4a9223175d.jpg','Contemporary','Mixed Media','{\"colors\": [\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #010000, #4F0302, #330201. The model confidence is 48%, so the result should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/0a4cb374-3b5c-4782-b883-db4a9223175d_thumb.jpg\", \"recommendations\": [5, 13, 21, 29, 37, 42]}',0.484,'2026-06-27 11:39:29.378'),(19,3,'http://localhost:4000/uploads/d0ac3089-76bc-4b25-9365-ad638b885e40.jpg','Contemporary','Mixed Media','{\"colors\": [\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #010000, #4F0302, #330201. The confidence score is 48%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/d0ac3089-76bc-4b25-9365-ad638b885e40_thumb.jpg\", \"recommendationIds\": [5, 13, 21, 29, 37, 42]}',0.484,'2026-06-27 12:37:06.145'),(20,NULL,'http://localhost:4000/uploads/8ae88535-a5ae-4df9-82cb-49e4b0518bd2.jpg','Contemporary','Mixed Media','{\"colors\": [\"#57882F\", \"#4C792A\", \"#62923A\", \"#679447\", \"#92B28D\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #57882F, #4C792A, #62923A. The confidence score is 98%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/8ae88535-a5ae-4df9-82cb-49e4b0518bd2_thumb.jpg\", \"recommendationIds\": [5, 13, 21, 29, 37]}',0.98,'2026-06-27 13:16:48.657'),(21,NULL,'http://localhost:4000/uploads/92b0c3d7-9508-4c91-9ed1-821ef5e7d9eb.jpg','Contemporary','Mixed Media','{\"colors\": [\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #010000, #4F0302, #330201. The confidence score is 48%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/92b0c3d7-9508-4c91-9ed1-821ef5e7d9eb_thumb.jpg\", \"recommendationIds\": [5, 13, 21, 29, 37]}',0.484,'2026-06-27 13:31:36.905'),(22,NULL,'http://localhost:4000/uploads/d7b5dbda-6d90-4556-8420-5e5436f4cc6a.jpg','Contemporary','Mixed Media','{\"colors\": [\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #010000, #4F0302, #330201. The confidence score is 48%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/d7b5dbda-6d90-4556-8420-5e5436f4cc6a_thumb.jpg\", \"recommendationIds\": [5, 13, 21, 29, 37]}',0.484,'2026-07-02 11:25:35.811'),(23,NULL,'http://localhost:4000/uploads/32489dd6-59f8-401d-8c7a-6fab202a843f.jpg','Contemporary','Mixed Media','{\"colors\": [\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #010000, #4F0302, #330201. The confidence score is 48%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/32489dd6-59f8-401d-8c7a-6fab202a843f_thumb.jpg\", \"recommendationIds\": [5, 13, 21, 29, 37, 43]}',0.484,'2026-07-02 12:13:52.232'),(24,NULL,'http://localhost:4000/uploads/48d9af81-1a49-4197-90ef-87e2979950e5.jpg','Contemporary','Mixed Media','{\"colors\": [\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #010000, #4F0302, #330201. The confidence score is 48%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/48d9af81-1a49-4197-90ef-87e2979950e5_thumb.jpg\", \"recommendationIds\": [5, 13, 21, 29, 37, 43]}',0.484,'2026-07-02 13:17:12.663'),(25,NULL,'http://localhost:4000/uploads/cc5ff219-d31b-420e-8f3f-3637808ff78f.png','Contemporary','Mixed Media','{\"colors\": [\"#090908\", \"#EDB6B0\", \"#ECD1CE\", \"#272828\", \"#A49290\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #090908, #EDB6B0, #ECD1CE. The confidence score is 59%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/cc5ff219-d31b-420e-8f3f-3637808ff78f_thumb.png\", \"recommendationIds\": [5, 13, 21, 29, 37, 43]}',0.586,'2026-07-06 08:59:12.898'),(26,NULL,'http://localhost:4000/uploads/59309784-4fbc-4bf9-a14d-070cca192bcd.png','Contemporary','Mixed Media','{\"colors\": [\"#090908\", \"#EDB6B0\", \"#ECD1CE\", \"#272828\", \"#A49290\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #090908, #EDB6B0, #ECD1CE. The confidence score is 59%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/59309784-4fbc-4bf9-a14d-070cca192bcd_thumb.png\", \"recommendationIds\": [5, 13, 21, 29, 37, 43]}',0.586,'2026-07-06 08:59:45.085'),(27,NULL,'http://localhost:4000/uploads/f3872326-e9ad-4996-a97b-3dd32f020a8e.png','Contemporary','Mixed Media','{\"colors\": [\"#090908\", \"#EDB6B0\", \"#ECD1CE\", \"#272828\", \"#A49290\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #090908, #EDB6B0, #ECD1CE. The confidence score is 59%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/f3872326-e9ad-4996-a97b-3dd32f020a8e_thumb.png\", \"recommendationIds\": [5, 13, 21, 29, 37, 43]}',0.586,'2026-07-06 09:01:12.778'),(28,3,'http://localhost:4000/uploads/9a61f853-48a7-4a77-80c8-72e3ce51b2c5.jpg','Contemporary','Mixed Media','{\"colors\": [\"#010000\", \"#4F0302\", \"#330201\", \"#900602\", \"#6E0401\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #010000, #4F0302, #330201. The confidence score is 48%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/9a61f853-48a7-4a77-80c8-72e3ce51b2c5_thumb.jpg\", \"recommendationIds\": [5, 13, 21, 29, 37, 43]}',0.484,'2026-07-06 09:01:59.665'),(29,3,'http://localhost:4000/uploads/1dd7b388-f258-48ae-bede-fc3ad8afe180.jpg','Contemporary','Mixed Media','{\"colors\": [\"#010101\", \"#FBA9A7\", \"#ABAB09\", \"#2D2D05\", \"#514F4E\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #010101, #FBA9A7, #ABAB09. The confidence score is 18%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/1dd7b388-f258-48ae-bede-fc3ad8afe180_thumb.jpg\", \"recommendationIds\": [5, 13, 21, 29, 37, 43]}',0.176,'2026-07-06 09:11:42.012'),(30,NULL,'http://localhost:4000/uploads/53b2693b-c5f5-4839-bb88-f0efa1032911.jpg','Contemporary','Mixed Media','{\"colors\": [\"#0C1216\", \"#D7D6CB\", \"#A59684\", \"#E3E5DC\", \"#AC8B76\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #0C1216, #D7D6CB, #A59684. The confidence score is 8%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/53b2693b-c5f5-4839-bb88-f0efa1032911_thumb.jpg\", \"recommendationIds\": [5, 13, 21, 29, 37, 43]}',0.082,'2026-07-06 09:17:55.156'),(31,NULL,'http://localhost:4000/uploads/1dfaed27-44d2-466d-94e8-5e9898996f33.jpg','Contemporary','Mixed Media','{\"colors\": [\"#EAE5D7\", \"#D4D3CD\", \"#E4DBCE\", \"#D3CDB4\", \"#EFECE2\"], \"medium\": \"Digital or mixed media\", \"summary\": \"The uploaded artwork appears to be a contemporary mixed media work with a dominant palette of #EAE5D7, #D4D3CD, #E4DBCE. The confidence score is 68%, so this should be treated as an AI-assisted reading rather than a definitive attribution.\", \"surface\": \"Canvas\", \"thumbnailUrl\": \"http://localhost:4000/uploads/1dfaed27-44d2-466d-94e8-5e9898996f33_thumb.jpg\", \"recommendationIds\": [5, 13, 21, 29, 37, 43]}',0.682,'2026-07-06 09:18:25.997');
/*!40000 ALTER TABLE `uploaded_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `role` enum('USER','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `refresh_token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'trnminh131@gmail.com','$2a$12$i6a1zBANrFis/awqu9WoYeapn/EiVe9/Q7Fjiiesg255yEQHy0UCq','Trần Ngọc Minh','http://localhost:4000/uploads/8e739125-1863-4ca1-9eca-53b75948eb14_thumb.jpg','anh minh đẹp trai','USER','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzgzMzQyMTczLCJleHAiOjE3ODM5NDY5NzN9.nVD-XsmijV4ibHoTEto-vGfsIJzWxlaZNhUd9sZsCMY','2026-06-24 09:07:28.687','2026-07-06 12:49:33.871'),(4,'admin@aurelis.com','$2a$12$uauWqpf9feBaa6BTX7GtEO5V04aO6fuuejiF4j17DW/cqRXurznYy','Admin',NULL,NULL,'ADMIN','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzgzMzQxODk3LCJleHAiOjE3ODM5NDY2OTd9.iO9o7BxZVWjvPIxu1NUYlyfhyj2_W0ZOdkoOm0gSt5s','2026-06-24 09:08:21.357','2026-07-06 12:44:57.715');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `view_history`
--

DROP TABLE IF EXISTS `view_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `view_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `painting_id` int NOT NULL,
  `viewed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `view_history_user_id_viewed_at_idx` (`user_id`,`viewed_at`),
  KEY `view_history_painting_id_fkey` (`painting_id`),
  CONSTRAINT `view_history_painting_id_fkey` FOREIGN KEY (`painting_id`) REFERENCES `paintings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `view_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `view_history`
--

LOCK TABLES `view_history` WRITE;
/*!40000 ALTER TABLE `view_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `view_history` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-06 20:05:42
