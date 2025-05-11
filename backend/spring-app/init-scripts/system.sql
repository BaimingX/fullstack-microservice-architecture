/*
 Navicat Premium Dump SQL

 Source Server         : db
 Source Server Type    : MySQL
 Source Server Version : 80037 (8.0.37)
 Source Host           : localhost:3306
 Source Schema         : system

 Target Server Type    : MySQL
 Target Server Version : 80037 (8.0.37)
 File Encoding         : 65001

 Date: 11/04/2025 04:20:59
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for carousel
-- ----------------------------
DROP TABLE IF EXISTS `carousel`;
CREATE TABLE `carousel`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `goods_id` int NULL DEFAULT NULL COMMENT '商品ID',
  `img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '推荐图片',
  `site_id` int NOT NULL,
  `media_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '轮播图信息' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of carousel
-- ----------------------------
INSERT INTO `carousel` VALUES (6, 29, 'http://localhost:9090/files/download/1742075993838-images.png', 5, NULL);
INSERT INTO `carousel` VALUES (14, 28, 'http://localhost:9090/files/download/28/1742406959266-c029181b9d45a23cde9dc8a216bc64e4c09f214b.f30_hls/index.m3u8', 1, 'video');
INSERT INTO `carousel` VALUES (15, 28, 'http://localhost:9090/files/download/28/1742312346693-1740244251421wy8ynrpk-removebg.png', 1, 'image');
INSERT INTO `carousel` VALUES (16, 30, 'http://localhost:9090/files/download/30/1742573999102-88bbe02b43386e36d5e3a7e49ba71e26f131077c.f30_hls/index.m3u8', 1, 'video');
INSERT INTO `carousel` VALUES (19, 30, 'http://localhost:9090/files/download/30/1742573995046-9bd5084bae6b70c2de50892ce52112df.png', 1, 'image');
INSERT INTO `carousel` VALUES (20, 31, 'http://localhost:9090/files/download/31/1742580856586-37aec4a9-1a37-49aa-bb70-48b2151362da.png', 1, 'image');
INSERT INTO `carousel` VALUES (21, 31, 'http://localhost:9090/files/download/31/1742580871837-c4c005042e7ae411e209e946cf4c1c8fc36330ba.f30_hls/index.m3u8', 1, 'video');
INSERT INTO `carousel` VALUES (22, 38, 'http://localhost:9090/files/download/38/1742584115320-0b46403c-1614-483b-91de-d54a0c3350bb.png', 1, 'image');
INSERT INTO `carousel` VALUES (23, 38, 'http://localhost:9090/files/download/38/1742584097956-c50ee9292c8f70f0bcde5730fb2d7cb2650ba11d.f30_hls/index.m3u8', 1, 'video');
INSERT INTO `carousel` VALUES (24, 32, 'http://localhost:9090/files/download/32/1742584149568-8489eb25-6f83-48d2-b6fe-37197e02c353.png', 1, 'image');
INSERT INTO `carousel` VALUES (25, 32, 'http://localhost:9090/files/download/32/1742584160360-8d8274f915fc84164f9ad8a77f123e0a2998cfac.f30_hls/index.m3u8', 1, 'video');

-- ----------------------------
-- Table structure for category
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '分类名称',
  `site_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商品分类' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of category
-- ----------------------------
INSERT INTO `category` VALUES (1, 'Toys', 1);
INSERT INTO `category` VALUES (4, '22222222333', 5);
INSERT INTO `category` VALUES (5, 'AiToy', 1);
INSERT INTO `category` VALUES (6, 'CoolStuff', 1);

-- ----------------------------
-- Table structure for cool_stuff_user
-- ----------------------------
DROP TABLE IF EXISTS `cool_stuff_user`;
CREATE TABLE `cool_stuff_user`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码（哈希后）',
  `google_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Google账户唯一ID',
  `login_type` tinyint(1) NULL DEFAULT 0 COMMENT '登陆类型：0=本地,1=Google,...',
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户昵称/展示名',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像地址',
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态：1=启用, 0=禁用等',
  `address_line1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '地址第一行',
  `address_line2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '地址第二行',
  `suburb` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '区/社区/区域',
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '州/省',
  `postal_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮政编码',
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '国家/地区',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_email`(`email` ASC) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `uk_google_id`(`google_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1016 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '前端用户表 (支持Google登录)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cool_stuff_user
-- ----------------------------
INSERT INTO `cool_stuff_user` VALUES (1013, 'BM X_4958cdab', 'e1785341327db3cd5a50b99831e32a47', '110518806543273618482', 0, NULL, NULL, '0452510625', 'baiming604108635@gmail.com', 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia', '2025-03-30 02:16:10', '2025-04-04 01:18:36');
INSERT INTO `cool_stuff_user` VALUES (1015, 'xbm604108635@163.com', '502f5e88708f78ffe2bcb323e48d2144', NULL, 0, NULL, NULL, '0452510625', 'xbm604108635@163.com', 1, '4 Lithgow Avenue', 'Unit 6', 'Blackburn', 'VIC', '3130', '澳大利亚', '2025-03-30 05:11:22', '2025-03-30 21:42:41');

-- ----------------------------
-- Table structure for dict
-- ----------------------------
DROP TABLE IF EXISTS `dict`;
CREATE TABLE `dict`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Name',
  `value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Value',
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Type',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 88 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Dictionary Table' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of dict
-- ----------------------------
INSERT INTO `dict` VALUES (1, 'Menu', 'Menu', 'icon');
INSERT INTO `dict` VALUES (2, 'User', 'User', 'icon');
INSERT INTO `dict` VALUES (3, 'Message', 'Message', 'icon');
INSERT INTO `dict` VALUES (4, '\r\nHomeFilled', 'HomeFilled', 'icon');
INSERT INTO `dict` VALUES (5, 'Memo', 'Memo', 'icon');
INSERT INTO `dict` VALUES (6, 'Add', 'Add', 'icon');
INSERT INTO `dict` VALUES (7, 'Edit', 'Edit', 'icon');
INSERT INTO `dict` VALUES (8, 'Delete', 'Delete', 'icon');
INSERT INTO `dict` VALUES (9, 'Remove', 'Remove', 'icon');
INSERT INTO `dict` VALUES (10, 'Search', 'Search', 'icon');
INSERT INTO `dict` VALUES (11, 'Check', 'Check', 'icon');
INSERT INTO `dict` VALUES (12, 'Close', 'Close', 'icon');
INSERT INTO `dict` VALUES (13, 'MoreFilled', 'MoreFilled', 'icon');
INSERT INTO `dict` VALUES (14, 'Refresh', 'Refresh', 'icon');
INSERT INTO `dict` VALUES (15, 'Setting', 'Setting', 'icon');
INSERT INTO `dict` VALUES (16, 'Star', 'Star', 'icon');
INSERT INTO `dict` VALUES (17, 'StarFilled', 'StarFilled', 'icon');
INSERT INTO `dict` VALUES (18, 'ArrowUp', 'ArrowUp', 'icon');
INSERT INTO `dict` VALUES (19, 'ArrowDown', 'ArrowDown', 'icon');
INSERT INTO `dict` VALUES (20, 'ArrowLeft', 'ArrowLeft', 'icon');
INSERT INTO `dict` VALUES (21, 'ArrowRight', 'ArrowRight', 'icon');
INSERT INTO `dict` VALUES (22, 'Back', 'Back', 'icon');
INSERT INTO `dict` VALUES (23, 'Top', 'Top', 'icon');
INSERT INTO `dict` VALUES (24, 'Bottom', 'Bottom', 'icon');
INSERT INTO `dict` VALUES (25, 'Document', 'Document', 'icon');
INSERT INTO `dict` VALUES (26, 'Folder', 'Folder', 'icon');
INSERT INTO `dict` VALUES (27, 'FolderOpened', 'FolderOpened', 'icon');
INSERT INTO `dict` VALUES (28, 'Files', 'Files', 'icon');
INSERT INTO `dict` VALUES (29, 'Upload', 'Upload', 'icon');
INSERT INTO `dict` VALUES (30, 'Download', 'Download', 'icon');
INSERT INTO `dict` VALUES (31, 'Picture', 'Picture', 'icon');
INSERT INTO `dict` VALUES (32, 'Film', 'Film', 'icon');
INSERT INTO `dict` VALUES (33, 'ShoppingCart', 'ShoppingCart', 'icon');
INSERT INTO `dict` VALUES (34, 'ShoppingBag', 'ShoppingBag', 'icon');
INSERT INTO `dict` VALUES (35, 'Goods', 'Goods', 'icon');
INSERT INTO `dict` VALUES (36, 'Sell', 'Sell', 'icon');
INSERT INTO `dict` VALUES (37, 'Money', 'Money', 'icon');
INSERT INTO `dict` VALUES (38, 'CreditCard', 'CreditCard', 'icon');
INSERT INTO `dict` VALUES (39, 'Wallet', 'Wallet', 'icon');
INSERT INTO `dict` VALUES (40, 'PriceTag', 'PriceTag', 'icon');
INSERT INTO `dict` VALUES (41, 'Message', 'Message', 'icon');
INSERT INTO `dict` VALUES (42, 'ChatDotRound', 'ChatDotRound', 'icon');
INSERT INTO `dict` VALUES (43, 'Bell', 'Bell', 'icon');
INSERT INTO `dict` VALUES (44, 'Email', 'Email', 'icon');
INSERT INTO `dict` VALUES (45, 'Phone', 'Phone', 'icon');
INSERT INTO `dict` VALUES (46, 'VideoCamera', 'VideoCamera', 'icon');
INSERT INTO `dict` VALUES (47, 'Comment', 'Comment', 'icon');
INSERT INTO `dict` VALUES (48, 'User', 'User', 'icon');
INSERT INTO `dict` VALUES (49, 'UserFilled', 'UserFilled', 'icon');
INSERT INTO `dict` VALUES (50, 'Avatar', 'Avatar', 'icon');
INSERT INTO `dict` VALUES (51, 'Lock', 'Lock', 'icon');
INSERT INTO `dict` VALUES (52, 'Unlock', 'Unlock', 'icon');
INSERT INTO `dict` VALUES (53, 'Key', 'Key', 'icon');
INSERT INTO `dict` VALUES (54, 'Help', 'Help', 'icon');
INSERT INTO `dict` VALUES (55, 'DataLine', 'DataLine', 'icon');
INSERT INTO `dict` VALUES (56, 'DataAnalysis', 'DataAnalysis', 'icon');
INSERT INTO `dict` VALUES (57, 'PieChart', 'PieChart', 'icon');
INSERT INTO `dict` VALUES (58, 'TrendCharts', 'TrendCharts', 'icon');
INSERT INTO `dict` VALUES (59, 'Histogram', 'Histogram', 'icon');
INSERT INTO `dict` VALUES (60, 'Calculator', 'Calculator', 'icon');
INSERT INTO `dict` VALUES (61, 'Odometer', 'Odometer', 'icon');
INSERT INTO `dict` VALUES (62, 'Monitor', 'Monitor', 'icon');
INSERT INTO `dict` VALUES (63, 'Operation', 'Operation', 'icon');
INSERT INTO `dict` VALUES (64, 'Location', 'Location', 'icon');
INSERT INTO `dict` VALUES (65, 'Calendar', 'Calendar', 'icon');
INSERT INTO `dict` VALUES (66, 'Clock', 'Clock', 'icon');
INSERT INTO `dict` VALUES (67, 'Timer', 'Timer', 'icon');
INSERT INTO `dict` VALUES (68, 'Warning', 'Warning', 'icon');
INSERT INTO `dict` VALUES (69, 'Info', 'Info', 'icon');
INSERT INTO `dict` VALUES (70, 'Success', 'Success', 'icon');
INSERT INTO `dict` VALUES (71, 'CircleCheck', 'CircleCheck', 'icon');
INSERT INTO `dict` VALUES (72, 'CircleClose', 'CircleClose', 'icon');
INSERT INTO `dict` VALUES (73, 'Link', 'Link', 'icon');
INSERT INTO `dict` VALUES (74, 'Share', 'Share', 'icon');
INSERT INTO `dict` VALUES (75, 'Collection', 'Collection', 'icon');
INSERT INTO `dict` VALUES (76, 'Guide', 'Guide', 'icon');
INSERT INTO `dict` VALUES (77, 'Notification', 'Notification', 'icon');
INSERT INTO `dict` VALUES (78, 'Promotion', 'Promotion', 'icon');
INSERT INTO `dict` VALUES (79, 'Flag', 'Flag', 'icon');
INSERT INTO `dict` VALUES (80, 'Compass', 'Compass', 'icon');
INSERT INTO `dict` VALUES (81, 'Sugar', 'Sugar', 'icon');
INSERT INTO `dict` VALUES (82, 'Briefcase', 'Briefcase', 'icon');
INSERT INTO `dict` VALUES (83, 'Discount', 'Discount', 'icon');
INSERT INTO `dict` VALUES (84, 'Grid', 'Grid', 'icon');
INSERT INTO `dict` VALUES (85, 'View', 'View', 'icon');
INSERT INTO `dict` VALUES (86, 'Hide', 'Hide', 'icon');
INSERT INTO `dict` VALUES (87, 'FullScreen', 'FullScreen', 'icon');

-- ----------------------------
-- Table structure for goods
-- ----------------------------
DROP TABLE IF EXISTS `goods`;
CREATE TABLE `goods`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '商品名称',
  `origin_price` decimal(10, 2) NULL DEFAULT NULL COMMENT '原价',
  `has_discount` tinyint(1) NULL DEFAULT 0 COMMENT '是否折扣',
  `discount_price` decimal(10, 2) NULL DEFAULT NULL COMMENT '折扣价',
  `has_flash` tinyint(1) NULL DEFAULT 0 COMMENT '是否秒杀',
  `flash_price` decimal(10, 2) NULL DEFAULT NULL COMMENT '秒杀价',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '商品详情',
  `img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '商品图片',
  `category_id` int NULL DEFAULT NULL COMMENT '分类ID',
  `date` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '上架日期',
  `store` int NULL DEFAULT NULL COMMENT '库存',
  `flash_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '秒杀截止时间',
  `flash_num` int NULL DEFAULT NULL COMMENT '秒杀名额',
  `site_id` int NOT NULL,
  `url` varchar(2083) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'url',
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '种类',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 45 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商品信息' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of goods
-- ----------------------------
INSERT INTO `goods` VALUES (27, 'Test', 99.00, 1, 66.00, 1, 55.00, NULL, 'http://localhost:9090/files/download/1742651404573-90e6ca40-8280-4088-8b10-4368f9901956.png', 6, NULL, 99, '2025-03-20 00:00:00', 3, 1, NULL, NULL);
INSERT INTO `goods` VALUES (28, 'testss', 5555.00, 1, 111.00, 1, 20.00, '<p><img src=\"http://localhost:9090/files/download/28/1742312346693-1740244251421wy8ynrpk-removebg.png\" alt=\"\" data-href=\"\" style=\"width: 501.00px;height: 501.00px;\"/></p><p><br></p>', 'http://localhost:9090/files/download/1742648106717-49c0fa16-05a3-4a69-bbe3-650e8a25c5f7.png', 5, '2025-03-15', 1, '2025-03-27 00:00:00', 22, 1, NULL, NULL);
INSERT INTO `goods` VALUES (29, 'Good_test', 222.00, 1, 111.00, 1, 232.00, '', '', 4, '2025-03-16', 33, '2025-03-21 00:00:00', 3213, 5, NULL, NULL);
INSERT INTO `goods` VALUES (30, 'Acrylic LED-Illuminated Samurai Sword Replica, Cool And Handsome Cyberpunk Katana with Light-Up Feature for Cosplay, Party Decoration, and Photography Props', 63.30, 0, NULL, 1, 45.60, '<p><br></p>', 'http://localhost:9090/files/download/1742651369791-9bd5084bae6b70c2de50892ce52112df.png', 1, '2025-03-22', 99, '2025-03-31 00:00:00', 3, 1, 'https://www.temu.com/au-zh-Hans/cyberpunk-led--toy-80cm-31-49inch-acrylic-blade--halloween-costume-prop-party-decor-photography-prop-g-601099625184641.html?_oak_name_id=1422943448038642505&_oak_mp_inf=EIH7iM2m1ogBGhZnb29kc19vem1neGJfcmVjb21tZW5kIJi34svbMg%3D%3D&top_gallery_url=https%3A%2F%2Fimg.kwcdn.com%2Fproduct%2Ffancy%2Fe2744175-e6e0-4fc6-88e4-c8b1ef4b6d78.jpg&spec_gallery_id=2319078359&refer_page_sn=10032&refer_source=10016&freesia_scene=11&_oak_freesia_scene=11&_oak_rec_ext_1=MzQ0NA&_oak_gallery_order=93981348%2C1616790216%2C1193860649&refer_page_el_sn=200444&_x_channel_src=1&_x_channel_scene=spike&_x_vst_scene=adg&_x_ads_sub_channel=search&_x_ads_channel=google&_x_login_type=Google&_x_ads_account=1213016319&_x_ads_set=19710966637&_x_ads_id=149204135267&_x_ads_creative_id=648629324784&_x_ns_source=g&_x_ns_gclid=Cj0KCQjw8qmhBhClARIsANAtbof17Cc8fbTDGj3Owtwe3sdtnlqMfGkAmzI590Hy96Ig09g82vRPmkQaAs0HEALw_wcB&_x_ns_placement=&_x_ns_match_type=e&_x_ns_ad_position=&_x_ns_product_id=&_x_ns_target=&_x_ns_devicemodel=&_x_ns_wbraid=CjkKCQjw8qmhBhDfARIoAJIH7tyfzYxEwotBJYxvl_9kxs_D6ODAfDHc4smTFW_43Px_kh9OxhoC6LE&_x_ns_gbraid=0AAAAAo4mICEiPZuDgRRigGBLH5dYaQBPM&_x_ns_keyword=temu&_x_ns_targetid=kwd-4583699489&_x_sessn_id=iywni88t2a&refer_page_name=goods&refer_page_id=10032_1742573487691_sgkzduz6xu', NULL);
INSERT INTO `goods` VALUES (31, 'Stainless Steel Butterfly Folding Comb - Durable Fine Tooth Design for All Hair Types, Perfect for Handstands and Beginners, Fish Pattern Handle, Portable and Easy to Carry', 35.80, 0, 15.00, 1, 28.60, NULL, 'http://localhost:9090/files/download/1742651353150-93ec240f-8b21-4d55-aac7-c0e584aabaee.png', 1, '2025-03-22', 99, '2025-03-31 00:00:00', 10, 1, 'https://www.temu.com/au/1pc-stainless-steel-folding-hair-comb-metal-handle-fish-pattern-butterfly-pocket-comb--fine-tooth--hair-types-ideal-for--and-beginners-g-601099760248531.html?_oak_mp_inf=ENPNvI2n1ogBGhZmbGFzaF9zYWxlX2xpc3RfbjRreWNiINCgms%2FbMg%3D%3D&top_gallery_url=https%3A%2F%2Fimg.kwcdn.com%2Fproduct%2Ffancy%2Fb96815b2-938b-4e82-a054-7044df9d275a.jpg&spec_gallery_id=2819742595&refer_page_sn=10132&refer_source=0&freesia_scene=116&_oak_freesia_scene=116&_oak_rec_ext_1=NjEz&refer_page_el_sn=201401&_x_channel_src=1&_x_channel_scene=spike&_x_vst_scene=adg&_x_ads_sub_channel=search&_x_ads_channel=google&_x_login_type=Google&_x_ads_account=1213016319&_x_ads_set=19710966637&_x_ads_id=149204135267&_x_ads_creative_id=648629324784&_x_ns_source=g&_x_ns_gclid=Cj0KCQjw8qmhBhClARIsANAtbof17Cc8fbTDGj3Owtwe3sdtnlqMfGkAmzI590Hy96Ig09g82vRPmkQaAs0HEALw_wcB&_x_ns_placement=&_x_ns_match_type=e&_x_ns_ad_position=&_x_ns_product_id=&_x_ns_target=&_x_ns_devicemodel=&_x_ns_wbraid=CjkKCQjw8qmhBhDfARIoAJIH7tyfzYxEwotBJYxvl_9kxs_D6ODAfDHc4smTFW_43Px_kh9OxhoC6LE&_x_ns_gbraid=0AAAAAo4mICEiPZuDgRRigGBLH5dYaQBPM&_x_ns_keyword=temu&_x_ns_targetid=kwd-4583699489&_x_sessn_id=iywni88t2a&refer_page_name=lightning-deals&refer_page_id=10132_1742580643633_4tcj38h928', NULL);
INSERT INTO `goods` VALUES (32, 'Fully Automatic Large-Capacity Water Gun with Light Effect, 465Cc+60Cc Luxury Model, Summer Outdoor Toys, Children\'S Sprinklers, Interactive Toys Suitable for Holiday Gifts for Children', 39.99, 0, NULL, 0, NULL, NULL, 'http://localhost:9090/files/download/1742651337537-49c0fa16-05a3-4a69-bbe3-650e8a25c5f7.png', 1, '2025-03-22', 4, NULL, NULL, 1, 'https://www.temu.com/au/fully-automatic-large-capacity-water-gun-with-light-effect-465cc-60cc-luxury--outdoor-toys-childrens-sprinklers-interactive-toys-suitable-for-holiday-gifts-for-children-g-601099917695856.html?_oak_mp_inf=EPC2xtin1ogBGiAxZDVkNjA3ZDYzNGI0NDI3YTFlODMyMTYwYjgzNzc1OSC%2BmbPQ2zI%3D&top_gallery_url=https%3A%2F%2Fimg.kwcdn.com%2Fproduct%2Ffancy%2F8489eb25-6f83-48d2-b6fe-37197e02c353.jpg&spec_gallery_id=3404813859&refer_page_sn=10009&refer_source=0&freesia_scene=2&_oak_freesia_scene=2&_oak_rec_ext_1=Mjc5NQ&_oak_gallery_order=2099912462%2C1031987941%2C838382014&search_key=%E6%B0%B4%E6%9E%AA&refer_page_el_sn=200049&_x_channel_src=1&_x_channel_scene=spike&_x_vst_scene=adg&_x_ads_sub_channel=search&_x_ads_channel=google&_x_login_type=Google&_x_ads_account=1213016319&_x_ads_set=19710966637&_x_ads_id=149204135267&_x_ads_creative_id=648629324784&_x_ns_source=g&_x_ns_gclid=Cj0KCQjw8qmhBhClARIsANAtbof17Cc8fbTDGj3Owtwe3sdtnlqMfGkAmzI590Hy96Ig09g82vRPmkQaAs0HEALw_wcB&_x_ns_placement=&_x_ns_match_type=e&_x_ns_ad_position=&_x_ns_product_id=&_x_ns_target=&_x_ns_devicemodel=&_x_ns_wbraid=CjkKCQjw8qmhBhDfARIoAJIH7tyfzYxEwotBJYxvl_9kxs_D6ODAfDHc4smTFW_43Px_kh9OxhoC6LE&_x_ns_gbraid=0AAAAAo4mICEiPZuDgRRigGBLH5dYaQBPM&_x_ns_keyword=temu&_x_ns_targetid=kwd-4583699489&_x_sessn_id=iywni88t2a&refer_page_name=search_result&refer_page_id=10009_1742583149463_8x88cpq1h9', NULL);
INSERT INTO `goods` VALUES (38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 59.99, 1, 30.00, 1, 50.00, '<p><img src=\"http://localhost:9090/files/download/38/1742584115320-0b46403c-1614-483b-91de-d54a0c3350bb.png\" alt=\"\" data-href=\"\" style=\"\"/><img src=\"http://localhost:9090/files/download/38/1742584093546-0a0f6ebf-ae8e-4b0f-9ee4-a07a0e197c35.png\" alt=\"\" data-href=\"\" style=\"\"/><img src=\"http://localhost:9090/files/download/38/1742584118807-4debe9ea-5bbb-4b92-8ad8-dce2d6ed4234.png\" alt=\"\" data-href=\"\" style=\"\"/><img src=\"http://localhost:9090/files/download/38/1742584124081-c94c2a27-db7c-4d74-b857-4aa5d3736006.png\" alt=\"\" data-href=\"\" style=\"\"/></p>', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 1, '2025-03-22', 4, '2025-03-27 00:00:00', 20, 1, '', 'Blue;White');
INSERT INTO `goods` VALUES (39, 'test', 44.00, 0, NULL, 0, NULL, NULL, 'http://localhost:9090/files/download/1742693436597-c78949617a8379dd55ce140f4fe8c24e.png', 1, '2025-03-23', 22, NULL, NULL, 1, '', NULL);
INSERT INTO `goods` VALUES (40, '442231', 333.00, 0, NULL, 0, NULL, NULL, 'http://localhost:9090/files/download/1742693455126-90e6ca40-8280-4088-8b10-4368f9901956.png', 1, '2025-03-23', 22, NULL, NULL, 1, '', NULL);
INSERT INTO `goods` VALUES (41, '442323', 333.00, 1, 222.00, 0, NULL, NULL, 'http://localhost:9090/files/download/1742693473385-0a0f6ebf-ae8e-4b0f-9ee4-a07a0e197c35.png', 1, '2025-03-23', 222, NULL, NULL, 1, '', NULL);
INSERT INTO `goods` VALUES (42, '3323', 41.10, 0, NULL, 1, 32.90, NULL, 'http://localhost:9090/files/download/1742693490809-4debe9ea-5bbb-4b92-8ad8-dce2d6ed4234.png', 5, '2025-03-23', 22, '2025-04-09 00:00:00', 10, 1, '', NULL);
INSERT INTO `goods` VALUES (43, '32323', 1082.93, 0, NULL, 1, 70.05, NULL, 'http://localhost:9090/files/download/1742722715013-c94c2a27-db7c-4d74-b857-4aa5d3736006.png', 6, '2025-03-23', 22, '2025-04-10 00:00:00', 11, 1, '', NULL);
INSERT INTO `goods` VALUES (44, '20KM/H High-Speed 1:16 Small Off-road Remote Control Car - 2.4G Drifting Anti-collision Rubber Big Tires - Perfect Christmas, Halloween, Thanksgiving Gift', 88.10, 0, 41.40, 1, 41.40, '<p><img src=\"http://localhost:9090/files/download/44/1743144093779-270a79d6-dd0b-40d3-a154-c84a1928270d.webp\" alt=\"\" data-href=\"\" style=\"\"/><img src=\"http://localhost:9090/files/download/44/1743144093779-6202eb09-a750-4322-a747-cdf082dde73c.webp\" alt=\"\" data-href=\"\" style=\"\"/><img src=\"http://localhost:9090/files/download/44/1743144093779-373e4d3c-ff2a-49ff-bb73-4d91b4e872b6%20(1).webp\" alt=\"\" data-href=\"\" style=\"\"/><img src=\"http://localhost:9090/files/download/44/1743144093780-8a769f78-3394-4399-8950-50208d8bbf8e.webp\" alt=\"\" data-href=\"\" style=\"\"/><img src=\"http://localhost:9090/files/download/44/1743144093779-b9379c45-1706-45d8-a445-ad582f6813c5.webp\" alt=\"\" data-href=\"\" style=\"\"/><img src=\"http://localhost:9090/files/download/44/1743144093779-25785d8f-474f-4bea-aa8f-1483096503f9.webp\" alt=\"\" data-href=\"\" style=\"\"/></p>', 'http://localhost:9090/files/download/1743143283985-8a769f78-3394-4399-8950-50208d8bbf8e.webp', 1, '2025-03-28', 99, '2025-04-10 06:32:07', 10, 1, 'https://www.temu.com/au-zh-Hans/1-16-small-high-speed-off-road-2-4g-remote-control-car-drifting-20km-h-to--to--road-sections-anti-collision-settings-rubber--christmas-halloween-gift-g-601099570555125.html?_oak_name_id=658909108117596256&_oak_mp_inf=EPXRgrOm1ogBGiA0MjA0YzkxYTU4Njk0ZmRjYTkyNjVmYjM5NTExMzQzZiCj7qnb3TI%3D&top_gallery_url=https%3A%2F%2Fimg.kwcdn.com%2Fproduct%2Ffancy%2F8a769f78-3394-4399-8950-50208d8bbf8e.jpg&spec_gallery_id=2292147800&refer_page_sn=10032&refer_source=0&freesia_scene=2&_oak_freesia_scene=2&_oak_rec_ext_1=Mjg3MQ&_oak_gallery_order=1457874629%2C1799406205%2C1805008098&search_key=%E9%81%A5%E6%8E%A7%E8%BD%A6&refer_page_el_sn=200049&_x_sessn_id=s0vp5hoafy&refer_page_name=goods&refer_page_id=10032_1743143106151_42h98b0796', 'Black;Blue;Orange');

-- ----------------------------
-- Table structure for goods_media
-- ----------------------------
DROP TABLE IF EXISTS `goods_media`;
CREATE TABLE `goods_media`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `goods_id` int NULL DEFAULT NULL COMMENT '关联的商品ID',
  `media_type` enum('image','video') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '媒体类型（图片或视频）',
  `url` varchar(2083) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '媒体URL',
  `thumbnail_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '视频封面缩略图（如果是视频）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_goods_id`(`goods_id` ASC) USING BTREE,
  CONSTRAINT `fk_goods_id` FOREIGN KEY (`goods_id`) REFERENCES `goods` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 46 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商品媒体信息' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of goods_media
-- ----------------------------
INSERT INTO `goods_media` VALUES (8, 28, 'image', 'http://localhost:9090/files/download/28/1742312346693-1740244251421wy8ynrpk-removebg.png', NULL);
INSERT INTO `goods_media` VALUES (10, 28, 'video', 'http://localhost:9090/files/download/28/1742406959266-c029181b9d45a23cde9dc8a216bc64e4c09f214b.f30_hls/index.m3u8', NULL);
INSERT INTO `goods_media` VALUES (11, 27, 'video', 'http://localhost:9090/files/download/27/1742451810307-c029181b9d45a23cde9dc8a216bc64e4c09f214b.f30_hls/index.m3u8', NULL);
INSERT INTO `goods_media` VALUES (12, 27, 'image', 'http://localhost:9090/files/download/27/1742451817808-1740244251421wy8ynrpk2-removebg.png', NULL);
INSERT INTO `goods_media` VALUES (13, 30, 'image', 'http://localhost:9090/files/download/30/1742573976344-90e6ca40-8280-4088-8b10-4368f9901956.png', NULL);
INSERT INTO `goods_media` VALUES (14, 30, 'image', 'http://localhost:9090/files/download/30/1742573981109-b9694550-51b3-4c08-ba91-0ad38268d0de.png', NULL);
INSERT INTO `goods_media` VALUES (15, 30, 'image', 'http://localhost:9090/files/download/30/1742573986934-c78949617a8379dd55ce140f4fe8c24e.png', NULL);
INSERT INTO `goods_media` VALUES (16, 30, 'image', 'http://localhost:9090/files/download/30/1742573990364-ce26ca99bc57ca42e4307a305cd12407.png', NULL);
INSERT INTO `goods_media` VALUES (17, 30, 'image', 'http://localhost:9090/files/download/30/1742573995046-9bd5084bae6b70c2de50892ce52112df.png', NULL);
INSERT INTO `goods_media` VALUES (18, 30, 'video', 'http://localhost:9090/files/download/30/1742573999102-88bbe02b43386e36d5e3a7e49ba71e26f131077c.f30_hls/index.m3u8', NULL);
INSERT INTO `goods_media` VALUES (19, 31, 'image', 'http://localhost:9090/files/download/31/1742580852334-11f796b3-ba79-44c2-95bc-259be5162939.png', NULL);
INSERT INTO `goods_media` VALUES (20, 31, 'image', 'http://localhost:9090/files/download/31/1742580856586-37aec4a9-1a37-49aa-bb70-48b2151362da.png', NULL);
INSERT INTO `goods_media` VALUES (21, 31, 'image', 'http://localhost:9090/files/download/31/1742580859988-93ec240f-8b21-4d55-aac7-c0e584aabaee.png', NULL);
INSERT INTO `goods_media` VALUES (22, 31, 'image', 'http://localhost:9090/files/download/31/1742580864205-4877beaf-ac12-49c7-90f4-f1aeb349b52a.png', NULL);
INSERT INTO `goods_media` VALUES (23, 31, 'image', 'http://localhost:9090/files/download/31/1742580868407-b7fa05dc-a07b-403e-aba9-a65536bc4218.png', NULL);
INSERT INTO `goods_media` VALUES (24, 31, 'video', 'http://localhost:9090/files/download/31/1742580871837-c4c005042e7ae411e209e946cf4c1c8fc36330ba.f30_hls/index.m3u8', NULL);
INSERT INTO `goods_media` VALUES (25, 38, 'image', 'http://localhost:9090/files/download/38/1742584093546-0a0f6ebf-ae8e-4b0f-9ee4-a07a0e197c35.png', NULL);
INSERT INTO `goods_media` VALUES (26, 38, 'video', 'http://localhost:9090/files/download/38/1742584097956-c50ee9292c8f70f0bcde5730fb2d7cb2650ba11d.f30_hls/index.m3u8', NULL);
INSERT INTO `goods_media` VALUES (27, 38, 'image', 'http://localhost:9090/files/download/38/1742584115320-0b46403c-1614-483b-91de-d54a0c3350bb.png', NULL);
INSERT INTO `goods_media` VALUES (28, 38, 'image', 'http://localhost:9090/files/download/38/1742584118807-4debe9ea-5bbb-4b92-8ad8-dce2d6ed4234.png', NULL);
INSERT INTO `goods_media` VALUES (29, 38, 'image', 'http://localhost:9090/files/download/38/1742584124081-c94c2a27-db7c-4d74-b857-4aa5d3736006.png', NULL);
INSERT INTO `goods_media` VALUES (30, 32, 'image', 'http://localhost:9090/files/download/32/1742584142500-49c0fa16-05a3-4a69-bbe3-650e8a25c5f7.png', NULL);
INSERT INTO `goods_media` VALUES (31, 32, 'image', 'http://localhost:9090/files/download/32/1742584146119-3798cc4a-cda1-4801-8086-6b72e9c61832.png', NULL);
INSERT INTO `goods_media` VALUES (32, 32, 'image', 'http://localhost:9090/files/download/32/1742584149568-8489eb25-6f83-48d2-b6fe-37197e02c353.png', NULL);
INSERT INTO `goods_media` VALUES (33, 32, 'image', 'http://localhost:9090/files/download/32/1742584153440-a26d6606-a110-4e33-a5fa-6c94a2a78748.png', NULL);
INSERT INTO `goods_media` VALUES (34, 32, 'image', 'http://localhost:9090/files/download/32/1742584156667-bb2098b2-0fe3-4a2f-bee3-059d49b95368.png', NULL);
INSERT INTO `goods_media` VALUES (35, 32, 'video', 'http://localhost:9090/files/download/32/1742584160360-8d8274f915fc84164f9ad8a77f123e0a2998cfac.f30_hls/index.m3u8', NULL);
INSERT INTO `goods_media` VALUES (36, 42, 'video', 'http://localhost:9090/files/download/42/1743078539318-c50ee9292c8f70f0bcde5730fb2d7cb2650ba11d.f30_hls/index.m3u8', NULL);
INSERT INTO `goods_media` VALUES (37, 41, 'video', 'http://localhost:9090/files/download/41/1743079515304-c50ee9292c8f70f0bcde5730fb2d7cb2650ba11d.f30_hls/index.m3u8', NULL);
INSERT INTO `goods_media` VALUES (38, 44, 'image', 'http://localhost:9090/files/download/44/1743144093779-270a79d6-dd0b-40d3-a154-c84a1928270d.webp', NULL);
INSERT INTO `goods_media` VALUES (39, 44, 'image', 'http://localhost:9090/files/download/44/1743144093780-8a769f78-3394-4399-8950-50208d8bbf8e.webp', NULL);
INSERT INTO `goods_media` VALUES (40, 44, 'image', 'http://localhost:9090/files/download/44/1743144093779-25785d8f-474f-4bea-aa8f-1483096503f9.webp', NULL);
INSERT INTO `goods_media` VALUES (41, 44, 'image', 'http://localhost:9090/files/download/44/1743144093779-6202eb09-a750-4322-a747-cdf082dde73c.webp', NULL);
INSERT INTO `goods_media` VALUES (42, 44, 'image', 'http://localhost:9090/files/download/44/1743144093779-373e4d3c-ff2a-49ff-bb73-4d91b4e872b6 (1).webp', NULL);
INSERT INTO `goods_media` VALUES (43, 44, 'image', 'http://localhost:9090/files/download/44/1743144093779-b9379c45-1706-45d8-a445-ad582f6813c5.webp', NULL);
INSERT INTO `goods_media` VALUES (44, 44, 'image', 'http://localhost:9090/files/download/44/1743144093871-b9818b89-aba0-492c-bf7f-e574edab5359.webp', NULL);
INSERT INTO `goods_media` VALUES (45, 44, 'video', 'http://localhost:9090/files/download/44/1743144105134-4d63495423a4349e4245c1928e1966d80e27e31e.f30_hls/index.m3u8', NULL);

-- ----------------------------
-- Table structure for logs
-- ----------------------------
DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `module` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `operate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_id` int NULL DEFAULT NULL,
  `ip` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 150 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of logs
-- ----------------------------
INSERT INTO `logs` VALUES (5, '用户', '登陆', 11, '127.0.0.1', '2025-03-14 05:05:54');
INSERT INTO `logs` VALUES (6, '用户', '修改密码', 11, '127.0.0.1', '2025-03-14 05:07:25');
INSERT INTO `logs` VALUES (7, '用户', '登陆', 1, '127.0.0.1', '2025-03-14 05:51:36');
INSERT INTO `logs` VALUES (8, '用户', '登陆', 1, '127.0.0.1', '2025-03-14 05:54:24');
INSERT INTO `logs` VALUES (9, '用户', '登陆', 1, '127.0.0.1', '2025-03-14 17:33:24');
INSERT INTO `logs` VALUES (10, '用户', '登陆', 1, '127.0.0.1', '2025-03-14 17:33:44');
INSERT INTO `logs` VALUES (11, '用户', '登陆', 1, '127.0.0.1', '2025-03-14 20:31:59');
INSERT INTO `logs` VALUES (12, '用户', '登陆', 1, '127.0.0.1', '2025-03-14 21:00:32');
INSERT INTO `logs` VALUES (13, '用户', '登陆', 1, '127.0.0.1', '2025-03-14 21:02:14');
INSERT INTO `logs` VALUES (14, '用户', '登陆', 1, '127.0.0.1', '2025-03-14 22:31:28');
INSERT INTO `logs` VALUES (15, '用户', '登陆', 1, '127.0.0.1', '2025-03-15 02:41:29');
INSERT INTO `logs` VALUES (16, '用户', '登陆', 1, '127.0.0.1', '2025-03-15 15:28:19');
INSERT INTO `logs` VALUES (17, '用户', '登陆', 1, '127.0.0.1', '2025-03-15 15:28:45');
INSERT INTO `logs` VALUES (18, '用户', '登陆', 1, '127.0.0.1', '2025-03-15 20:22:16');
INSERT INTO `logs` VALUES (19, '用户', '登陆', 1, '127.0.0.1', '2025-03-15 22:15:00');
INSERT INTO `logs` VALUES (20, '用户', '登陆', 1, '127.0.0.1', '2025-03-15 22:20:25');
INSERT INTO `logs` VALUES (21, '用户', '注册', 12, '127.0.0.1', '2025-03-15 22:25:05');
INSERT INTO `logs` VALUES (22, '用户', '登陆', 12, '127.0.0.1', '2025-03-15 22:25:10');
INSERT INTO `logs` VALUES (23, '用户', '登陆', 1, '127.0.0.1', '2025-03-15 22:29:45');
INSERT INTO `logs` VALUES (24, '用户', '登陆', 1, '127.0.0.1', '2025-03-15 22:38:56');
INSERT INTO `logs` VALUES (25, '用户', '登陆', 1, '127.0.0.1', '2025-03-15 23:02:52');
INSERT INTO `logs` VALUES (26, '用户', '登陆', 1, '127.0.0.1', '2025-03-15 23:07:55');
INSERT INTO `logs` VALUES (27, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 00:48:00');
INSERT INTO `logs` VALUES (28, '用户', '登陆', 12, '127.0.0.1', '2025-03-16 03:15:58');
INSERT INTO `logs` VALUES (29, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 03:18:23');
INSERT INTO `logs` VALUES (30, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 03:20:05');
INSERT INTO `logs` VALUES (31, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 03:36:05');
INSERT INTO `logs` VALUES (32, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 05:00:45');
INSERT INTO `logs` VALUES (33, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 05:55:57');
INSERT INTO `logs` VALUES (34, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 06:17:48');
INSERT INTO `logs` VALUES (35, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 06:24:49');
INSERT INTO `logs` VALUES (36, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 06:28:15');
INSERT INTO `logs` VALUES (37, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 06:28:55');
INSERT INTO `logs` VALUES (38, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 06:57:22');
INSERT INTO `logs` VALUES (39, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 08:38:44');
INSERT INTO `logs` VALUES (40, '用户', '登陆', 1, '127.0.0.1', '2025-03-16 23:14:13');
INSERT INTO `logs` VALUES (41, '用户', '登陆', 1, '127.0.0.1', '2025-03-18 00:13:57');
INSERT INTO `logs` VALUES (42, '用户', '登陆', 1, '127.0.0.1', '2025-03-18 00:46:36');
INSERT INTO `logs` VALUES (43, '用户', '登陆', 1, '127.0.0.1', '2025-03-18 01:03:44');
INSERT INTO `logs` VALUES (44, '用户', '登陆', 1, '127.0.0.1', '2025-03-18 21:43:33');
INSERT INTO `logs` VALUES (45, '用户', '登陆', 1, '127.0.0.1', '2025-03-19 00:36:28');
INSERT INTO `logs` VALUES (46, '用户', '登陆', 1, '127.0.0.1', '2025-03-19 01:10:03');
INSERT INTO `logs` VALUES (47, '用户', '登陆', 1, '127.0.0.1', '2025-03-19 01:50:06');
INSERT INTO `logs` VALUES (48, '用户', '登陆', 1, '127.0.0.1', '2025-03-19 01:50:23');
INSERT INTO `logs` VALUES (49, '用户', '登陆', 1, '127.0.0.1', '2025-03-20 04:40:06');
INSERT INTO `logs` VALUES (50, '用户', '登陆', 1, '127.0.0.1', '2025-03-21 07:15:36');
INSERT INTO `logs` VALUES (51, '用户', '登陆', 1, '127.0.0.1', '2025-03-22 02:59:39');
INSERT INTO `logs` VALUES (52, '用户', '登陆', 1, '127.0.0.1', '2025-03-22 23:43:21');
INSERT INTO `logs` VALUES (53, '用户', '登陆', 1, '127.0.0.1', '2025-03-22 23:52:58');
INSERT INTO `logs` VALUES (54, '用户', '登陆', 1, '127.0.0.1', '2025-03-23 20:26:54');
INSERT INTO `logs` VALUES (55, '用户', '登陆', 1, '127.0.0.1', '2025-03-23 20:27:04');
INSERT INTO `logs` VALUES (56, '用户', '登陆', 1, '127.0.0.1', '2025-03-26 22:47:13');
INSERT INTO `logs` VALUES (57, '用户', '登陆', 1, '127.0.0.1', '2025-03-27 00:11:13');
INSERT INTO `logs` VALUES (58, '用户', '登陆', 1, '127.0.0.1', '2025-03-27 00:41:01');
INSERT INTO `logs` VALUES (59, '用户', '登陆', 1, '127.0.0.1', '2025-03-27 00:41:31');
INSERT INTO `logs` VALUES (60, '用户', '登陆', 1, '127.0.0.1', '2025-03-27 21:57:01');
INSERT INTO `logs` VALUES (61, '用户', '登陆', 1, '127.0.0.1', '2025-03-29 03:15:13');
INSERT INTO `logs` VALUES (62, '用户', '登陆', 1, '127.0.0.1', '2025-03-29 03:35:17');
INSERT INTO `logs` VALUES (63, '用户', '登陆', 1, '127.0.0.1', '2025-03-29 17:54:13');
INSERT INTO `logs` VALUES (64, '用户', '登陆', 1, '127.0.0.1', '2025-03-29 18:10:48');
INSERT INTO `logs` VALUES (65, '用户', '登陆', 1, '127.0.0.1', '2025-03-29 18:16:05');
INSERT INTO `logs` VALUES (66, '用户', '登陆', 1, '127.0.0.1', '2025-03-29 20:17:55');
INSERT INTO `logs` VALUES (67, '用户', '注册', 1008, '127.0.0.1', '2025-03-29 20:40:48');
INSERT INTO `logs` VALUES (68, '用户', '注册', 1009, '127.0.0.1', '2025-03-29 23:04:08');
INSERT INTO `logs` VALUES (69, '用户', '登陆', 1009, '127.0.0.1', '2025-03-29 23:09:08');
INSERT INTO `logs` VALUES (70, '用户', '登陆', 1009, '127.0.0.1', '2025-03-29 23:09:43');
INSERT INTO `logs` VALUES (71, '用户', '注册', 1010, '127.0.0.1', '2025-03-29 23:37:47');
INSERT INTO `logs` VALUES (72, '用户', '登陆', 1010, '127.0.0.1', '2025-03-29 23:37:48');
INSERT INTO `logs` VALUES (73, '用户', '登陆', 1010, '127.0.0.1', '2025-03-29 23:38:05');
INSERT INTO `logs` VALUES (74, '用户', '登陆', 1010, '127.0.0.1', '2025-03-29 23:39:06');
INSERT INTO `logs` VALUES (75, '用户', '登陆', 1010, '127.0.0.1', '2025-03-29 23:49:41');
INSERT INTO `logs` VALUES (76, '用户', '登陆', 1010, '127.0.0.1', '2025-03-29 23:50:02');
INSERT INTO `logs` VALUES (77, '用户', '注册', 1011, '127.0.0.1', '2025-03-29 23:52:25');
INSERT INTO `logs` VALUES (78, '用户', '登陆', 1011, '127.0.0.1', '2025-03-29 23:52:27');
INSERT INTO `logs` VALUES (79, '用户', '登陆', 1011, '127.0.0.1', '2025-03-29 23:58:14');
INSERT INTO `logs` VALUES (80, '用户', '注册', 1012, '127.0.0.1', '2025-03-30 00:04:13');
INSERT INTO `logs` VALUES (81, '用户', '登陆', 1012, '127.0.0.1', '2025-03-30 00:04:15');
INSERT INTO `logs` VALUES (82, '用户', '登陆', 1012, '127.0.0.1', '2025-03-30 00:05:01');
INSERT INTO `logs` VALUES (83, '用户', 'google注册', 1013, '127.0.0.1', '2025-03-30 02:16:23');
INSERT INTO `logs` VALUES (84, '用户', 'cool stuff 注册', 1014, '127.0.0.1', '2025-03-30 05:06:03');
INSERT INTO `logs` VALUES (85, '用户', 'cool stuff 注册', 1015, '127.0.0.1', '2025-03-30 05:11:22');
INSERT INTO `logs` VALUES (86, '用户', '登陆', 1015, '127.0.0.1', '2025-03-30 05:16:52');
INSERT INTO `logs` VALUES (87, '用户', '登陆', 1015, '127.0.0.1', '2025-03-30 05:22:57');
INSERT INTO `logs` VALUES (88, '用户', '登陆', 1015, '127.0.0.1', '2025-03-30 17:16:08');
INSERT INTO `logs` VALUES (89, '用户', '登陆', 1, '127.0.0.1', '2025-03-31 07:31:54');
INSERT INTO `logs` VALUES (90, '用户', '登陆', 1, '127.0.0.1', '2025-03-31 07:34:42');
INSERT INTO `logs` VALUES (91, '用户', '登陆', 1, '127.0.0.1', '2025-03-31 07:35:23');
INSERT INTO `logs` VALUES (92, '用户', '登陆', 1, '127.0.0.1', '2025-04-01 05:28:57');
INSERT INTO `logs` VALUES (93, '用户', '登陆backendUser', 1, '127.0.0.1', '2025-04-01 21:52:30');
INSERT INTO `logs` VALUES (94, '用户', '登陆 backendUser', 1, '127.0.0.1', '2025-04-01 22:05:30');
INSERT INTO `logs` VALUES (95, '用户', '登陆 backendUser', 1, '127.0.0.1', '2025-04-01 22:09:30');
INSERT INTO `logs` VALUES (96, '用户', '登陆 backendUser', 1, '127.0.0.1', '2025-04-01 22:15:58');
INSERT INTO `logs` VALUES (97, '用户', '登陆 backendUser', 1, '127.0.0.1', '2025-04-01 22:42:34');
INSERT INTO `logs` VALUES (98, '用户', '登陆 backendUser', 6, '127.0.0.1', '2025-04-01 22:45:11');
INSERT INTO `logs` VALUES (99, '用户', '登陆 backendUser', 1, '127.0.0.1', '2025-04-01 22:49:02');
INSERT INTO `logs` VALUES (100, '用户', '登陆 coolUser', 1015, '127.0.0.1', '2025-04-02 12:50:21');
INSERT INTO `logs` VALUES (101, '用户', '登陆 coolUser', 1015, '127.0.0.1', '2025-04-02 14:30:48');
INSERT INTO `logs` VALUES (102, '订单', '创建订单,订单编号: [1907288892851462144]', 1013, '127.0.0.1', '2025-04-02 15:28:02');
INSERT INTO `logs` VALUES (103, '订单', '创建订单,订单编号: [1907297810122088448]', 1013, '127.0.0.1', '2025-04-02 16:03:28');
INSERT INTO `logs` VALUES (104, '订单', '创建订单,订单编号: [1907362465196613632]', 1013, '127.0.0.1', '2025-04-02 20:20:23');
INSERT INTO `logs` VALUES (105, '订单', '创建订单,订单编号: [1907368278006996992]', 1013, '127.0.0.1', '2025-04-02 20:43:29');
INSERT INTO `logs` VALUES (106, '订单', '创建订单,订单编号: [1907372397941809152]', 1013, '127.0.0.1', '2025-04-02 20:59:51');
INSERT INTO `logs` VALUES (107, '订单', '创建订单,订单编号: [1907372631518425088]', 1013, '127.0.0.1', '2025-04-02 21:00:47');
INSERT INTO `logs` VALUES (108, '订单', '创建订单,订单编号: [1907372990399852544]', 1013, '127.0.0.1', '2025-04-02 21:02:12');
INSERT INTO `logs` VALUES (109, '订单', '创建订单,订单编号: [1907507344056836096]', 1013, '127.0.0.1', '2025-04-03 05:56:05');
INSERT INTO `logs` VALUES (110, '订单', '创建订单,订单编号: [1907515740554321920]', 1013, '127.0.0.1', '2025-04-03 06:29:27');
INSERT INTO `logs` VALUES (111, '订单', '创建订单,订单编号: [1907518746599415808]', 1013, '127.0.0.1', '2025-04-03 06:41:23');
INSERT INTO `logs` VALUES (112, '订单', '创建订单,订单编号: [1907519229615464448]', 1013, '127.0.0.1', '2025-04-03 06:43:18');
INSERT INTO `logs` VALUES (113, '订单', '创建订单,订单编号: [1907775853907230720]', 1013, '127.0.0.1', '2025-04-03 23:43:03');
INSERT INTO `logs` VALUES (114, '订单', '创建订单,订单编号: [1907792943837933568]', 1013, '127.0.0.1', '2025-04-04 00:50:57');
INSERT INTO `logs` VALUES (115, '订单', '创建订单,订单编号: [1907793989167542272]', 1013, '127.0.0.1', '2025-04-04 00:55:06');
INSERT INTO `logs` VALUES (116, '用户', '登陆 backendUser', 1, '127.0.0.1', '2025-04-04 01:00:57');
INSERT INTO `logs` VALUES (117, '订单', '创建订单,订单编号: [1907799146555043840]', 1013, '127.0.0.1', '2025-04-04 01:15:36');
INSERT INTO `logs` VALUES (118, '订单', '创建订单,订单编号: [1907800039224569856]', 1013, '127.0.0.1', '2025-04-04 01:19:09');
INSERT INTO `logs` VALUES (119, '订单', '创建订单,订单编号: [1908449971686137856]', 1013, '127.0.0.1', '2025-04-05 20:21:45');
INSERT INTO `logs` VALUES (120, '订单', '创建订单,订单编号: [1908451411892690944]', 1013, '127.0.0.1', '2025-04-05 20:27:28');
INSERT INTO `logs` VALUES (121, '订单', '创建订单,订单编号: [1908451962311204864]', 1013, '127.0.0.1', '2025-04-05 20:29:39');
INSERT INTO `logs` VALUES (122, '订单', '创建订单,订单编号: [1908453722215997440]', 1013, '127.0.0.1', '2025-04-05 20:36:39');
INSERT INTO `logs` VALUES (123, '订单', '创建订单,订单编号: [1908465123579977728]', 1013, '127.0.0.1', '2025-04-05 21:21:57');
INSERT INTO `logs` VALUES (124, '订单', '创建订单,订单编号: [1908466559982297088]', 1013, '127.0.0.1', '2025-04-05 21:27:40');
INSERT INTO `logs` VALUES (125, '订单', '创建订单,订单编号: [1908471515384700928]', 1013, '127.0.0.1', '2025-04-05 21:47:21');
INSERT INTO `logs` VALUES (126, '订单', '创建订单,订单编号: [1908546043511083008]', 1013, '127.0.0.1', '2025-04-06 02:43:30');
INSERT INTO `logs` VALUES (127, '订单', '创建订单,订单编号: [1908546198931017728]', 1013, '127.0.0.1', '2025-04-06 02:44:07');
INSERT INTO `logs` VALUES (128, '订单', '创建订单,订单编号: [1908547075729297408]', 1013, '127.0.0.1', '2025-04-06 02:47:36');
INSERT INTO `logs` VALUES (129, '订单', '创建订单,订单编号: [1908548732810727424]', 1013, '127.0.0.1', '2025-04-06 02:54:11');
INSERT INTO `logs` VALUES (130, '订单', '创建订单,订单编号: [1908549326527041536]', 1013, '127.0.0.1', '2025-04-06 02:56:33');
INSERT INTO `logs` VALUES (131, '订单', '创建订单,订单编号: [1908551980741332992]', 1013, '127.0.0.1', '2025-04-06 02:07:06');
INSERT INTO `logs` VALUES (132, '订单', '创建订单,订单编号: [1908558874306449408]', 1013, '127.0.0.1', '2025-04-06 02:34:29');
INSERT INTO `logs` VALUES (133, '订单', '创建订单,订单编号: [1908560496533213184]', 1013, '127.0.0.1', '2025-04-06 02:40:56');
INSERT INTO `logs` VALUES (134, '订单', '创建订单,订单编号: [1908563520936775680]', 1013, '127.0.0.1', '2025-04-06 02:52:57');
INSERT INTO `logs` VALUES (135, '用户', '登陆 backendUser', 1, '127.0.0.1', '2025-04-06 03:58:41');
INSERT INTO `logs` VALUES (136, '订单', '创建订单,订单编号: [1908584908733059072]', 1013, '127.0.0.1', '2025-04-06 04:17:56');
INSERT INTO `logs` VALUES (137, '订单', '创建订单,订单编号: [1908864382875824128]', 1013, '127.0.0.1', '2025-04-06 22:48:28');
INSERT INTO `logs` VALUES (138, '订单', '创建订单,订单编号: [1908868211235188736]', 1013, '127.0.0.1', '2025-04-06 23:03:41');
INSERT INTO `logs` VALUES (139, '用户', '登陆 backendUser', 1, '127.0.0.1', '2025-04-06 23:05:08');
INSERT INTO `logs` VALUES (140, '用户', '登陆 backendUser', 1, '127.0.0.1', '2025-04-06 23:05:52');
INSERT INTO `logs` VALUES (141, '用户', '登陆 backendUser', 1, '127.0.0.1', '2025-04-06 23:08:16');
INSERT INTO `logs` VALUES (142, '用户', '登陆 backendUser', 1, '127.0.0.1', '2025-04-06 23:18:04');
INSERT INTO `logs` VALUES (143, '订单', '创建订单,订单编号: [1908872323179782144]', 1013, '127.0.0.1', '2025-04-06 23:20:01');
INSERT INTO `logs` VALUES (144, '用户', '登陆 coolUser', 1015, '127.0.0.1', '2025-04-06 23:36:57');
INSERT INTO `logs` VALUES (145, '订单', '创建订单,订单编号: [1908876679161618432]', 1015, '127.0.0.1', '2025-04-06 23:37:20');
INSERT INTO `logs` VALUES (146, '订单', '创建订单,订单编号: [1908888156635439104]', 1013, '127.0.0.1', '2025-04-07 00:22:56');
INSERT INTO `logs` VALUES (147, '订单', '创建订单,订单编号: [1908889525748539392]', 1013, '127.0.0.1', '2025-04-07 00:28:23');
INSERT INTO `logs` VALUES (148, '用户', '登陆 coolUser', 1015, '127.0.0.1', '2025-04-07 21:48:32');
INSERT INTO `logs` VALUES (149, '订单', '创建订单,订单编号: [1909770761845129216]', 1015, '127.0.0.1', '2025-04-09 10:50:06');

-- ----------------------------
-- Table structure for menu
-- ----------------------------
DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Menu Name',
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Icon',
  `sort` int NULL DEFAULT NULL COMMENT 'Sort Order',
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Menu Type',
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Component Path',
  `pid` int NULL DEFAULT NULL COMMENT 'Parent Menu ID',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Menu Information' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of menu
-- ----------------------------
INSERT INTO `menu` VALUES (1, 'Management', 'Setting', 9, 'Directory', NULL, NULL);
INSERT INTO `menu` VALUES (2, 'User', 'User', 1, 'Menu', 'user', 1);
INSERT INTO `menu` VALUES (3, 'Role', 'StarFilled', 1, 'Menu', 'role', 1);
INSERT INTO `menu` VALUES (4, 'Menu', 'Folder', 1, 'Menu', 'menu', 1);
INSERT INTO `menu` VALUES (5, 'Goods', 'Goods', 2, 'Menu', 'goods', 6);
INSERT INTO `menu` VALUES (6, 'Site Control', 'Menu', 8, 'Site', '', NULL);
INSERT INTO `menu` VALUES (7, 'Category', 'Memo', 4, 'Menu', 'category', 6);
INSERT INTO `menu` VALUES (8, 'Logs', 'Memo', 1, 'Menu', 'logs', 1);
INSERT INTO `menu` VALUES (9, 'Carousel', 'Guide', 4, 'Menu', 'carousel', 6);
INSERT INTO `menu` VALUES (10, 'Site', 'Grid', 1, 'Menu', 'site', 1);
INSERT INTO `menu` VALUES (11, 'Price Calculation', 'Operation', 4, 'Menu', 'priceCalculation', 6);
INSERT INTO `menu` VALUES (12, 'Front User', 'Sugar', 7, 'Menu', 'frontUser', 6);
INSERT INTO `menu` VALUES (13, 'Order', 'Money', 3, 'Menu', 'order', NULL);
INSERT INTO `menu` VALUES (14, 'Order', 'Money', 3, 'Menu', 'order', 6);

-- ----------------------------
-- Table structure for order_detail
-- ----------------------------
DROP TABLE IF EXISTS `order_detail`;
CREATE TABLE `order_detail`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL COMMENT '对应主订单ID',
  `goods_id` int NOT NULL,
  `goods_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `goods_img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `goods_price` decimal(10, 2) NULL DEFAULT 0.00,
  `num` int NULL DEFAULT 1,
  `subtotal` decimal(10, 2) GENERATED ALWAYS AS ((`goods_price` * `num`)) STORED NULL,
  `url` varchar(2083) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `order_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `order_id`(`order_id` ASC) USING BTREE,
  CONSTRAINT `order_detail_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order_main` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 85 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '订单商品明细表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_detail
-- ----------------------------
INSERT INTO `order_detail` VALUES (3, 3, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue;White', 'Discount Price');
INSERT INTO `order_detail` VALUES (4, 4, 39, 'test', 'http://localhost:9090/files/download/1742693436597-c78949617a8379dd55ce140f4fe8c24e.png', 44.00, 1, DEFAULT, NULL, NULL, 'Origin Price');
INSERT INTO `order_detail` VALUES (5, 5, 39, 'test', 'http://localhost:9090/files/download/1742693436597-c78949617a8379dd55ce140f4fe8c24e.png', 44.00, 1, DEFAULT, NULL, NULL, 'Origin Price');
INSERT INTO `order_detail` VALUES (6, 6, 28, 'testss', 'http://localhost:9090/files/download/1742648106717-49c0fa16-05a3-4a69-bbe3-650e8a25c5f7.png', 111.00, 1, DEFAULT, NULL, NULL, 'Discount Price');
INSERT INTO `order_detail` VALUES (7, 7, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue;White', 'Discount Price');
INSERT INTO `order_detail` VALUES (8, 8, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'discount', 'Discount Price');
INSERT INTO `order_detail` VALUES (9, 9, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'White', 'Discount Price');
INSERT INTO `order_detail` VALUES (10, 10, 44, '20KM/H High-Speed 1:16 Small Off-road Remote Control Car - 2.4G Drifting Anti-collision Rubber Big Tires - Perfect Christmas, Halloween, Thanksgiving Gift', 'http://localhost:9090/files/download/1743143283985-8a769f78-3394-4399-8950-50208d8bbf8e.webp', 41.40, 1, DEFAULT, NULL, 'Black', 'Discount Price');
INSERT INTO `order_detail` VALUES (11, 11, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (13, 13, 30, 'Acrylic LED-Illuminated Samurai Sword Replica, Cool And Handsome Cyberpunk Katana with Light-Up Feature for Cosplay, Party Decoration, and Photography Props', 'http://localhost:9090/files/download/1742651369791-9bd5084bae6b70c2de50892ce52112df.png', 63.30, 1, DEFAULT, NULL, 'regular', 'Origin Price');
INSERT INTO `order_detail` VALUES (14, 14, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (15, 15, 30, 'Acrylic LED-Illuminated Samurai Sword Replica, Cool And Handsome Cyberpunk Katana with Light-Up Feature for Cosplay, Party Decoration, and Photography Props', 'http://localhost:9090/files/download/1742651369791-9bd5084bae6b70c2de50892ce52112df.png', 63.30, 1, DEFAULT, NULL, 'regular', 'Origin Price');
INSERT INTO `order_detail` VALUES (16, 16, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (17, 17, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (18, 18, 40, '442231', 'http://localhost:9090/files/download/1742693455126-90e6ca40-8280-4088-8b10-4368f9901956.png', 333.00, 1, DEFAULT, NULL, 'regular', 'Origin Price');
INSERT INTO `order_detail` VALUES (19, 19, 31, 'Stainless Steel Butterfly Folding Comb - Durable Fine Tooth Design for All Hair Types, Perfect for Handstands and Beginners, Fish Pattern Handle, Portable and Easy to Carry', 'http://localhost:9090/files/download/1742651353150-93ec240f-8b21-4d55-aac7-c0e584aabaee.png', 35.80, 1, DEFAULT, NULL, 'regular', 'Origin Price');
INSERT INTO `order_detail` VALUES (20, 20, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (21, 21, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (22, 22, 32, 'Fully Automatic Large-Capacity Water Gun with Light Effect, 465Cc+60Cc Luxury Model, Summer Outdoor Toys, Children\'S Sprinklers, Interactive Toys Suitable for Holiday Gifts for Children', 'http://localhost:9090/files/download/1742651337537-49c0fa16-05a3-4a69-bbe3-650e8a25c5f7.png', 39.99, 1, DEFAULT, NULL, 'regular', 'Origin Price');
INSERT INTO `order_detail` VALUES (23, 23, 44, '20KM/H High-Speed 1:16 Small Off-road Remote Control Car - 2.4G Drifting Anti-collision Rubber Big Tires - Perfect Christmas, Halloween, Thanksgiving Gift', 'http://localhost:9090/files/download/1743143283985-8a769f78-3394-4399-8950-50208d8bbf8e.webp', 41.40, 1, DEFAULT, NULL, 'Black', 'Discount Price');
INSERT INTO `order_detail` VALUES (24, 24, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (28, 25, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (30, 26, 41, '442323', 'http://localhost:9090/files/download/1742693473385-0a0f6ebf-ae8e-4b0f-9ee4-a07a0e197c35.png', 222.00, 1, DEFAULT, NULL, 'discount', 'Discount Price');
INSERT INTO `order_detail` VALUES (32, 27, 31, 'Stainless Steel Butterfly Folding Comb - Durable Fine Tooth Design for All Hair Types, Perfect for Handstands and Beginners, Fish Pattern Handle, Portable and Easy to Carry', 'http://localhost:9090/files/download/1742651353150-93ec240f-8b21-4d55-aac7-c0e584aabaee.png', 35.80, 1, DEFAULT, NULL, 'regular', 'Origin Price');
INSERT INTO `order_detail` VALUES (34, 28, 30, 'Acrylic LED-Illuminated Samurai Sword Replica, Cool And Handsome Cyberpunk Katana with Light-Up Feature for Cosplay, Party Decoration, and Photography Props', 'http://localhost:9090/files/download/1742651369791-9bd5084bae6b70c2de50892ce52112df.png', 63.30, 4, DEFAULT, NULL, 'regular', 'Origin Price');
INSERT INTO `order_detail` VALUES (36, 29, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (38, 30, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (54, 31, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 4, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (56, 32, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (58, 33, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (60, 34, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (62, 35, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (64, 36, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (68, 37, 43, '32323', 'http://localhost:9090/files/download/1742722715013-c94c2a27-db7c-4d74-b857-4aa5d3736006.png', 70.05, 1, DEFAULT, NULL, 'normal', 'Flash Price');
INSERT INTO `order_detail` VALUES (69, 37, 32, 'Fully Automatic Large-Capacity Water Gun with Light Effect, 465Cc+60Cc Luxury Model, Summer Outdoor Toys, Children\'S Sprinklers, Interactive Toys Suitable for Holiday Gifts for Children', 'http://localhost:9090/files/download/1742651337537-49c0fa16-05a3-4a69-bbe3-650e8a25c5f7.png', 39.99, 1, DEFAULT, NULL, 'normal', 'Origin Price');
INSERT INTO `order_detail` VALUES (70, 37, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'normal', 'Discount Price');
INSERT INTO `order_detail` VALUES (72, 38, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'Blue', 'Discount Price');
INSERT INTO `order_detail` VALUES (76, 39, 38, 'Skirfy Electric Water Gun, Strong Automatic Squirt Gun For Adults&Kids, Auto Suction Modular Battery Water Gun, Summer Gun Pool Beach Outdoor Party Toys For Kids Ages 8-12', 'http://localhost:9090/files/download/1742651319602-0b46403c-1614-483b-91de-d54a0c3350bb.png', 30.00, 1, DEFAULT, NULL, 'normal', 'Discount Price');
INSERT INTO `order_detail` VALUES (77, 39, 39, 'test', 'http://localhost:9090/files/download/1742693436597-c78949617a8379dd55ce140f4fe8c24e.png', 44.00, 1, DEFAULT, NULL, 'normal', 'Origin Price');
INSERT INTO `order_detail` VALUES (78, 39, 40, '442231', 'http://localhost:9090/files/download/1742693455126-90e6ca40-8280-4088-8b10-4368f9901956.png', 333.00, 1, DEFAULT, NULL, 'normal', 'Origin Price');
INSERT INTO `order_detail` VALUES (79, 40, 32, 'Fully Automatic Large-Capacity Water Gun with Light Effect, 465Cc+60Cc Luxury Model, Summer Outdoor Toys, Children\'S Sprinklers, Interactive Toys Suitable for Holiday Gifts for Children', 'http://localhost:9090/files/download/1742651337537-49c0fa16-05a3-4a69-bbe3-650e8a25c5f7.png', 39.99, 2, DEFAULT, NULL, 'normal', 'Origin Price');
INSERT INTO `order_detail` VALUES (80, 40, 43, '32323', 'http://localhost:9090/files/download/1742722715013-c94c2a27-db7c-4d74-b857-4aa5d3736006.png', 70.05, 1, DEFAULT, NULL, 'normal', 'Flash Price');
INSERT INTO `order_detail` VALUES (83, 41, 39, 'test', 'http://localhost:9090/files/download/1742693436597-c78949617a8379dd55ce140f4fe8c24e.png', 44.00, 1, DEFAULT, NULL, 'normal', 'Origin Price');
INSERT INTO `order_detail` VALUES (84, 42, 32, 'Fully Automatic Large-Capacity Water Gun with Light Effect, 465Cc+60Cc Luxury Model, Summer Outdoor Toys, Children\'S Sprinklers, Interactive Toys Suitable for Holiday Gifts for Children', 'http://localhost:9090/files/download/1742651337537-49c0fa16-05a3-4a69-bbe3-650e8a25c5f7.png', 39.99, 1, DEFAULT, NULL, 'regular', 'Origin Price');

-- ----------------------------
-- Table structure for order_main
-- ----------------------------
DROP TABLE IF EXISTS `order_main`;
CREATE TABLE `order_main`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单编号',
  `user_id` int NOT NULL COMMENT '用户ID',
  `total_price` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '订单总价',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '订单状态',
  `pay_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '支付单号',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `pay_time` datetime NULL DEFAULT NULL,
  `site_id` int NOT NULL COMMENT '所处前端id',
  `address_line1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '地址第一行',
  `address_line2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '地址第二行',
  `suburb` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '区域',
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '州/省',
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮政编码',
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '国家',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 43 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '订单主表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_main
-- ----------------------------
INSERT INTO `order_main` VALUES (3, '1907288892851462144', 1013, 30.00, 'Pending Payment', NULL, '2025-04-02 15:28:02', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (4, '1907297810122088448', 1013, 44.00, 'Pending Payment', NULL, '2025-04-02 16:03:28', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (5, '1907362465196613632', 1013, 44.00, 'Pending Payment', NULL, '2025-04-02 20:20:23', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (6, '1907368278006996992', 1013, 111.00, 'Pending Payment', NULL, '2025-04-02 20:43:29', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (7, '1907372397941809152', 1013, 30.00, 'Pending Payment', NULL, '2025-04-02 20:59:51', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (8, '1907372631518425088', 1013, 30.00, 'Pending Payment', NULL, '2025-04-02 21:00:47', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (9, '1907372990399852544', 1013, 30.00, 'Pending Payment', NULL, '2025-04-02 21:02:12', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (10, '1907507344056836096', 1013, 41.40, 'Pending Payment', NULL, '2025-04-03 05:56:05', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (11, '1907515740554321920', 1013, 30.00, 'Pending Payment', NULL, '2025-04-03 06:29:27', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (13, '1907519229615464448', 1013, 63.30, 'Pending Payment', NULL, '2025-04-03 06:43:18', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (14, '1907775853907230720', 1013, 30.00, 'Pending Payment', NULL, '2025-04-03 23:43:02', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (15, '1907792943837933568', 1013, 63.30, 'Pending Shipment', 'pi_3R9oAbC5ptWXjAn20Wg6pT6X', '2025-04-04 00:50:57', '2025-04-04 00:51:49', 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (16, '1907793989167542272', 1013, 30.00, 'Pending Shipment', 'pi_3R9oEaC5ptWXjAn20bZwXe4u', '2025-04-04 00:55:06', '2025-04-04 00:55:45', 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (17, '1907799146555043840', 1013, 30.00, 'Pending Shipment', 'pi_3R9oYRC5ptWXjAn202a7K3yo', '2025-04-04 01:15:36', '2025-04-04 01:15:58', 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (18, '1907800039224569856', 1013, 333.00, 'Pending Payment', NULL, '2025-04-04 01:19:09', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (19, '1908449971686137856', 1013, 35.80, 'Pending Payment', NULL, '2025-04-05 20:21:45', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (20, '1908451411892690944', 1013, 30.00, 'Pending Payment', NULL, '2025-04-05 20:27:28', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (21, '1908451962311204864', 1013, 30.00, 'Pending Payment', NULL, '2025-04-05 20:29:39', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (22, '1908453722215997440', 1013, 39.99, 'Pending Shipment', 'pi_3RAToQC5ptWXjAn21aBGliww', '2025-04-05 20:36:39', '2025-04-05 21:19:31', 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (23, '1908465123579977728', 1013, 41.40, 'Pending Shipment', 'pi_3RATrfC5ptWXjAn20u0LqQ6O', '2025-04-05 21:21:57', '2025-04-05 21:22:39', 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (24, '1908466559982297088', 1013, 30.00, 'Pending Payment', NULL, '2025-04-05 21:27:40', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (25, '1908471515384700928', 1013, 30.00, 'Pending Shipment', 'pi_3RAY7zC5ptWXjAn20JHi0HpL', '2025-04-05 21:47:21', '2025-04-06 01:56:01', 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (26, '1908546043511083008', 1013, 222.00, 'Pending Payment', NULL, '2025-04-06 02:43:30', NULL, 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (27, '1908546198931017728', 1013, 35.80, 'Pending Shipment', 'pi_3RAYtEC5ptWXjAn21jX5vneM', '2025-04-06 02:44:07', '2025-04-06 02:44:30', 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (28, '1908547075729297408', 1013, 253.20, 'Pending Shipment', 'pi_3RAYwoC5ptWXjAn21kizqByf', '2025-04-06 02:47:36', '2025-04-06 02:48:17', 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (29, '1908548732810727424', 1013, 30.00, 'Pending Shipment', 'pi_3RAZ30C5ptWXjAn21mxWNSXd', '2025-04-06 02:54:11', '2025-04-06 02:54:40', 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (30, '1908549326527041536', 1013, 30.00, 'Pending Shipment', 'pi_3RAZ5PC5ptWXjAn21kY3cj4P', '2025-04-06 02:56:33', '2025-04-06 02:57:05', 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (31, '1908551980741332992', 1013, 120.00, 'Pending Payment', NULL, '2025-04-06 02:07:06', NULL, 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (32, '1908558874306449408', 1013, 30.00, 'Pending Payment', NULL, '2025-04-06 02:34:29', NULL, 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (33, '1908560496533213184', 1013, 30.00, 'Pending Shipment', 'pi_3RAZmDC5ptWXjAn215jvayhh', '2025-04-06 02:40:56', '2025-04-06 02:41:33', 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (34, '1908563520936775680', 1013, 30.00, 'Pending Payment', NULL, '2025-04-06 02:52:57', NULL, 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (35, '1908584908733059072', 1013, 30.00, 'Pending Shipment', 'pi_3RAbIFC5ptWXjAn20NVv8fm4', '2025-04-06 04:17:56', '2025-04-06 04:18:27', 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (36, '1908864382875824128', 1013, 30.00, 'Pending Payment', NULL, '2025-04-06 22:48:28', NULL, 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (37, '1908868211235188736', 1013, 140.04, 'Pending Shipment', 'pi_3RAsrnC5ptWXjAn209dxYqFh', '2025-04-06 23:03:41', '2025-04-06 23:04:21', 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (38, '1908872323179782144', 1013, 30.00, 'Pending Shipment', 'pi_3RAt7RC5ptWXjAn20A93CGXr', '2025-04-06 23:20:01', '2025-04-06 23:20:31', 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (39, '1908876679161618432', 1015, 407.00, 'Dispatched', 'pi_3RAtO6C5ptWXjAn208MVbBuC', '2025-04-06 23:37:20', '2025-04-06 23:37:41', 1, '4 Lithgow Avenue', 'Unit 6', 'Blackburn', 'VIC', '3130', '澳大利亚');
INSERT INTO `order_main` VALUES (40, '1908888156635439104', 1013, 150.03, 'Pending Payment', NULL, '2025-04-07 00:22:56', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `order_main` VALUES (41, '1908889525748539392', 1013, 44.00, 'Pending Payment', NULL, '2025-04-07 00:28:23', NULL, 1, 'unit 118/6 John St, Box Hill VIC 3128, Australia', '', 'Box Hill', 'Victoria', '3128', 'Australia');
INSERT INTO `order_main` VALUES (42, '1909770761845129216', 1015, 39.99, 'Pending Payment', NULL, '2025-04-09 10:50:06', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Role Name',
  `flag` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Unique Identifier',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `flag`(`flag` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Role Information Table' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES (1, 'Administrator', 'ADMIN');
INSERT INTO `role` VALUES (2, 'User', 'USER');

-- ----------------------------
-- Table structure for role_menu
-- ----------------------------
DROP TABLE IF EXISTS `role_menu`;
CREATE TABLE `role_menu`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NULL DEFAULT NULL COMMENT 'Role ID',
  `menu_id` int NULL DEFAULT NULL COMMENT 'Menu ID',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 136 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Role-Menu Relationship Table' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of role_menu
-- ----------------------------
INSERT INTO `role_menu` VALUES (56, 2, 6);
INSERT INTO `role_menu` VALUES (57, 2, 7);
INSERT INTO `role_menu` VALUES (58, 2, 5);
INSERT INTO `role_menu` VALUES (59, 2, 9);
INSERT INTO `role_menu` VALUES (123, 1, 6);
INSERT INTO `role_menu` VALUES (124, 1, 5);
INSERT INTO `role_menu` VALUES (125, 1, 9);
INSERT INTO `role_menu` VALUES (126, 1, 14);
INSERT INTO `role_menu` VALUES (127, 1, 7);
INSERT INTO `role_menu` VALUES (128, 1, 11);
INSERT INTO `role_menu` VALUES (129, 1, 12);
INSERT INTO `role_menu` VALUES (130, 1, 1);
INSERT INTO `role_menu` VALUES (131, 1, 2);
INSERT INTO `role_menu` VALUES (132, 1, 3);
INSERT INTO `role_menu` VALUES (133, 1, 4);
INSERT INTO `role_menu` VALUES (134, 1, 8);
INSERT INTO `role_menu` VALUES (135, 1, 10);

-- ----------------------------
-- Table structure for role_site
-- ----------------------------
DROP TABLE IF EXISTS `role_site`;
CREATE TABLE `role_site`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NULL DEFAULT NULL COMMENT 'Role ID',
  `site_id` int NULL DEFAULT NULL COMMENT 'Site ID',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 69 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Role-Site Relationship Table' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of role_site
-- ----------------------------
INSERT INTO `role_site` VALUES (56, 2, 1);
INSERT INTO `role_site` VALUES (67, 1, 5);
INSERT INTO `role_site` VALUES (68, 1, 1);

-- ----------------------------
-- Table structure for site
-- ----------------------------
DROP TABLE IF EXISTS `site`;
CREATE TABLE `site`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '站点ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '站点名称',
  `domain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '站点域名',
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '站点Logo地址',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '站点简介',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '站点信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of site
-- ----------------------------
INSERT INTO `site` VALUES (1, 'Cool Stuff', 'localhost:3000', 'http://localhost:9090/files/download/1742306983734-1740244251421wy8ynrpk2-removebg.png', NULL);
INSERT INTO `site` VALUES (5, 'Test', '111', 'http://localhost:9090/files/download/1742306976470-images.png', NULL);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Username',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Password',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Name',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Avatar',
  `role_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Role ID',
  `sex` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Gender',
  `age` int NULL DEFAULT NULL COMMENT 'Age',
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Phone',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Email',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'User Information Table' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'admin', '4f89d8462599c49014933ca35df3dc68', 'Administrator', 'http://localhost:9090/files/download/1742307029156-1740244251421wy8ynrpk2-removebg.png', '1', NULL, NULL, NULL, NULL);
INSERT INTO `user` VALUES (6, 'user', 'e1785341327db3cd5a50b99831e32a47', 'user', 'http://localhost:9090/files/download/1742307309735-images.png', '2', NULL, NULL, NULL, NULL);
INSERT INTO `user` VALUES (7, '111', 'e1785341327db3cd5a50b99831e32a47', '111', 'http://localhost:9090/files/download/1742307315706-images.png', '2', NULL, NULL, NULL, NULL);
INSERT INTO `user` VALUES (11, 'bbb', '552f295173b204755f442c764a53a9e8', 'bbb', NULL, '2', NULL, NULL, NULL, NULL);
INSERT INTO `user` VALUES (12, 'aaa', 'e1785341327db3cd5a50b99831e32a47', 'aaa', NULL, '2', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
