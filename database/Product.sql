USE electroshop_db;

SET SQL_SAFE_UPDATES = 0;


CREATE TABLE IF NOT EXISTS user_view_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL, -- ID của khách hàng
    product_id BIGINT UNSIGNED NOT NULL, -- ID của sản phẩm đã xem
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Thời gian xem
    
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_history_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1. LAPTOP (10 mẫu)
INSERT INTO products (product_id, category_id, product_name, product_slug, base_price, product_status) VALUES
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

-- 2. ĐIỆN THOẠI (10 mẫu)
INSERT INTO products (product_id, category_id, product_name, product_slug, base_price, product_status) VALUES
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

-- 3. PHỤ KIỆN (10 mẫu)
INSERT INTO products (product_id, category_id, product_name, product_slug, base_price, product_status) VALUES
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

-- 4. LINH KIỆN PC (10 mẫu)
INSERT INTO products (product_id, category_id, product_name, product_slug, base_price, product_status) VALUES
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

-- Chèn ảnh cho 40 sản phẩm
INSERT INTO product_images (product_id, image_url, is_thumbnail, sort_order) VALUES
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