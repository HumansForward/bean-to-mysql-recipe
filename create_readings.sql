-- ----------------------------
--  Table structure for `readings`
-- ----------------------------
DROP TABLE IF EXISTS `readings`;
CREATE TABLE `readings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `celsius` int(11) NOT NULL,
  `accell_x` float NOT NULL,
  `accell_y` float NOT NULL,
  `accell_z` float NOT NULL,
  `captured_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
);
