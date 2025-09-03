-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 01, 2025 at 07:26 PM
-- Server version: 10.6.22-MariaDB-cll-lve-log
-- PHP Version: 8.3.23

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `greacspm_pizza_club_site`
--

DELIMITER $$
--
-- Procedures
--
$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `api_keys`
--

CREATE TABLE `api_keys` (
  `id` int(11) NOT NULL,
  `key_hash` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `event_date` datetime NOT NULL,
  `location` varchar(200) NOT NULL,
  `address` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `max_attendees` int(11) DEFAULT NULL,
  `rsvp_link` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `infographics`
--

CREATE TABLE `infographics` (
  `id` varchar(50) NOT NULL,
  `restaurant_id` varchar(50) NOT NULL,
  `visit_date` date NOT NULL,
  `status` enum('draft','published') DEFAULT 'draft',
  `title` varchar(200) DEFAULT NULL,
  `subtitle` varchar(200) DEFAULT NULL,
  `layout` varchar(50) DEFAULT 'default',
  `custom_text` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`custom_text`)),
  `show_ratings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`show_ratings`)),
  `published_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `infographic_photos`
--

CREATE TABLE `infographic_photos` (
  `id` varchar(50) NOT NULL,
  `infographic_id` varchar(50) NOT NULL,
  `url` varchar(500) NOT NULL,
  `position_x` decimal(5,2) NOT NULL,
  `position_y` decimal(5,2) NOT NULL,
  `width` decimal(5,2) NOT NULL,
  `height` decimal(5,2) NOT NULL,
  `opacity` decimal(3,2) DEFAULT 1.00,
  `layer` enum('background','foreground') DEFAULT 'background',
  `focal_point_x` decimal(5,2) DEFAULT NULL,
  `focal_point_y` decimal(5,2) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `infographic_quotes`
--

CREATE TABLE `infographic_quotes` (
  `infographic_id` varchar(50) NOT NULL,
  `quote_id` int(11) NOT NULL,
  `position_x` decimal(5,2) DEFAULT NULL,
  `position_y` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `bio` text DEFAULT NULL,
  `photo` varchar(500) DEFAULT NULL,
  `member_since` varchar(50) DEFAULT NULL,
  `favorite_pizza_style` varchar(100) DEFAULT NULL,
  `restaurants_visited` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `display_order` int(11) DEFAULT 999999,
  `focal_point_x` decimal(5,2) DEFAULT NULL COMMENT 'Focal point X percentage (0-100)',
  `focal_point_y` decimal(5,2) DEFAULT NULL COMMENT 'Focal point Y percentage (0-100)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `name`, `bio`, `photo`, `member_since`, `favorite_pizza_style`, `restaurants_visited`, `created_at`, `updated_at`, `display_order`, `focal_point_x`, `focal_point_y`) VALUES
('bob-gill', 'Bob Gill', 'As the Vice President of Appetizer Selection at the Pizza Club, Bob\'s discerning palate and extensive knowledge of restaurant menus make him an indispensable asset. Bob\'s primary responsibility is to ensure that our appetizer selections are nothing short of perfect, catering to the mature tastes and preferences of our members.\n \nBob\'s expertise in appetizer selection is unmatched. Prior to each club meeting, he spends hours researching in his impressive at-home library of restaurant menus, considered to be one of the most extensive private collection of restaurant menus in the world.  His ability to adeptly navigate any disagreement or debate about appetizer selection ensures a satisfying start to every meal.\n \nBefore joining the Pizza Club, Bob founded Muncheese, the revolutionary appetizer selection app often referred to as the \'Tinder of appetizer selection apps.\' His groundbreaking and innovative approach to choosing the perfect appetizers has garnered widespread acclaim, solidifying his reputation as a trailblazer in the field.', 'https://greaterchicagolandpizza.club/images/infographics/member-bob-gill/photo-1754108455591.webp', '2013-01-26', 'VP of Appetizer Selection', 0, '2025-08-01 19:58:26', '2025-08-05 00:01:18', 40, 48.77, 39.83),
('chris-daum', 'Chris Daum', 'As the world\'s only salami sommelier, Chris brings over thirty years of unparalleled expertise in the art of pizza topping selection. His discerning palate and passion for creatively culinary topping combination ensure that every pizza we order is a masterpiece of flavor and innovation.\n \nChris’ journey to topping greatness began in the taverns on the south side of Chicago, where, as a youth, he discovered an uncanny knack for topping selection. With the esteemed Rose Barraco once referring to a teenage Chris as the next Jimmy \'The Selectsman\' Bufugliano. \n \nAfter honing his skills studying under the artisanal cheesemakers of Wisconsin, Chris returned to Chicago and quickly ascended to the top of the pizza topping connoisseurship world. His innovative approach to blending classic and contemporary flavors has earned him numerous accolades, including the coveted Wesley Willis Award for Pepperoni Placement.\n \nHis unwavering commitment to excellence and his uncanny ability to discover unique and delectable toppings make him the bedrock of the Greater Chicagoland Pizza Club.', 'https://greaterchicagolandpizza.club/images/infographics/member-chris-daum/photo-1754246677728.webp', '2013-01-26', 'VP of Topping Innovation', 0, '2025-08-01 19:58:26', '2025-08-04 23:59:20', 30, 50.00, 25.00),
('member_1754333140893', 'Joe Cirillo', 'Joe serves as the President of Club Coordination at the Pizza Club, where his unwavering dedication ensures the seamless organization of our gastronomic adventures. With an impressive track record of coaxing timely responses from even the flakiest of members, Joe\'s role is pivotal to our club\'s success.\n \nJoe\'s responsibilities include diligently texting club members to nail down meeting dates, a task he approaches with both persistence and a hint of exasperation. His exceptional talent for handling non-responders and managing the delicate art of converting initial enthusiasm into confirmed commitments is unparalleled. Without Joe\'s tireless efforts, our pizza explorations would remain mere aspirations.\n \nJoe\'s expertise in herding cats—otherwise known as coordinating our club meetings—has cemented his reputation as the indispensable force behind our successful gatherings. His leadership ensures that our love for pizza is regularly celebrated with gusto, one meticulously planned outing at a time.', 'https://greaterchicagolandpizza.club/images/infographics/member-member_1754333140893/photo-1754344565521.webp', '2013-01-26', 'President of Club Coordination', 0, '2025-08-04 18:45:41', '2025-08-04 23:55:06', 10, NULL, NULL),
('member_1754351698812', 'Ryan Coe', 'As the Vice President of Table Management and Growth, Ryan he brings his unparalleled expertise in optimizing table space and maintaining an organized dining environment. With a sharp eye for detail and a no-nonsense approach to unnecessary clutter, Ryan ensures that our tables remain free of frivolous items, enhancing the overall dining experience.\n \nRenowned for his pioneering advocacy of the \"No Ask, No Glass\" policy, Ryan has successfully minimized the intrusion of unrequested water glasses brought by well-meaning waitstaff. This policy, now widely adopted by the industry at large, reflects Ryan\'s innovative approach to table management. His vigilance extends beyond water, encompassing all aspects of table organization to ensure that every item is precisely where it needs to be throughout the meal.\n \nRyan\'s commitment to efficient table management has significantly contributed to the growth and enjoyment of our club gatherings. His leadership guarantees a streamlined and enjoyable pizza experience, where every slice is savored without the distraction of unnecessary clutter.', 'https://greaterchicagolandpizza.club/images/infographics/member-new-1754351590987/photo-1754351598281.webp', '2013-01-26', 'VP of Table Management and Growth', 0, '2025-08-04 23:54:59', '2025-08-05 03:26:37', 20, 50.98, 56.78),
('member_1754352274613', 'Pat Kleszynski', 'Pat holds the crucial role of Director of Fungal Avoidance at the Pizza Club, a position born out of his profound aversion to mushrooms. Known for his generally amenable nature, Pat is willing to go along with almost any decision—until the topic of mushrooms arises. \n \nPat\'s primary responsibility is to ensure that our pizzas remain free of mushrooms, employing a range of pioneering strategies to achieve this goal. His tactics include meticulous menu scrutiny, preemptive discussions with waitstaff, and the occasional use of coded language to avoid the dreaded ingredient. Pat\'s unwavering commitment to this cause has saved countless pizzas from being \"soiled\" by mushrooms, much to the chagrin of other members.\n \nDespite his firm stance on mushrooms, Pat\'s flexibility and willingness to accommodate other preferences make him an invaluable member of our club. His dedication to fungal coordination ensures that our pizza experiences are enjoyable for all, maintaining a balance between childish personal preferences and collective enjoyment.', 'https://greaterchicagolandpizza.club/images/infographics/member-new-1754352110649/photo-1754352121404.webp', '2013-01-26', 'Director of Toppings, Fungal Avoidance Division', 0, '2025-08-05 00:04:35', '2025-08-05 00:05:29', 50, 50.37, 51.68),
('member_1754352543043', 'Kevin Martin', 'Hailing from the vibrant city of Chicago, Kevin\'s primary responsibility is to highlight the geographic diversity (or lack thereof) in our pizza selections, often reminding us that only some live in the suburbs. \n \nKevin\'s expertise in remote engagement has been a game-changer in maintaining a mediocre connection with all club members, regardless of their location. His ability to balance enthusiasm and disappointment is often overlooked when deciding on the club\'s next outing.\n \nKevin\'s virtual presence is a significant force in all club activities, even when he\'s not physically present. His influence is so strong that \'We have Kevin at home\' has become a rallying cry for the club.', 'https://greaterchicagolandpizza.club/images/infographics/member-member_1754352543043/photo-1754352551322.webp', '2013-01-26', 'Sr. Director of Remote Engagement', 0, '2025-08-05 00:09:03', '2025-08-05 00:09:38', 60, 7.35, 42.48),
('member_1754352689855', 'Matt Oriente', 'Despite being a relative newcomer to the tavern selection field, Matt\'s unwavering dedication and meticulous attention to detail have significantly enhanced our pizza outings, ensuring they are always exceptional.\n \nIn his pursuit of tavern perfection, Matt introduced the groundbreaking PIGS methodology, which has since become a standard in the field of tavern selection. PIGS, an acronym for Paneling (Wood) Ratio, Interior Ambiance, Giardiniera Availability, and Slice Thinness, is a comprehensive rating system that Matt developed by evaluating these crucial factors. It guarantees an unparalleled pizza club experience.\n \nMatt\'s innovative approach to tavern research and selection, combining both science and art, have elevated our pizza outings into well-curated events that perfectly blend tradition and where-the-fuck-are-we.', 'https://greaterchicagolandpizza.club/images/infographics/member-member_1754352689855/photo-1754353273223.webp', '2013-01-26', 'Director of Tavern Research and Selection', 0, '2025-08-05 00:11:30', '2025-08-05 00:21:21', 70, 50.00, 25.00),
('member_1754620299852', 'Bill Brumett', 'Bill Director of Cloud Talk at the Pizza Club, a role defined by his unique ability to initiate enthusiastic discussions about upcoming meetings. With a blend of guilt and confidence, Bill often makes it seem like attending is a top priority for him, giving the club a false sense of security that Bill will actually attend. \n \nHowever, when the time comes to finalize plans, Bill\'s infamous flakiness emerges. Whether it\'s forgetting to respond, suddenly remembering prior commitments, or needing to travel, Bill\'s attendance becomes increasingly unlikely. Despite this, his role is crucial to the club\'s dynamics.\n \nBill\'s strategic approach ensures that no other member wants to risk appearing as unreliable as he does. His consistent flakiness inadvertently motivates the rest of the group to confirm their attendance, thereby enhancing overall participation. This ingenious tactic has cemented Bill\'s importance within the club.\n \nThrough his unpredictable participation, Bill plays a pivotal part in maintaining the commitment levels of our members, ensuring that our pizza outings are well-attended and thoroughly enjoyed.', 'https://greaterchicagolandpizza.club/images/infographics/member-new-1754620275132/photo-1754620293675.webp', '2013-01-26', 'Director of Cloud Talk', 0, '2025-08-08 02:31:40', '2025-08-08 02:34:50', 80, NULL, NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `member_statistics`
-- (See below for the actual view)
--
CREATE TABLE `member_statistics` (
`id` varchar(50)
,`name` varchar(100)
,`total_visits` bigint(21)
,`unique_restaurants` bigint(21)
,`average_rating_given` decimal(7,6)
);

-- --------------------------------------------------------

--
-- Table structure for table `quotes`
--

CREATE TABLE `quotes` (
  `id` int(11) NOT NULL,
  `text` text NOT NULL,
  `author` varchar(100) NOT NULL,
  `restaurant_id` varchar(50) DEFAULT NULL,
  `visit_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `visit_id` int(11) NOT NULL,
  `member_id` varchar(50) NOT NULL,
  `category_id` int(11) NOT NULL,
  `rating` decimal(3,2) NOT NULL CHECK (`rating` >= 0 and `rating` <= 5),
  `pizza_order` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id`, `visit_id`, `member_id`, `category_id`, `rating`, `pizza_order`, `created_at`, `updated_at`) VALUES
(97, 12, 'bob-gill', 1, 3.00, NULL, '2025-08-08 21:47:12', '2025-08-08 21:47:12'),
(98, 12, 'bob-gill', 19, 2.20, NULL, '2025-08-08 21:47:12', '2025-08-08 21:47:12'),
(99, 12, 'bob-gill', 10, 1.30, NULL, '2025-08-08 21:47:12', '2025-08-08 21:47:12'),
(100, 12, 'bob-gill', 11, 2.50, NULL, '2025-08-08 21:47:12', '2025-08-08 21:47:12'),
(101, 12, 'bob-gill', 5, 2.30, NULL, '2025-08-08 21:47:12', '2025-08-08 21:47:12'),
(102, 12, 'bob-gill', 6, 4.00, NULL, '2025-08-08 21:47:12', '2025-08-08 21:47:12'),
(103, 12, 'bob-gill', 7, 4.20, NULL, '2025-08-08 21:47:12', '2025-08-08 21:47:12'),
(104, 12, 'bob-gill', 8, 2.80, NULL, '2025-08-08 21:47:12', '2025-08-08 21:47:12'),
(105, 12, 'bob-gill', 9, 3.50, NULL, '2025-08-08 21:47:12', '2025-08-08 21:47:12'),
(106, 12, 'bob-gill', 2, 2.30, NULL, '2025-08-08 21:47:12', '2025-08-08 21:47:12'),
(107, 10, 'bob-gill', 19, 3.40, NULL, '2025-08-08 21:47:53', '2025-08-08 21:47:53'),
(108, 10, 'bob-gill', 10, 4.40, NULL, '2025-08-08 21:47:53', '2025-08-08 21:47:53'),
(109, 10, 'bob-gill', 11, 3.40, NULL, '2025-08-08 21:47:53', '2025-08-08 21:47:53'),
(110, 10, 'bob-gill', 5, 2.10, NULL, '2025-08-08 21:47:53', '2025-08-08 21:47:53'),
(111, 10, 'bob-gill', 6, 2.40, NULL, '2025-08-08 21:47:53', '2025-08-08 21:47:53'),
(112, 10, 'bob-gill', 7, 3.70, NULL, '2025-08-08 21:47:53', '2025-08-08 21:47:53'),
(113, 10, 'bob-gill', 8, 3.40, NULL, '2025-08-08 21:47:53', '2025-08-08 21:47:53'),
(114, 10, 'bob-gill', 9, 1.10, NULL, '2025-08-08 21:47:53', '2025-08-08 21:47:53'),
(115, 10, 'bob-gill', 1, 2.80, NULL, '2025-08-08 21:47:53', '2025-08-08 21:47:53'),
(116, 10, 'bob-gill', 2, 2.40, NULL, '2025-08-08 21:47:53', '2025-08-08 21:47:53'),
(127, 11, 'bob-gill', 19, 3.70, NULL, '2025-08-08 21:48:46', '2025-08-08 21:48:46'),
(128, 11, 'bob-gill', 10, 4.50, NULL, '2025-08-08 21:48:46', '2025-08-08 21:48:46'),
(129, 11, 'bob-gill', 11, 4.20, NULL, '2025-08-08 21:48:46', '2025-08-08 21:48:46'),
(130, 11, 'bob-gill', 5, 4.00, NULL, '2025-08-08 21:48:46', '2025-08-08 21:48:46'),
(131, 11, 'bob-gill', 6, 4.20, NULL, '2025-08-08 21:48:46', '2025-08-08 21:48:46'),
(132, 11, 'bob-gill', 7, 4.20, NULL, '2025-08-08 21:48:46', '2025-08-08 21:48:46'),
(133, 11, 'bob-gill', 8, 3.70, NULL, '2025-08-08 21:48:46', '2025-08-08 21:48:46'),
(134, 11, 'bob-gill', 9, 4.30, NULL, '2025-08-08 21:48:46', '2025-08-08 21:48:46'),
(135, 11, 'bob-gill', 1, 4.00, NULL, '2025-08-08 21:48:46', '2025-08-08 21:48:46'),
(136, 11, 'bob-gill', 2, 3.70, NULL, '2025-08-08 21:48:46', '2025-08-08 21:48:46'),
(137, 14, 'bob-gill', 1, 3.50, NULL, '2025-08-08 21:55:01', '2025-08-08 21:55:01'),
(138, 14, 'bob-gill', 2, 2.80, '14\" pepperoni, hot giardiniera', '2025-08-08 21:55:01', '2025-08-08 21:55:01'),
(139, 14, 'bob-gill', 2, 3.80, '14\" plain cheese', '2025-08-08 21:55:01', '2025-08-08 21:55:01'),
(140, 14, 'bob-gill', 2, 3.40, '14\" sausage, green pepper, onion, mushroom', '2025-08-08 21:55:01', '2025-08-08 21:55:01'),
(141, 14, 'bob-gill', 5, 3.80, NULL, '2025-08-08 21:55:01', '2025-08-08 21:55:01'),
(142, 14, 'bob-gill', 6, 3.60, NULL, '2025-08-08 21:55:01', '2025-08-08 21:55:01'),
(143, 14, 'bob-gill', 7, 3.60, NULL, '2025-08-08 21:55:01', '2025-08-08 21:55:01'),
(144, 14, 'bob-gill', 8, 3.60, NULL, '2025-08-08 21:55:01', '2025-08-08 21:55:01'),
(145, 14, 'bob-gill', 9, 4.00, NULL, '2025-08-08 21:55:01', '2025-08-08 21:55:01'),
(146, 14, 'bob-gill', 19, 4.00, NULL, '2025-08-08 21:55:01', '2025-08-08 21:55:01'),
(147, 14, 'bob-gill', 10, 4.20, NULL, '2025-08-08 21:55:01', '2025-08-08 21:55:01'),
(148, 14, 'bob-gill', 11, 3.60, NULL, '2025-08-08 21:55:01', '2025-08-08 21:55:01'),
(161, 15, 'bob-gill', 1, 4.00, NULL, '2025-08-09 01:40:32', '2025-08-09 01:40:32'),
(162, 15, 'bob-gill', 19, 3.90, NULL, '2025-08-09 01:40:32', '2025-08-09 01:40:32'),
(163, 15, 'bob-gill', 10, 4.10, NULL, '2025-08-09 01:40:32', '2025-08-09 01:40:32'),
(164, 15, 'bob-gill', 11, 3.70, NULL, '2025-08-09 01:40:32', '2025-08-09 01:40:32'),
(165, 15, 'bob-gill', 5, 4.10, NULL, '2025-08-09 01:40:32', '2025-08-09 01:40:32'),
(166, 15, 'bob-gill', 6, 4.10, NULL, '2025-08-09 01:40:32', '2025-08-09 01:40:32'),
(167, 15, 'bob-gill', 7, 3.70, NULL, '2025-08-09 01:40:32', '2025-08-09 01:40:32'),
(168, 15, 'bob-gill', 8, 3.90, NULL, '2025-08-09 01:40:32', '2025-08-09 01:40:32'),
(169, 15, 'bob-gill', 9, 4.30, NULL, '2025-08-09 01:40:32', '2025-08-09 01:40:32'),
(170, 15, 'bob-gill', 2, 3.90, '14\" \'The John\': spicy crumbled sausage, red pepper flakes, hot oil drizzle; comes triangle cut', '2025-08-09 01:40:32', '2025-08-09 01:40:32'),
(171, 15, 'bob-gill', 2, 3.70, '14\" \'Nova Special\': sausage, onion, green pepper, no mushroom', '2025-08-09 01:40:32', '2025-08-09 01:40:32'),
(172, 15, 'bob-gill', 2, 4.40, '14\" meatballs, hot giaridiniera, garlic', '2025-08-09 01:40:32', '2025-08-09 01:40:32'),
(210, 13, 'bob-gill', 1, 4.40, NULL, '2025-09-01 23:15:05', '2025-09-01 23:15:05'),
(211, 13, 'bob-gill', 19, 3.60, NULL, '2025-09-01 23:15:05', '2025-09-01 23:15:05'),
(212, 13, 'bob-gill', 10, 4.20, NULL, '2025-09-01 23:15:05', '2025-09-01 23:15:05'),
(213, 13, 'bob-gill', 11, 3.20, NULL, '2025-09-01 23:15:05', '2025-09-01 23:15:05'),
(214, 13, 'bob-gill', 5, 4.80, NULL, '2025-09-01 23:15:05', '2025-09-01 23:15:05'),
(215, 13, 'bob-gill', 6, 5.00, NULL, '2025-09-01 23:15:05', '2025-09-01 23:15:05'),
(216, 13, 'bob-gill', 7, 4.60, NULL, '2025-09-01 23:15:05', '2025-09-01 23:15:05'),
(217, 13, 'bob-gill', 8, 3.80, NULL, '2025-09-01 23:15:05', '2025-09-01 23:15:05'),
(218, 13, 'bob-gill', 9, 4.60, NULL, '2025-09-01 23:15:05', '2025-09-01 23:15:05'),
(219, 13, 'bob-gill', 2, 3.00, 'Pizza 2 - Toppings: Pepperoni, Sausage, Extra Cheese', '2025-09-01 23:15:05', '2025-09-01 23:15:05');

--
-- Triggers `ratings`
--
DELIMITER $$
CREATE TRIGGER `update_restaurant_rating_after_rating_change` AFTER INSERT ON `ratings` FOR EACH ROW BEGIN
  DECLARE v_restaurant_id VARCHAR(50);
  
  SELECT rv.restaurant_id INTO v_restaurant_id
  FROM restaurant_visits rv
  WHERE rv.id = NEW.visit_id;
  
  CALL update_restaurant_average_rating(v_restaurant_id);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `rating_categories`
--

CREATE TABLE `rating_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `parent_category` varchar(50) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rating_categories`
--

INSERT INTO `rating_categories` (`id`, `name`, `parent_category`, `display_order`, `created_at`) VALUES
(1, 'overall', NULL, 1, '2025-08-01 18:57:00'),
(2, 'pizzas', NULL, 2, '2025-08-01 18:57:00'),
(3, 'pizza-components', NULL, 3, '2025-08-01 18:57:00'),
(4, 'the-other-stuff', NULL, 4, '2025-08-01 18:57:00'),
(5, 'crust', 'pizza-components', 1, '2025-08-01 18:57:00'),
(6, 'bake', 'pizza-components', 2, '2025-08-01 18:57:00'),
(7, 'toppings', 'pizza-components', 3, '2025-08-01 18:57:00'),
(8, 'sauce', 'pizza-components', 4, '2025-08-01 18:57:00'),
(9, 'consistency', 'pizza-components', 5, '2025-08-01 18:57:00'),
(10, 'wait-staff', 'the-other-stuff', 2, '2025-08-01 18:57:00'),
(11, 'atmosphere', 'the-other-stuff', 3, '2025-08-01 18:57:00'),
(13, 'order', 'pizzas', 0, '2025-08-01 19:58:26'),
(14, 'rating', 'pizzas', 0, '2025-08-01 19:58:26'),
(19, 'appetizers', 'the-other-stuff', 1, '2025-08-05 22:54:30');

-- --------------------------------------------------------

--
-- Table structure for table `restaurants`
--

CREATE TABLE `restaurants` (
  `id` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `location` varchar(200) DEFAULT NULL,
  `address` varchar(500) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `style` varchar(100) DEFAULT NULL,
  `price_range` enum('$','$$','$$$','$$$$') DEFAULT NULL,
  `website` varchar(500) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `must_try` varchar(200) DEFAULT NULL,
  `average_rating` decimal(3,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `hero_image` varchar(500) DEFAULT NULL COMMENT 'URL or path to restaurant hero image',
  `hero_focal_point_x` decimal(5,2) DEFAULT NULL COMMENT 'Focal point X coordinate (0-100)',
  `hero_focal_point_y` decimal(5,2) DEFAULT NULL COMMENT 'Focal point Y coordinate (0-100)',
  `hero_zoom` decimal(3,1) DEFAULT NULL COMMENT 'Zoom level for hero image (1.0-3.0)',
  `hero_pan_x` decimal(5,2) DEFAULT NULL COMMENT 'Pan X offset for hero image (-50.00 to 50.00)',
  `hero_pan_y` decimal(5,2) DEFAULT NULL COMMENT 'Pan Y offset for hero image (-50.00 to 50.00)'
) ;

--
-- Dumping data for table `restaurants`
--

INSERT INTO `restaurants` (`id`, `name`, `location`, `address`, `latitude`, `longitude`, `style`, `price_range`, `website`, `phone`, `must_try`, `average_rating`, `created_at`, `updated_at`, `hero_image`, `hero_focal_point_x`, `hero_focal_point_y`, `hero_zoom`, `hero_pan_x`, `hero_pan_y`) VALUES
('restaurant_1754620768685', 'Old Oak Country Club', 'Homer Glen', '14200 Parker Rd, Homer Glen, IL 60491', 41.63101704, -87.95355041, 'Chicago', NULL, 'http://www.oldoakcc.com/', '', '', 2.60, '2025-08-08 02:39:29', '2025-08-08 21:47:53', 'https://greaterchicagolandpizza.club/images/restaurants/old-oak-country-club/hero.webp?t=1754624964094', 40.47, 37.58, 1.0, 30.00, NULL),
('restaurant_1754671167307', 'Papa\'s Pizza Place', 'Woodridge', '8258 Janes Ave, Woodridge, IL 60517', 41.73730000, -88.04172000, 'Chicago', NULL, 'https://www.papaspizzaplace.com/', '', '', 3.85, '2025-08-08 16:39:27', '2025-08-08 21:48:46', 'https://greaterchicagolandpizza.club/images/restaurants/papas-pizza-place/hero.webp?t=1754676690874', NULL, NULL, 1.3, -11.00, NULL),
('restaurant_1754677119237', 'Falco\'s Pizza', 'Burr Ridge', '16W561 S Frontage Rd, Burr Ridge, IL 60527', 41.73473000, -87.94306000, 'Chicago', NULL, 'https://www.falcospizza.com/', '', '', 2.65, '2025-08-08 18:18:40', '2025-08-08 21:47:12', 'https://greaterchicagolandpizza.club/images/restaurants/falcos-pizza/hero.webp?t=1754677105177', 46.02, 61.68, 1.3, 32.00, -1.00),
('restaurant_1754689157484', 'Enzo\'s Pizzeria', 'Homer Glen', '13001 W 143rd St, Homer Glen, IL 60491', 41.62818000, -87.93884000, 'Chicago', NULL, 'https://www.facebook.com/Enzos.Pizzeria.Homer.Glen/', '', '', 3.70, '2025-08-08 21:39:19', '2025-09-01 23:15:05', 'https://greaterchicagolandpizza.club/images/restaurants/enzos-pizzeria/hero.webp?t=1754688933957', 51.80, 21.29, NULL, 24.00, -9.00),
('restaurant_1754689926227', 'Traverso\'s Italian Restaurant, Lounge, & Pizzeria', 'Naperville', '2523 Plainfield-Naperville Rd, Naperville, IL 60564', 41.71913000, -88.16787000, 'Chicago', NULL, 'http://www.traversosrestaurant.com/', '', '', 3.38, '2025-08-08 21:52:07', '2025-08-08 21:55:01', 'https://greaterchicagolandpizza.club/images/restaurants/traversos-italian-restaurant-lounge-pizzeria/hero.webp?t=1754689897695', NULL, NULL, NULL, 10.00, 0.00),
('restaurant_1754690406359', 'Villa Nova Pizza - Lockport', 'Lockport', '946 N State St, Lockport, IL 60441', 41.60862000, -88.04412000, 'Chicago', NULL, 'https://lockport.villanova.pizza/', '', '', 4.00, '2025-08-08 22:00:07', '2025-08-09 01:40:32', 'https://greaterchicagolandpizza.club/images/restaurants/villa-nova-pizza-lockport/hero.webp?t=1754690376345', 24.34, 70.03, 1.3, 49.00, -6.00);

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_visits`
--

CREATE TABLE `restaurant_visits` (
  `id` int(11) NOT NULL,
  `restaurant_id` varchar(50) NOT NULL,
  `visit_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `quotes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of quotes with text and author from the visit' CHECK (json_valid(`quotes`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `restaurant_visits`
--

INSERT INTO `restaurant_visits` (`id`, `restaurant_id`, `visit_date`, `notes`, `created_at`, `updated_at`, `quotes`) VALUES
(10, 'restaurant_1754620768685', '2024-08-05', 'Scores suffer due to main pizza maker \"not in today\"; we were warned prior to ordering.', '2025-08-08 16:37:21', '2025-08-08 21:47:53', NULL),
(11, 'restaurant_1754671167307', '2024-07-24', 'Frosted schooners of beer; stellar restaurant vibe.', '2025-08-08 16:43:11', '2025-08-08 21:48:46', NULL),
(12, 'restaurant_1754677119237', '2025-01-16', 'All pies ordered well done, like god intended; tough calling this thin crust pizza.', '2025-08-08 18:21:30', '2025-08-08 21:47:12', NULL),
(13, 'restaurant_1754689157484', '2025-02-12', 'All pies ordered well done, like god intended.', '2025-08-08 21:46:14', '2025-08-16 21:57:43', '[{\"text\":\"tests\",\"author\":\"\"}]'),
(14, 'restaurant_1754689926227', '2025-02-12', 'Naperville is huge and kind of sucks.', '2025-08-08 21:55:01', '2025-08-08 21:55:01', NULL),
(15, 'restaurant_1754690406359', '2025-07-22', 'Still unsure if this affiliated with the OG Villa Nova in Stickney', '2025-08-08 22:01:11', '2025-08-08 22:01:11', NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `restaurant_visit_summary`
-- (See below for the actual view)
--
CREATE TABLE `restaurant_visit_summary` (
`visit_id` int(11)
,`restaurant_id` varchar(50)
,`visit_date` date
,`notes` text
,`restaurant_name` varchar(200)
,`restaurant_location` varchar(200)
,`attendee_count` bigint(21)
,`average_rating` decimal(7,6)
);

-- --------------------------------------------------------

--
-- Table structure for table `social_links`
--

CREATE TABLE `social_links` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `description` text DEFAULT NULL,
  `icon_type` enum('default','custom','emoji') DEFAULT 'default',
  `icon_value` varchar(255) DEFAULT NULL,
  `custom_image_url` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `click_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `social_links`
--

INSERT INTO `social_links` (`id`, `title`, `url`, `description`, `icon_type`, `icon_value`, `custom_image_url`, `is_active`, `sort_order`, `click_count`, `created_at`, `updated_at`) VALUES
('link_sample_1', 'Pizza Club Website111', 'https://greaterchicagolandpizza.club/pizza/', 'Visit our main website', 'emoji', '?', NULL, 1, 0, 1, '2025-08-22 20:29:01', '2025-09-01 17:26:17'),
('link_sample_2', 'Restaurant Rankings', 'https://greaterchicagolandpizza.club/pizza/restaurants', 'See our pizza rankings', 'default', NULL, NULL, 1, 1, 0, '2025-08-22 20:29:01', '2025-08-22 20:29:01'),
('link_sample_3', 'Meet the Club', 'https://greaterchicagolandpizza.club/pizza/members', 'Meet our pizza experts', 'emoji', '?', NULL, 1, 2, 0, '2025-08-22 20:29:01', '2025-08-22 20:29:01'),
('link_sample_4', 'Upcoming Events', 'https://greaterchicagolandpizza.club/pizza/events', 'Join our next pizza crawl', 'emoji', '?', NULL, 1, 3, 0, '2025-08-22 20:29:01', '2025-08-22 20:29:01'),
('link_1756746693_0c0e488f', 'Google!', 'https://google.com', 'goods', 'default', NULL, NULL, 1, 4, 0, '2025-09-01 17:11:33', '2025-09-01 17:11:33');

-- --------------------------------------------------------

--
-- Table structure for table `visit_attendees`
--

CREATE TABLE `visit_attendees` (
  `visit_id` int(11) NOT NULL,
  `member_id` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visit_attendees`
--

INSERT INTO `visit_attendees` (`visit_id`, `member_id`, `created_at`) VALUES
(10, 'bob-gill', '2025-08-08 21:47:53'),
(10, 'chris-daum', '2025-08-08 21:47:53'),
(10, 'member_1754333140893', '2025-08-08 21:47:53'),
(10, 'member_1754351698812', '2025-08-08 21:47:53'),
(10, 'member_1754352274613', '2025-08-08 21:47:53'),
(10, 'member_1754352543043', '2025-08-08 21:47:53'),
(10, 'member_1754352689855', '2025-08-08 21:47:53'),
(11, 'bob-gill', '2025-08-08 21:48:46'),
(11, 'chris-daum', '2025-08-08 21:48:46'),
(11, 'member_1754333140893', '2025-08-08 21:48:46'),
(11, 'member_1754351698812', '2025-08-08 21:48:46'),
(11, 'member_1754352274613', '2025-08-08 21:48:46'),
(11, 'member_1754352689855', '2025-08-08 21:48:46'),
(12, 'bob-gill', '2025-08-08 21:47:12'),
(12, 'member_1754333140893', '2025-08-08 21:47:12'),
(12, 'member_1754351698812', '2025-08-08 21:47:12'),
(12, 'member_1754352274613', '2025-08-08 21:47:12'),
(12, 'member_1754352689855', '2025-08-08 21:47:12'),
(12, 'member_1754620299852', '2025-08-08 21:47:12'),
(13, 'bob-gill', '2025-09-01 23:15:05'),
(13, 'member_1754333140893', '2025-09-01 23:15:05'),
(13, 'member_1754351698812', '2025-09-01 23:15:05'),
(13, 'member_1754352274613', '2025-09-01 23:15:05'),
(13, 'member_1754352689855', '2025-09-01 23:15:05'),
(14, 'bob-gill', '2025-08-08 21:55:01'),
(14, 'member_1754333140893', '2025-08-08 21:55:01'),
(14, 'member_1754351698812', '2025-08-08 21:55:01'),
(14, 'member_1754352689855', '2025-08-08 21:55:01'),
(15, 'bob-gill', '2025-08-09 01:40:32'),
(15, 'chris-daum', '2025-08-09 01:40:32'),
(15, 'member_1754333140893', '2025-08-09 01:40:32'),
(15, 'member_1754351698812', '2025-08-09 01:40:32'),
(15, 'member_1754352274613', '2025-08-09 01:40:32'),
(15, 'member_1754352543043', '2025-08-09 01:40:32'),
(15, 'member_1754352689855', '2025-08-09 01:40:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key_hash` (`key_hash`),
  ADD KEY `idx_key_hash` (`key_hash`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event_date` (`event_date`);

--
-- Indexes for table `infographics`
--
ALTER TABLE `infographics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_restaurant_infographics` (`restaurant_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_visit_date` (`visit_date`);

--
-- Indexes for table `infographic_photos`
--
ALTER TABLE `infographic_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_infographic_photos` (`infographic_id`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `infographic_quotes`
--
ALTER TABLE `infographic_quotes`
  ADD PRIMARY KEY (`infographic_id`,`quote_id`),
  ADD KEY `quote_id` (`quote_id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_member_name` (`name`),
  ADD KEY `idx_member_display_order` (`display_order`);

--
-- Indexes for table `quotes`
--
ALTER TABLE `quotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_author` (`author`),
  ADD KEY `idx_restaurant_quotes` (`restaurant_id`),
  ADD KEY `idx_visit_quotes` (`visit_id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_visit_member_category` (`visit_id`,`member_id`,`category_id`,`pizza_order`),
  ADD KEY `idx_visit_ratings` (`visit_id`),
  ADD KEY `idx_member_ratings` (`member_id`),
  ADD KEY `idx_category_ratings` (`category_id`);

--
-- Indexes for table `rating_categories`
--
ALTER TABLE `rating_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_category_name` (`name`,`parent_category`),
  ADD KEY `idx_parent_category` (`parent_category`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant_name` (`name`),
  ADD KEY `idx_restaurant_location` (`location`),
  ADD KEY `idx_average_rating` (`average_rating`),
  ADD KEY `idx_restaurants_hero_image` (`hero_image`),
  ADD KEY `idx_restaurants_hero_zoom` (`hero_zoom`),
  ADD KEY `idx_restaurants_hero_pan` (`hero_pan_x`,`hero_pan_y`);

--
-- Indexes for table `restaurant_visits`
--
ALTER TABLE `restaurant_visits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_restaurant_date` (`restaurant_id`,`visit_date`),
  ADD KEY `idx_visit_date` (`visit_date`),
  ADD KEY `idx_restaurant_visits` (`restaurant_id`,`visit_date`);

--
-- Indexes for table `social_links`
--
ALTER TABLE `social_links`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_active_sort` (`is_active`,`sort_order`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- Indexes for table `visit_attendees`
--
ALTER TABLE `visit_attendees`
  ADD PRIMARY KEY (`visit_id`,`member_id`),
  ADD KEY `idx_member_visits` (`member_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `api_keys`
--
ALTER TABLE `api_keys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quotes`
--
ALTER TABLE `quotes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=220;

--
-- AUTO_INCREMENT for table `rating_categories`
--
ALTER TABLE `rating_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `restaurant_visits`
--
ALTER TABLE `restaurant_visits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

-- --------------------------------------------------------

--
-- Structure for view `member_statistics`
--
DROP TABLE IF EXISTS `member_statistics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `member_statistics`  AS SELECT `m`.`id` AS `id`, `m`.`name` AS `name`, count(distinct `va`.`visit_id`) AS `total_visits`, count(distinct `rv`.`restaurant_id`) AS `unique_restaurants`, avg(`r`.`rating`) AS `average_rating_given` FROM (((`members` `m` left join `visit_attendees` `va` on(`m`.`id` = `va`.`member_id`)) left join `restaurant_visits` `rv` on(`va`.`visit_id` = `rv`.`id`)) left join `ratings` `r` on(`r`.`member_id` = `m`.`id` and `r`.`visit_id` = `va`.`visit_id`)) GROUP BY `m`.`id` ;

-- --------------------------------------------------------

--
-- Structure for view `restaurant_visit_summary`
--
DROP TABLE IF EXISTS `restaurant_visit_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `restaurant_visit_summary`  AS SELECT `rv`.`id` AS `visit_id`, `rv`.`restaurant_id` AS `restaurant_id`, `rv`.`visit_date` AS `visit_date`, `rv`.`notes` AS `notes`, `r`.`name` AS `restaurant_name`, `r`.`location` AS `restaurant_location`, count(distinct `va`.`member_id`) AS `attendee_count`, avg(`rt`.`rating`) AS `average_rating` FROM (((`restaurant_visits` `rv` join `restaurants` `r` on(`rv`.`restaurant_id` = `r`.`id`)) left join `visit_attendees` `va` on(`rv`.`id` = `va`.`visit_id`)) left join `ratings` `rt` on(`rv`.`id` = `rt`.`visit_id`)) GROUP BY `rv`.`id` ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `infographics`
--
ALTER TABLE `infographics`
  ADD CONSTRAINT `infographics_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `infographics_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `members` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `infographic_photos`
--
ALTER TABLE `infographic_photos`
  ADD CONSTRAINT `infographic_photos_ibfk_1` FOREIGN KEY (`infographic_id`) REFERENCES `infographics` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `infographic_quotes`
--
ALTER TABLE `infographic_quotes`
  ADD CONSTRAINT `infographic_quotes_ibfk_1` FOREIGN KEY (`infographic_id`) REFERENCES `infographics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `infographic_quotes_ibfk_2` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quotes`
--
ALTER TABLE `quotes`
  ADD CONSTRAINT `quotes_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quotes_ibfk_2` FOREIGN KEY (`visit_id`) REFERENCES `restaurant_visits` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `restaurant_visits` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `rating_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `restaurant_visits`
--
ALTER TABLE `restaurant_visits`
  ADD CONSTRAINT `restaurant_visits_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `visit_attendees`
--
ALTER TABLE `visit_attendees`
  ADD CONSTRAINT `visit_attendees_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `restaurant_visits` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `visit_attendees_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
