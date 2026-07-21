USE electroshop_db;

-- Tắt kiểm tra khóa ngoại tạm thời để insert dễ dàng hơn
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 1. DỮ LIỆU TIỀN QUYẾT ĐỊNH (CATEGORIES & USERS)
-- =========================================================

-- Insert Danh mục (Categories) tương ứng với category_id 1, 2, 3, 4
INSERT INTO categories (category_id, category_name, category_slug, category_description, category_status) VALUES
(1, 'Điện thoại', 'dien-thoai', 'Các dòng điện thoại thông minh', 'ACTIVE'),
(2, 'Laptop', 'laptop', 'Máy tính xách tay các loại', 'ACTIVE'),
(3, 'Phụ kiện', 'phu-kien', 'Phụ kiện công nghệ', 'ACTIVE'),
(4, 'Linh kiện PC', 'linh-kien-pc', 'Linh kiện lắp ráp máy tính', 'ACTIVE')
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

-- Insert 1 Role và 1 User mẫu để tạo lịch sử xem (user_view_history)
INSERT IGNORE INTO roles (role_id, role_code, role_name, role_description) VALUES 
(1, 'CUSTOMER', 'Khách hàng', 'Tài khoản khách hàng mua sắm');

INSERT IGNORE INTO users (user_id, role_id, user_full_name, user_email, user_phone, password_hash) VALUES 
(1, 1, 'Nguyễn Văn Khách', 'khachhang@gmail.com', '0987654321', 'hashed_password_123');

-- =========================================================
-- 2. DỮ LIỆU SẢN PHẨM (PRODUCTS)
-- =========================================================

-- LAPTOP (10 mẫu)
INSERT IGNORE INTO products (product_id, category_id, product_name, product_slug, base_price, product_status) VALUES
(1, 2, 'Laptop Gaming ASUS ROG Strix', 'asus-rog', 45990000, 'ACTIVE'),
(2, 2, 'Laptop Lenovo ThinkPad', 'lenovo-thinkpad', 38000000, 'ACTIVE'),
(3, 2, 'Laptop HP Victus 16', 'hp-victus', 24500000, 'ACTIVE'),
(4, 2, 'Laptop Acer Swift Go', 'acer-swift', 21900000, 'ACTIVE'),
(5, 2, 'Laptop MSI Katana 15', 'msi-katana', 27500000, 'ACTIVE'),
(6, 2, 'Laptop MacBook Air M2', 'macbook-air', 26500000, 'ACTIVE'),
(7, 2, 'Laptop Dell Inspiron 15', 'dell-inspiron', 16500000, 'ACTIVE'),
(8, 2, 'Laptop Gigabyte G5 MF', 'gigabyte-g5', 19990000, 'ACTIVE'),
(9, 2, 'Laptop MacBook Pro M3', 'macbook-pro-m3', 52990000, 'ACTIVE'),
(10, 2, 'Laptop HP EliteBook', 'hp-elitebook', 22500000, 'ACTIVE');

-- ĐIỆN THOẠI (10 mẫu)
INSERT IGNORE INTO products (product_id, category_id, product_name, product_slug, base_price, product_status) VALUES
(11, 1, 'iPhone 16 Pro Max', 'iphone-16-pro-max', 34990000, 'ACTIVE'),
(12, 1, 'iPhone 15 Plus', 'iphone-15-plus', 22990000, 'ACTIVE'),
(13, 1, 'iPhone 13 128GB', 'iphone-13-128gb', 15990000, 'ACTIVE'),
(14, 1, 'Samsung S24 Ultra', 'samsung-s24-ultra', 28990000, 'ACTIVE'),
(15, 1, 'Samsung Galaxy A55', 'samsung-a55', 9990000, 'ACTIVE'),
(16, 1, 'Xiaomi 14 Ultra', 'xiaomi-14-ultra', 25000000, 'ACTIVE'),
(17, 1, 'Samsung Z Flip 5', 'samsung-z-flip-5', 21500000, 'ACTIVE'),
(18, 1, 'iPhone 12 64GB', 'iphone-12-64gb', 12500000, 'ACTIVE'),
(19, 1, 'Oppo Find X7 Ultra', 'oppo-find-x7', 27000000, 'ACTIVE'),
(20, 1, 'Samsung S23 FE', 'samsung-s23-fe', 11990000, 'ACTIVE');

