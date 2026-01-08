-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 16, 2025 at 06:43 PM
-- Server version: 8.0.43-0ubuntu0.24.04.1
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `it_std6630251296`
--

-- --------------------------------------------------------

--
-- Table structure for table `Final_Tic_Jum_Inventory`
--

CREATE TABLE `Final_Tic_Jum_Inventory` (
  `Tic_Jum_ID_Product` int NOT NULL,
  `Tic_Jum_Name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Tic_jum_Price_Unit` decimal(10,0) DEFAULT NULL,
  `Tic_Jum_Qty_Stock` int DEFAULT NULL,
  `Tic_Jum_Img_Path` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Final_Tic_Jum_Inventory`
--

INSERT INTO `Final_Tic_Jum_Inventory` (`Tic_Jum_ID_Product`, `Tic_Jum_Name`, `Tic_jum_Price_Unit`, `Tic_Jum_Qty_Stock`, `Tic_Jum_Img_Path`) VALUES
(3, 'butter4', 12, 12, 'http://nindam.sytes.net/std6630251296/Inventory/uploads/images/829cad70-5ba2-46c1-9a32-15631788ad04.jpg'),
(6, 'Butter1', 12, 10, 'http://nindam.sytes.net/std6630251296/Inventory/uploads/images/49b30da2-c118-43e8-90f5-1ca9da3eab9e.jpg'),
(7, 'butter2', 124, 124, 'http://nindam.sytes.net/std6630251296/Inventory/uploads/images/635be625-d9df-46ae-a1f6-ff796fab49e9.png'),
(8, 'butter3', 124, 124, 'http://nindam.sytes.net/std6630251296/Inventory/uploads/images/9f6cf324-e30e-463a-b308-d45374ee78ce.jpg'),
(9, 'butter5', 12, 12, 'http://nindam.sytes.net/std6630251296/Inventory/uploads/images/6424a8d9-077d-4739-9703-e17e927448c4.jpeg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Final_Tic_Jum_Inventory`
--
ALTER TABLE `Final_Tic_Jum_Inventory`
  ADD PRIMARY KEY (`Tic_Jum_ID_Product`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Final_Tic_Jum_Inventory`
--
ALTER TABLE `Final_Tic_Jum_Inventory`
  MODIFY `Tic_Jum_ID_Product` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