-- PHỤ KIỆN (10 mẫu)
INSERT IGNORE INTO products (product_id, category_id, product_name, product_slug, base_price, product_status) VALUES
(21, 3, 'Logitech G Pro X', 'logitech-g-pro-x', 3200000, 'ACTIVE'),
(22, 3, 'Razer DeathAdder V3', 'razer-deathadder-v3', 3500000, 'ACTIVE'),
(23, 3, 'HyperX Cloud Alpha', 'hyperx-cloud-alpha', 2100000, 'ACTIVE'),
(24, 3, 'Keychron Q1 Pro', 'keychron-q1-pro', 4500000, 'ACTIVE'),
(25, 3, 'Anker 735 GaN 65W', 'anker-735-gan', 1200000, 'ACTIVE'),
(26, 3, 'Sony WH-1000XM5', 'sony-wh-1000xm5', 7500000, 'ACTIVE'),
(27, 3, 'Baseus Phone Holder', 'baseus-holder', 150000, 'ACTIVE'),
(28, 3, 'Apple Magic Mouse', 'apple-magic-mouse', 2200000, 'ACTIVE'),
(29, 3, 'JBL Flip 6 Speaker', 'jbl-flip-6', 2900000, 'ACTIVE'),
(30, 3, 'Logitech MX Master 3S', 'logitech-mx-master', 2800000, 'ACTIVE');

-- LINH KIỆN PC (10 mẫu)
INSERT IGNORE INTO products (product_id, category_id, product_name, product_slug, base_price, product_status) VALUES
(31, 4, 'CPU Intel Core i9-14900K', 'cpu-i9-14900k', 15000000, 'ACTIVE'),
(32, 4, 'RAM Corsair Vengeance 32GB', 'ram-corsair-32gb', 3500000, 'ACTIVE'),
(33, 4, 'SSD Samsung 990 Pro 1TB', 'ssd-samsung-990pro', 3200000, 'ACTIVE'),
(34, 4, 'Case Corsair 4000D Airflow', 'case-corsair-4000d', 2800000, 'ACTIVE'),
(35, 4, 'Nguồn Cooler Master 750W', 'psu-coolermaster-750w', 2200000, 'ACTIVE'),
(36, 4, 'Mainboard ASUS ROG Z790', 'main-asus-z790', 8500000, 'ACTIVE'),
(37, 4, 'Card màn hình RTX 4070 Super', 'gpu-rtx-4070-super', 18500000, 'ACTIVE'),
(38, 4, 'Tản nhiệt nước NZXT Kraken', 'cool-nzxt-kraken', 4500000, 'ACTIVE'),
(39, 4, 'RAM Kingston Fury 16GB', 'ram-kingston-16gb', 1500000, 'ACTIVE'),
(40, 4, 'SSD WD Black SN850X 2TB', 'ssd-wd-sn850x', 4800000, 'ACTIVE');

-- =========================================================
-- 3. HÌNH ẢNH SẢN PHẨM (PRODUCT_IMAGES)
-- =========================================================
INSERT IGNORE INTO product_images (product_id, image_url, is_thumbnail, sort_order) VALUES
(1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEnknfpKUVn9wre0WRiFFu2LjE7KoJvs34QQR0evHuog&s', TRUE, 1),
(2, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKx6dkN8KCFjC_sceph0WqPn21P65_DPh5fOcrX6MAVg&s=10', TRUE, 1),
(3, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCFy6nKqryy5MBbeUJNkMGnoCEVsixSZPMmfKKTyeVIA&s', TRUE, 1),
(4, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcL2QueflKnDn5bGAXPzP-_KqhQH8oE0r1h5yxz2A0Lw&s', TRUE, 1),
(5, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIHiiTjSygQu2ItHxAJjhzPRFTx0N5k-hX1elY-rdrrA&s=10', TRUE, 1),
(6, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRrypBrP-2TcAIzQehcMsJuNAvyj4jL0usU1W9V-SJeQ&s', TRUE, 1),
(7, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0zlOV2S4_PbEcmvIlNVtsfNXzCNxy7-THx9ZN7Fxe6w&s=10', TRUE, 1),
(8, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8dHOcFPeMfjDkeblAYX6FAlbfbok550LOduZWJG2mNw&s=10', TRUE, 1),
(9, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-4lGVwvvLVlXci7swohzob95lCkvn9hFN23_jhwn9zg&s=10', TRUE, 1),
(10, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS--Yb5pMLgRaDYwPh7khDwpWl8EDd_fGy7jWovDFlkMQ&s=10', TRUE, 1),
(11, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlV8w6eLL2QVY8zAvF1Je1VHcrd_bTrVT0-ElqvBG8Fg&s', TRUE, 1),
(12, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvr0PHYylAD3EFN8t8nOk7IZR8GFQS73_XXcHvg_rE1A&s', TRUE, 1),
(13, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoh3yt4lkcmClQZ2pqUIopBfOy1VmwQAZSxHRpr_rU4Q&s', TRUE, 1),
(14, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw3HTF1utzLQHaUHHwJrUNJLifOiEcd4JK_B9aqB0s8w&s', TRUE, 1),
(15, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRDOBHc_GzO2Ih6Fd6oM9OMfaVZljrlyUX9EHtI98E_g&s=10', TRUE, 1),
(16, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOeqJu2FK58lyH5Fznb2EN0NnvfcJXH7Xr-a83vCOdkw&s=10', TRUE, 1),
(17, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJwtnOOobxYbO101RYHU6JjdxgPHBlJmMEhBf65AGlwg&s=10', TRUE, 1),
(18, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiTbopNAIFSLCyq6Uzq836GIA-d1YuREyuB73tzigeHw&s=10', TRUE, 1),
(19, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbFSYn_UI-S_adV_etKDP2ttZU6BLGdoOLUcTJ2yNcIw&s', TRUE, 1),
(20, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrDNyvj9-CFJcIXo05Cyy-NvxqkQl76rVEOzOszp4Wpg&s=10', TRUE, 1),
(21, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKWNZJFqOq4nlFV4wco3cxhb--RGvACt_8u2BSpjJCfg&s=10', TRUE, 1),
(22, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv2cyW0IbLGu6ifCcuS_fkue6uzWLU0AHA5VestdgPlw&s=10', TRUE, 1),
(23, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKkBDr78foi0VjRtBl_dfjYxNlmpAklG48tuAZosFHxw&s=10', TRUE, 1),
(24, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY9zCEnvq1csNpYkDXw47MQlXAvVMtZULuTT_cZKvK8w&s=10', TRUE, 1),
(25, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrtqqNZT1CZKbUlH1c8dZOH7wjlediuvDBPqfAq86WAQ&s=10', TRUE, 1),
(26, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFjxnYaUZNgske9XooBpmfbYU0AFYUlyyx2VfeF0mFoA&s=10', TRUE, 1),
(27, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsdWjH7b_ZSicKqm44X6z9__Qnb3uwsKBnUqTPNQm1Gw&s', TRUE, 1),
(28, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3anBCkqt5UFsCkAF3TwIncX2HRdp3rKKV8lqxQUREmA&s=10', TRUE, 1),
(29, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkrISmOt3_KK1hKa64UlddeelrpGHn5Zymuj1n6VWcAQ&s', TRUE, 1),
(30, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWH2ZSX-F_YndrkGvlM3pnO-ehK1JuAVF4ZeiAG8MfAQ&s=10', TRUE, 1),
(31, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbiwdCt-tz2Y6fKzK22UZfXHhltTlmKT9zV2fWp530jw&s=10', TRUE, 1),
(32, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5VxwnH5JnjmCnBDwf2PKHw_DlI8bk4G628Zi_lqd1sg&s=10', TRUE, 1),
(33, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7AboDJY-7PK2gpKT7mXXqA4itfuoxee_LWYcMWppAkw&s=10', TRUE, 1),
(34, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg6xP_yuxgH7-p-cydmRhnl9F2rYaiftIGJA-3XNhi9Q&s=10', TRUE, 1),
(35, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBt736ZHryIu4LVEeKctqHxuJsCXHLVM3KZe5iy82gEw&s=10', TRUE, 1),
(36, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPyym8FPCeJEVbp97G6myH8fCoiL2u5VPX9mu08l3YHQ&s=10', TRUE, 1),
(37, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXvH7vCGe5eXwEYMZtR-8yHcSSDbHW1nAJbkIYagRRNA&s=10', TRUE, 1),
(38, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_zW8QlL0clsIlafQlY_wK5mYZ4xObRw7evXvlNs-FAg&s=10', TRUE, 1),
(39, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1QgcqO0MBaV7uDFJjmBGJaygUzvfAMRbglnBfcRbP2A&s', TRUE, 1),
(40, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPx9AkWki76bkzodjC29y57yj_H27mwdIIX_669Q5FAA&s=10', TRUE, 1);

-- =========================================================
-- 4. BỔ SUNG: DỮ LIỆU LỊCH SỬ XEM (USER_VIEW_HISTORY)
-- =========================================================
-- Thêm các bản ghi mẫu mô phỏng user (id=1) vừa xem qua một số điện thoại, laptop, phụ kiện
INSERT IGNORE INTO user_view_history (user_id, product_id, viewed_at) VALUES
(1, 11, DATE_SUB(NOW(), INTERVAL 2 HOUR)), -- Xem iPhone 16 Pro Max 2 tiếng trước
(1, 14, DATE_SUB(NOW(), INTERVAL 1 HOUR)), -- Xem Samsung S24 Ultra 1 tiếng trước
(1, 6, DATE_SUB(NOW(), INTERVAL 30 MINUTE)), -- Xem MacBook Air M2 30 phút trước
(1, 26, DATE_SUB(NOW(), INTERVAL 15 MINUTE)), -- Xem Tai nghe Sony WH-1000XM5 15 phút trước
(1, 33, NOW()); -- Vừa xem SSD Samsung 990 Pro

-- Bật lại kiểm tra khóa ngoại
USE electroshop_db;

SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 1. CẬP NHẬT MÔ TẢ (DESCRIPTION) CHO BẢNG PRODUCTS
-- =========================================================
-- Sử dụng ON DUPLICATE KEY UPDATE để bổ sung mô tả nếu record đã tồn tại

-- LAPTOP
INSERT INTO products (product_id, category_id, product_name, product_slug, product_description, base_price, product_status) VALUES
(1, 2, 'Laptop Gaming ASUS ROG Strix', 'asus-rog', 'Laptop Gaming cao cấp với thiết kế tản nhiệt vượt trội, LED RGB cực chất, phù hợp cho game thủ eSports.', 45990000, 'ACTIVE'),
(2, 2, 'Laptop Lenovo ThinkPad', 'lenovo-thinkpad', 'Dòng laptop doanh nhân huyền thoại, bàn phím gõ cực sướng, độ bền chuẩn quân đội.', 38000000, 'ACTIVE'),
(3, 2, 'Laptop HP Victus 16', 'hp-victus', 'Lựa chọn hoàn hảo cho nhu cầu học tập, làm việc kết hợp chơi game AAA ở mức setting vừa phải.', 24500000, 'ACTIVE'),
(4, 2, 'Laptop Acer Swift Go', 'acer-swift', 'Mỏng nhẹ, di động cao, màn hình OLED rực rỡ đáp ứng xuất sắc nhu cầu văn phòng.', 21900000, 'ACTIVE'),
(5, 2, 'Laptop MSI Katana 15', 'msi-katana', 'Bảo kiếm của game thủ với thiết kế đậm chất Ninja, hiệu năng mạnh mẽ trong tầm giá.', 27500000, 'ACTIVE')
ON DUPLICATE KEY UPDATE product_description = VALUES(product_description);

-- ĐIỆN THOẠI
INSERT INTO products (product_id, category_id, product_name, product_slug, product_description, base_price, product_status) VALUES
(11, 1, 'iPhone 16 Pro Max', 'iphone-16-pro-max', 'Siêu phẩm flagship mới nhất từ Apple với khung viền Titanium, camera đỉnh cao và Apple Intelligence.', 34990000, 'ACTIVE'),
(12, 1, 'iPhone 15 Plus', 'iphone-15-plus', 'Màn hình lớn 6.7 inch, thời lượng pin trâu bò nhất trong dòng iPhone 15 series.', 22990000, 'ACTIVE'),
(13, 1, 'iPhone 13 128GB', 'iphone-13-128gb', 'Chiếc iPhone quốc dân với hiệu năng vẫn cực kỳ mượt mà ở thời điểm hiện tại.', 15990000, 'ACTIVE'),
(14, 1, 'Samsung S24 Ultra', 'samsung-s24-ultra', 'Quyền năng Galaxy AI, bút S-Pen tiện lợi và camera zoom quang học vô đối.', 28990000, 'ACTIVE'),
(15, 1, 'Samsung Galaxy A55', 'samsung-a55', 'Smartphone tầm trung thiết kế đẹp, kháng nước kháng bụi, pin 5000mAh.', 9990000, 'ACTIVE')
ON DUPLICATE KEY UPDATE product_description = VALUES(product_description);

-- LINH KIỆN PC
INSERT INTO products (product_id, category_id, product_name, product_slug, product_description, base_price, product_status) VALUES
(31, 4, 'CPU Intel Core i9-14900K', 'cpu-i9-14900k', 'Vi xử lý flagship thế hệ 14 của Intel, 24 nhân 32 luồng xử lý đa nhiệm đỉnh cao.', 15000000, 'ACTIVE'),
(32, 4, 'RAM Corsair Vengeance 32GB', 'ram-corsair-32gb', 'Kit RAM DDR5 hiệu năng cao, bus 6000MHz tích hợp tản nhiệt thép.', 3500000, 'ACTIVE'),
(33, 4, 'SSD Samsung 990 Pro 1TB', 'ssd-samsung-990pro', 'Ổ cứng SSD PCIe 4.0 tốc độ đọc ghi nhanh nhất thế giới, lý tưởng cho PS5 và PC Gaming.', 3200000, 'ACTIVE')
ON DUPLICATE KEY UPDATE product_description = VALUES(product_description);


-- =========================================================
-- 2. THÊM DATA VÀO PRODUCT_VARIANTS (CPU, RAM, STORAGE, GPU...)
-- =========================================================

-- LAPTOP VARIANTS
INSERT IGNORE INTO product_variants (variant_id, product_id, variant_name, sku, color, ram_size, storage_size, gpu_option, cpu_option, additional_price, variant_status) VALUES
-- Asus ROG (product_id: 1)
(1, 1, 'ROG Strix i9 - RTX 4080', 'ASUS-ROG-001', 'Eclipse Gray', '32GB DDR5', '1TB NVMe', 'NVIDIA RTX 4080 12GB', 'Intel Core i9-13980HX', 0, 'ACTIVE'),
(2, 1, 'ROG Strix i9 - RTX 4090', 'ASUS-ROG-002', 'Eclipse Gray', '64GB DDR5', '2TB NVMe', 'NVIDIA RTX 4090 16GB', 'Intel Core i9-13980HX', 15000000, 'ACTIVE'),

-- Lenovo ThinkPad (product_id: 2)
(3, 2, 'ThinkPad X1 Carbon Gen 11', 'THINK-X1-001', 'Deep Black', '16GB LPDDR5x', '512GB NVMe', 'Intel Iris Xe', 'Intel Core i7-1355U', 0, 'ACTIVE'),
(4, 2, 'ThinkPad X1 Carbon Gen 11 (32GB)', 'THINK-X1-002', 'Deep Black', '32GB LPDDR5x', '1TB NVMe', 'Intel Iris Xe', 'Intel Core i7-1370P', 4500000, 'ACTIVE'),

-- HP Victus 16 (product_id: 3)
(5, 3, 'Victus 16 Ryzen 7', 'HP-VIC-001', 'Mica Silver', '16GB DDR5', '512GB NVMe', 'NVIDIA RTX 4050 6GB', 'AMD Ryzen 7 7840HS', 0, 'ACTIVE'),

-- MacBook Air M2 (product_id: 6)
(6, 6, 'MacBook Air M2 8GB/256GB', 'MAC-AIR-M2-01', 'Midnight', '8GB Unified', '256GB SSD', '8-core GPU', 'Apple M2 8-core', 0, 'ACTIVE'),
(7, 6, 'MacBook Air M2 16GB/512GB', 'MAC-AIR-M2-02', 'Starlight', '16GB Unified', '512GB SSD', '10-core GPU', 'Apple M2 8-core', 7000000, 'ACTIVE');

-- ĐIỆN THOẠI VARIANTS
INSERT IGNORE INTO product_variants (variant_id, product_id, variant_name, sku, color, ram_size, storage_size, gpu_option, cpu_option, additional_price, variant_status) VALUES
-- iPhone 16 Pro Max (product_id: 11)
(11, 11, 'iPhone 16 Pro Max 256GB Titan Tự Nhiên', 'IP16PM-256-NAT', 'Titan Tự Nhiên', '8GB', '256GB', 'Apple GPU (6-core)', 'Apple A18 Pro', 0, 'ACTIVE'),
(12, 11, 'iPhone 16 Pro Max 512GB Titan Đen', 'IP16PM-512-BLK', 'Titan Đen', '8GB', '512GB', 'Apple GPU (6-core)', 'Apple A18 Pro', 6000000, 'ACTIVE'),
(13, 11, 'iPhone 16 Pro Max 1TB Titan Trắng', 'IP16PM-1TB-WHT', 'Titan Trắng', '8GB', '1TB', 'Apple GPU (6-core)', 'Apple A18 Pro', 12000000, 'ACTIVE'),

-- Samsung S24 Ultra (product_id: 14)
(14, 14, 'S24 Ultra 12GB/256GB', 'SS-S24U-256', 'Xám Titan', '12GB', '256GB', 'Adreno 750', 'Snapdragon 8 Gen 3 for Galaxy', 0, 'ACTIVE'),
(15, 14, 'S24 Ultra 12GB/512GB', 'SS-S24U-512', 'Đen Titan', '12GB', '512GB', 'Adreno 750', 'Snapdragon 8 Gen 3 for Galaxy', 4000000, 'ACTIVE');

-- LINH KIỆN PC VARIANTS (Không có RAM/Storage đi kèm nhưng có thông số vi xử lý)
INSERT IGNORE INTO product_variants (variant_id, product_id, variant_name, sku, color, ram_size, storage_size, gpu_option, cpu_option, additional_price, variant_status) VALUES
-- CPU Intel (product_id: 31)
(31, 31, 'Intel Core i9-14900K Box Chính hãng', 'INTEL-14900K', NULL, NULL, NULL, 'UHD Graphics 770', '24 Cores / 32 Threads, up to 6.0 GHz', 0, 'ACTIVE');

SET FOREIGN_KEY_CHECKS = 1;
SET FOREIGN_KEY_CHECKS = 1;
USE electroshop_db;

SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 1. THIẾT LẬP LOẠI GIAO DỊCH KHO & NHÀ CUNG CẤP
-- =========================================================

-- Khởi tạo các loại giao dịch kho (IN, OUT, ADJUST)
INSERT IGNORE INTO inventory_transaction_types (inventory_type_id, inventory_type_code, inventory_type_name) VALUES
(1, 'IN', 'Nhập kho mua hàng'),
(2, 'OUT', 'Xuất kho bán hàng'),
(3, 'ADJUST', 'Điều chỉnh tồn kho');

-- Tạo 1 nhà cung cấp mẫu
INSERT IGNORE INTO suppliers (supplier_id, supplier_name, supplier_phone, supplier_address) VALUES
(1, 'Công ty TNHH Phân Phối Công Nghệ Mới', '0901234567', 'Tòa nhà A, Quận 1, TP.HCM');

-- Bổ sung mapping giá nhập cho một số sản phẩm từ nhà cung cấp
INSERT IGNORE INTO product_suppliers (product_id, supplier_id, supplier_sku, cost_price) VALUES
(1, 1, 'SUP-ASUS-001', 40000000),
(11, 1, 'SUP-IP16-001', 32000000),
(14, 1, 'SUP-SS24-001', 25000000);

-- =========================================================
-- 2. TẠO LỊCH SỬ NHẬP KHO (INVENTORY TRANSACTIONS)
-- =========================================================
-- Chèn lịch sử nhập kho cho các variant đã tạo ở bước trước
INSERT INTO inventory_transactions (product_id, variant_id, supplier_id, inventory_type_id, transaction_quantity, unit_cost, transaction_note) VALUES
-- Nhập kho Laptop
(1, 1, 1, 1, 20, 40000000, 'Nhập lô hàng Asus ROG Strix đầu tháng'),
(1, 2, 1, 1, 10, 52000000, 'Nhập lô hàng Asus ROG Strix bản cao cấp'),
(2, 3, 1, 1, 30, 32000000, 'Nhập ThinkPad X1'),
(2, 4, 1, 1, 15, 36000000, 'Nhập ThinkPad X1 bản 32GB'),
(3, 5, 1, 1, 50, 20000000, 'Nhập HP Victus'),
(6, 6, 1, 1, 40, 24000000, 'Nhập MacBook Air M2 256GB'),
(6, 7, 1, 1, 20, 30000000, 'Nhập MacBook Air M2 512GB'),

-- Nhập kho Điện thoại
(11, 11, 1, 1, 100, 32000000, 'Nhập iPhone 16 Pro Max 256GB Titan Tự Nhiên'),
(11, 12, 1, 1, 50, 37000000, 'Nhập iPhone 16 Pro Max 512GB Titan Đen'),
(11, 13, 1, 1, 20, 43000000, 'Nhập iPhone 16 Pro Max 1TB Titan Trắng'),
(14, 14, 1, 1, 80, 25000000, 'Nhập Samsung S24 Ultra 256GB'),
(14, 15, 1, 1, 40, 28000000, 'Nhập Samsung S24 Ultra 512GB'),

-- Nhập kho Linh kiện
(31, 31, 1, 1, 50, 13500000, 'Nhập lô CPU Intel i9');


-- =========================================================
-- 3. CẬP NHẬT SỐ LƯỢNG VÀO BẢNG TỒN KHO HIỆN TẠI (VARIANT_INVENTORY)
-- =========================================================
-- Trong hệ thống thực tế thường dùng trigger trên bảng inventory_transactions để tự động update bảng này.
-- Ở đây tôi insert cứng dựa theo số lượng vừa nhập kho bên trên.
INSERT INTO variant_inventory (variant_id, stock_quantity, reserved_quantity) VALUES
(1, 20, 0),
(2, 10, 0),
(3, 30, 0),
(4, 15, 0),
(5, 50, 0),
(6, 40, 0),
(7, 20, 0),
(11, 100, 0),
(12, 50, 0),
(13, 20, 0),
(14, 80, 0),    
(15, 40, 0),
(31, 50, 0)
ON DUPLICATE KEY UPDATE stock_quantity = stock_quantity + VALUES(stock_quantity);

SET FOREIGN_KEY_CHECKS = 1;
-- =========================================================
-- 2. KHỞI TẠO TỒN KHO AN TOÀN CHO TOÀN BỘ SẢN PHẨM
-- Chạy lại không làm số lượng tăng vô hạn
-- =========================================================

-- Đảm bảo có loại giao dịch nhập kho
INSERT IGNORE INTO inventory_transaction_types (
    inventory_type_id,
    inventory_type_code,
    inventory_type_name
)
VALUES (
    1,
    'IN',
    'Nhập kho mua hàng'
);

-- =========================================================
-- 2.1. BỔ SUNG TỒN KHO CHO SẢN PHẨM KHÔNG CÓ VARIANT
-- Laptop: 15
-- Điện thoại: 25
-- Phụ kiện: 50
-- Linh kiện PC: 30
-- =========================================================

INSERT INTO inventory_transactions (
    product_id,
    variant_id,
    supplier_id,
    staff_user_id,
    inventory_type_id,
    transaction_quantity,
    unit_cost,
    transaction_note
)
SELECT
    p.product_id,
    NULL AS variant_id,
    NULL AS supplier_id,
    NULL AS staff_user_id,
    itt.inventory_type_id,

    GREATEST(
        CASE
            WHEN c.category_slug = 'laptop' THEN 15
            WHEN c.category_slug = 'dien-thoai' THEN 25
            WHEN c.category_slug = 'phu-kien' THEN 50
            WHEN c.category_slug = 'linh-kien-pc' THEN 30
            WHEN c.category_slug = 'man-hinh' THEN 20
            ELSE 10
        END
        -
        COALESCE(vps.current_stock, 0),
        0
    ) AS transaction_quantity,

    ROUND(p.base_price * 0.75, 2) AS unit_cost,

    'Khởi tạo tồn kho sản phẩm không có phiên bản'
FROM products p

JOIN categories c
    ON c.category_id = p.category_id

JOIN inventory_transaction_types itt
    ON itt.inventory_type_code = 'IN'

LEFT JOIN vw_product_stock vps
    ON vps.product_id = p.product_id

WHERE p.product_status = 'ACTIVE'

  -- Chỉ xử lý sản phẩm chưa có variant
  AND NOT EXISTS (
      SELECT 1
      FROM product_variants pv
      WHERE pv.product_id = p.product_id
        AND pv.variant_status = 'ACTIVE'
  )

  -- Chỉ nhập phần còn thiếu
  AND GREATEST(
        CASE
            WHEN c.category_slug = 'laptop' THEN 15
            WHEN c.category_slug = 'dien-thoai' THEN 25
            WHEN c.category_slug = 'phu-kien' THEN 50
            WHEN c.category_slug = 'linh-kien-pc' THEN 30
            WHEN c.category_slug = 'man-hinh' THEN 20
            ELSE 10
        END
        -
        COALESCE(vps.current_stock, 0),
        0
      ) > 0;

-- =========================================================
-- 2.2. TỒN KHO CHO CÁC VARIANT ĐÃ CÓ TRONG FILE
-- Gán số lượng mục tiêu, không cộng dồn khi chạy lại
-- =========================================================

INSERT INTO variant_inventory (
    variant_id,
    stock_quantity,
    reserved_quantity
)
VALUES
    -- ASUS ROG
    (1, 20, 0),
    (2, 10, 0),

    -- Lenovo ThinkPad
    (3, 30, 0),
    (4, 15, 0),

    -- HP Victus
    (5, 50, 0),

    -- MacBook Air
    (6, 40, 0),
    (7, 20, 0),

    -- iPhone 16 Pro Max
    (11, 100, 0),
    (12, 50, 0),
    (13, 20, 0),

    -- Samsung S24 Ultra
    (14, 80, 0),
    (15, 40, 0),

    -- CPU Intel
    (31, 50, 0)

ON DUPLICATE KEY UPDATE
    stock_quantity = VALUES(stock_quantity),
    reserved_quantity = VALUES(reserved_quantity);

-- =========================================================
-- 2.3. TẠO LỊCH SỬ NHẬP KHO CHO VARIANT
-- Chỉ thêm khi variant chưa có giao dịch IN
-- =========================================================

INSERT INTO inventory_transactions (
    product_id,
    variant_id,
    supplier_id,
    staff_user_id,
    inventory_type_id,
    transaction_quantity,
    unit_cost,
    transaction_note
)
SELECT
    pv.product_id,
    vi.variant_id,
    1 AS supplier_id,
    NULL AS staff_user_id,
    itt.inventory_type_id,
    vi.stock_quantity,
    ROUND(
        (
            p.base_price
            +
            COALESCE(pv.additional_price, 0)
        ) * 0.75,
        2
    ) AS unit_cost,
    'Khởi tạo tồn kho ban đầu cho phiên bản'
FROM variant_inventory vi

JOIN product_variants pv
    ON pv.variant_id = vi.variant_id

JOIN products p
    ON p.product_id = pv.product_id

JOIN inventory_transaction_types itt
    ON itt.inventory_type_code = 'IN'

WHERE NOT EXISTS (
    SELECT 1
    FROM inventory_transactions inventory_existing
    WHERE inventory_existing.variant_id = vi.variant_id
      AND inventory_existing.inventory_type_id =
          itt.inventory_type_id
);

-- =========================================================
-- 3. KIỂM TRA TỒN KHO TOÀN BỘ SẢN PHẨM
-- =========================================================

SELECT
    p.product_id,
    p.product_name,
    c.category_name,
    c.category_slug,
    COALESCE(vps.current_stock, 0) AS current_stock,

    CASE
        WHEN COALESCE(vps.current_stock, 0) > 0
            THEN 'Còn hàng'
        ELSE 'Hết hàng'
    END AS stock_status

FROM products p

JOIN categories c
    ON c.category_id = p.category_id

LEFT JOIN vw_product_stock vps
    ON vps.product_id = p.product_id

WHERE p.product_status = 'ACTIVE'

ORDER BY
    c.category_id,
    p.product_id;

-- =========================================================
-- 4. KIỂM TRA TỒN KHO TỪNG VARIANT
-- =========================================================

SELECT
    p.product_id,
    p.product_name,
    pv.variant_id,
    pv.variant_name,
    COALESCE(vi.stock_quantity, 0) AS stock_quantity,
    COALESCE(vi.reserved_quantity, 0) AS reserved_quantity,

    GREATEST(
        COALESCE(vi.stock_quantity, 0)
        -
        COALESCE(vi.reserved_quantity, 0),
        0
    ) AS available_quantity

FROM product_variants pv

JOIN products p
    ON p.product_id = pv.product_id

LEFT JOIN variant_inventory vi
    ON vi.variant_id = pv.variant_id

WHERE pv.variant_status = 'ACTIVE'

ORDER BY
    p.product_id,
    pv.variant_id;

SET FOREIGN_KEY_CHECKS = 1;