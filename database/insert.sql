-- ============================================================
-- CNPM / ELECTROSHOP DATABASE
-- FILE 02: INSERT TOÀN BỘ DỮ LIỆU MẪU
--
-- Chạy sau 01_create_tables.sql.
-- File này chứa: role/user/category, 40 sản phẩm, ảnh, variant,
-- tồn kho, thông số chi tiết, đơn hàng Top Selling và dữ liệu kiểm tra.
-- ============================================================

USE electroshop_db;

-- Chuẩn hóa charset/collation cho toàn bộ phiên làm việc.
-- Tránh lỗi 1267 giữa utf8mb4_unicode_ci và utf8mb4_0900_ai_ci.
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET collation_connection = 'utf8mb4_unicode_ci';

SET FOREIGN_KEY_CHECKS = 0;

-- Chay file nay sau khi da chay schema.sql
USE electroshop_db;

SET FOREIGN_KEY_CHECKS = 1;

-- 10. SEED DATA - KHÔNG INSERT TRÙNG
-- =========================================================

INSERT IGNORE INTO roles (role_code, role_name, role_description) VALUES
('CUSTOMER', 'Khách hàng', 'Người mua hàng trên website'),
('STAFF', 'Nhân viên', 'Nhân viên xử lý đơn hàng và kho'),
('ADMIN', 'Quản trị viên', 'Quản trị toàn bộ hệ thống');

INSERT IGNORE INTO order_statuses (order_status_code, order_status_name) VALUES
('PENDING', 'Chờ xác nhận'),
('CONFIRMED', 'Đã xác nhận'),
('SHIPPING', 'Đang giao hàng'),
('DELIVERED', 'Đã giao hàng'),
('CANCELLED', 'Đã hủy');

INSERT IGNORE INTO payment_methods (payment_method_code, payment_method_name) VALUES
('QR_BANKING', 'Thanh toán QR chuyển khoản'),
('COD', 'Thanh toán khi nhận hàng');

INSERT IGNORE INTO payment_statuses (payment_status_code, payment_status_name) VALUES
('UNPAID', 'Chưa thanh toán'),
('PAID', 'Đã thanh toán'),
('FAILED', 'Thanh toán thất bại'),
('REFUNDED', 'Đã hoàn tiền');

INSERT IGNORE INTO inventory_transaction_types (inventory_type_code, inventory_type_name) VALUES
('IN', 'Nhập kho'),
('OUT', 'Xuất kho'),
('ADJUST', 'Điều chỉnh kho');

-- =========================================================

-- 12. SAMPLE DATA - DỮ LIỆU MẪU ĐỂ TEST HỆ THỐNG
-- Chạy lại nhiều lần không bị insert trùng vì dùng INSERT IGNORE
-- =========================================================

-- -------------------------
-- 12.1 PERMISSIONS
-- -------------------------

INSERT IGNORE INTO permissions (permission_code, permission_name, permission_description) VALUES
('VIEW_PRODUCTS', 'Xem sản phẩm', 'Cho phép xem danh sách và chi tiết sản phẩm'),
('MANAGE_PRODUCTS', 'Quản lý sản phẩm', 'Cho phép thêm, sửa, xóa sản phẩm'),
('MANAGE_CATEGORIES', 'Quản lý danh mục', 'Cho phép quản lý danh mục sản phẩm'),
('MANAGE_ORDERS', 'Quản lý đơn hàng', 'Cho phép xem và cập nhật đơn hàng'),
('MANAGE_INVENTORY', 'Quản lý kho hàng', 'Cho phép nhập, xuất và điều chỉnh kho'),
('MANAGE_SUPPLIERS', 'Quản lý nhà cung cấp', 'Cho phép quản lý nhà cung cấp'),
('MANAGE_USERS', 'Quản lý người dùng', 'Cho phép quản lý khách hàng và nhân viên'),
('VIEW_REPORTS', 'Xem báo cáo', 'Cho phép xem báo cáo thống kê'),
('USE_AI_SEARCH', 'Sử dụng AI Search', 'Cho phép dùng chức năng tìm kiếm thông minh'),
('VIEW_AUDIT_LOGS', 'Xem nhật ký hệ thống', 'Cho phép xem lịch sử hoạt động hệ thống');

-- Customer permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
JOIN permissions p ON p.permission_code IN ('VIEW_PRODUCTS', 'USE_AI_SEARCH')
WHERE r.role_code = 'CUSTOMER';

-- Staff permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
JOIN permissions p ON p.permission_code IN (
    'VIEW_PRODUCTS',
    'MANAGE_ORDERS',
    'MANAGE_INVENTORY'
)
WHERE r.role_code = 'STAFF';

-- Admin permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
JOIN permissions p
WHERE r.role_code = 'ADMIN';

-- -------------------------
-- 12.2 USERS
-- Mật khẩu demo đều là chuỗi giả lập, khi code thật sẽ dùng bcrypt
-- -------------------------

INSERT IGNORE INTO users (
    role_id,
    user_full_name,
    user_email,
    user_phone,
    password_hash,
    account_status
)
SELECT role_id, 'Nguyễn Văn Admin', 'admin@electroshop.vn', '0900000001', '$2b$10$demo_admin_password_hash', 'ACTIVE'
FROM roles WHERE role_code = 'ADMIN';

INSERT IGNORE INTO users (
    role_id,
    user_full_name,
    user_email,
    user_phone,
    password_hash,
    account_status
)
SELECT role_id, 'Trần Thị Nhân Viên', 'staff@electroshop.vn', '0900000002', '$2b$10$demo_staff_password_hash', 'ACTIVE'
FROM roles WHERE role_code = 'STAFF';

INSERT IGNORE INTO users (
    role_id,
    user_full_name,
    user_email,
    user_phone,
    password_hash,
    account_status
)
SELECT role_id, 'Lê Minh Khách', 'customer1@gmail.com', '0900000003', '$2b$10$demo_customer_password_hash', 'ACTIVE'
FROM roles WHERE role_code = 'CUSTOMER';

INSERT IGNORE INTO users (
    role_id,
    user_full_name,
    user_email,
    user_phone,
    password_hash,
    account_status
)
SELECT role_id, 'Phạm Hoàng Anh', 'customer2@gmail.com', '0900000004', '$2b$10$demo_customer_password_hash', 'ACTIVE'
FROM roles WHERE role_code = 'CUSTOMER';

-- -------------------------
-- 12.3 USER ADDRESSES
-- -------------------------

INSERT IGNORE INTO user_addresses (
    user_id,
    receiver_name,
    receiver_phone,
    province_name,
    district_name,
    ward_name,
    street_address,
    is_default
)
SELECT user_id, 'Lê Minh Khách', '0900000003', 'Hà Nội', 'Hoàn Kiếm', 'Hàng Bạc', 'Số 12 phố Hàng Bạc', TRUE
FROM users WHERE user_email = 'customer1@gmail.com';

INSERT IGNORE INTO user_addresses (
    user_id,
    receiver_name,
    receiver_phone,
    province_name,
    district_name,
    ward_name,
    street_address,
    is_default
)
SELECT user_id, 'Phạm Hoàng Anh', '0900000004', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 25 đường Cầu Giấy', TRUE
FROM users WHERE user_email = 'customer2@gmail.com';

-- -------------------------
-- 12.4 CATEGORIES
-- -------------------------

INSERT IGNORE INTO categories (
    parent_category_id,
    category_name,
    category_slug,
    category_description,
    category_status
) VALUES
(NULL, 'Điện thoại', 'dien-thoai', 'Các dòng điện thoại thông minh', 'ACTIVE'),
(NULL, 'Laptop', 'laptop', 'Máy tính xách tay phục vụ học tập, làm việc và giải trí', 'ACTIVE'),
(NULL, 'Phụ kiện', 'phu-kien', 'Phụ kiện công nghệ', 'ACTIVE'),
(NULL, 'Linh kiện PC', 'linh-kien-pc', 'Linh kiện máy tính để bàn', 'ACTIVE'),
(NULL, 'Màn hình', 'man-hinh', 'Màn hình máy tính', 'ACTIVE');

-- -------------------------
-- 12.5 BRANDS
-- -------------------------

INSERT IGNORE INTO brands (brand_name, brand_description, brand_status) VALUES
('Apple', 'Thương hiệu công nghệ Apple', 'ACTIVE'),
('Samsung', 'Thương hiệu điện tử Samsung', 'ACTIVE'),
('Dell', 'Thương hiệu laptop Dell', 'ACTIVE'),
('Asus', 'Thương hiệu laptop và linh kiện Asus', 'ACTIVE'),
('Lenovo', 'Thương hiệu laptop Lenovo', 'ACTIVE'),
('Xiaomi', 'Thương hiệu điện thoại và phụ kiện Xiaomi', 'ACTIVE'),
('Logitech', 'Thương hiệu phụ kiện máy tính Logitech', 'ACTIVE'),
('LG', 'Thương hiệu màn hình LG', 'ACTIVE');

-- -------------------------
-- 12.6 PRODUCT ATTRIBUTES
-- -------------------------

INSERT IGNORE INTO product_attributes (attribute_name, attribute_unit) VALUES
('RAM', 'GB'),
('Bộ nhớ trong', 'GB'),
('CPU', NULL),
('GPU', NULL),
('Kích thước màn hình', 'inch'),
('Tần số quét', 'Hz'),
('Dung lượng pin', 'mAh'),
('Công suất', 'W'),
('Màu sắc', NULL),
('Hệ điều hành', NULL);

-- Category - attributes
INSERT IGNORE INTO category_attributes (category_id, attribute_id)
SELECT c.category_id, a.attribute_id
FROM categories c
JOIN product_attributes a
WHERE c.category_slug = 'laptop'
AND a.attribute_name IN ('RAM', 'Bộ nhớ trong', 'CPU', 'GPU', 'Kích thước màn hình', 'Màu sắc', 'Hệ điều hành');

INSERT IGNORE INTO category_attributes (category_id, attribute_id)
SELECT c.category_id, a.attribute_id
FROM categories c
JOIN product_attributes a
WHERE c.category_slug = 'dien-thoai'
AND a.attribute_name IN ('RAM', 'Bộ nhớ trong', 'Kích thước màn hình', 'Dung lượng pin', 'Màu sắc', 'Hệ điều hành');

INSERT IGNORE INTO category_attributes (category_id, attribute_id)
SELECT c.category_id, a.attribute_id
FROM categories c
JOIN product_attributes a
WHERE c.category_slug = 'man-hinh'
AND a.attribute_name IN ('Kích thước màn hình', 'Tần số quét', 'Màu sắc');

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

-- ============================================================
-- BỔ SUNG THÔNG SỐ CHO TOÀN BỘ 40 SẢN PHẨM
-- Dùng cho electroshop_db / MySQL 8
--
-- LƯU Ý:
-- 1. Chạy DataSanPhamforAI.sql trước file này.
-- 2. Thông số là dữ liệu DEMO đại diện theo tên sản phẩm.
--    Một số tên sản phẩm chưa có mã SKU cụ thể nên không được xem là
--    thông số hãng chính thức.
-- 3. Có thể chạy lại; ON DUPLICATE KEY UPDATE sẽ cập nhật, không cộng dồn.
-- ============================================================

USE electroshop_db;

SET @OLD_SQL_SAFE_UPDATES := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- ------------------------------------------------------------
-- 1. BỔ SUNG THƯƠNG HIỆU
-- ------------------------------------------------------------
INSERT INTO brands (
    brand_name,
    brand_description,
    brand_status
)
VALUES
('ASUS', 'Thương hiệu ASUS', 'ACTIVE'),
('Acer', 'Thương hiệu Acer', 'ACTIVE'),
('Anker', 'Thương hiệu Anker', 'ACTIVE'),
('Apple', 'Thương hiệu Apple', 'ACTIVE'),
('Baseus', 'Thương hiệu Baseus', 'ACTIVE'),
('Cooler Master', 'Thương hiệu Cooler Master', 'ACTIVE'),
('Corsair', 'Thương hiệu Corsair', 'ACTIVE'),
('Dell', 'Thương hiệu Dell', 'ACTIVE'),
('Gigabyte', 'Thương hiệu Gigabyte', 'ACTIVE'),
('HP', 'Thương hiệu HP', 'ACTIVE'),
('HyperX', 'Thương hiệu HyperX', 'ACTIVE'),
('Intel', 'Thương hiệu Intel', 'ACTIVE'),
('JBL', 'Thương hiệu JBL', 'ACTIVE'),
('Keychron', 'Thương hiệu Keychron', 'ACTIVE'),
('Kingston', 'Thương hiệu Kingston', 'ACTIVE'),
('Lenovo', 'Thương hiệu Lenovo', 'ACTIVE'),
('Logitech', 'Thương hiệu Logitech', 'ACTIVE'),
('MSI', 'Thương hiệu MSI', 'ACTIVE'),
('NVIDIA', 'Thương hiệu NVIDIA', 'ACTIVE'),
('NZXT', 'Thương hiệu NZXT', 'ACTIVE'),
('OPPO', 'Thương hiệu OPPO', 'ACTIVE'),
('Razer', 'Thương hiệu Razer', 'ACTIVE'),
('Samsung', 'Thương hiệu Samsung', 'ACTIVE'),
('Sony', 'Thương hiệu Sony', 'ACTIVE'),
('Western Digital', 'Thương hiệu Western Digital', 'ACTIVE'),
('Xiaomi', 'Thương hiệu Xiaomi', 'ACTIVE')
ON DUPLICATE KEY UPDATE
    brand_description = VALUES(brand_description),
    brand_status = 'ACTIVE';

-- ------------------------------------------------------------
-- 2. BỔ SUNG / CHUẨN HÓA DANH MỤC THUỘC TÍNH
-- ------------------------------------------------------------
INSERT INTO product_attributes (
    attribute_code,
    attribute_name,
    spec_group,
    attribute_unit,
    value_type,
    display_order,
    is_highlight,
    is_filterable,
    is_ai_searchable,
    attribute_description
)
VALUES
('PRODUCT_TYPE', 'Loại sản phẩm', 'Thông tin chung', NULL, 'TEXT', 1, TRUE, TRUE, TRUE, 'Loại sản phẩm'),
('TARGET_USER', 'Đối tượng phù hợp', 'Nhu cầu sử dụng', NULL, 'TEXT', 2, FALSE, TRUE, TRUE, 'Đối tượng phù hợp'),
('USE_CASE', 'Mục đích sử dụng', 'Nhu cầu sử dụng', NULL, 'TEXT', 3, FALSE, TRUE, TRUE, 'Mục đích sử dụng'),
('PERFORMANCE_LEVEL', 'Mức hiệu năng', 'Nhu cầu sử dụng', NULL, 'TEXT', 4, FALSE, TRUE, TRUE, 'Mức hiệu năng'),
('GAMING_CAPABILITY', 'Khả năng chơi game', 'Nhu cầu sử dụng', NULL, 'TEXT', 5, FALSE, TRUE, TRUE, 'Khả năng chơi game'),
('MULTITASKING_LEVEL', 'Khả năng đa nhiệm', 'Nhu cầu sử dụng', NULL, 'TEXT', 6, FALSE, TRUE, TRUE, 'Khả năng đa nhiệm'),
('COMPATIBILITY_NOTE', 'Thông tin tương thích', 'Tương thích', NULL, 'TEXT', 7, FALSE, TRUE, TRUE, 'Thông tin tương thích'),
('CPU_MODEL', 'CPU', 'Hiệu năng', NULL, 'TEXT', 1, TRUE, TRUE, TRUE, 'CPU'),
('RAM_CAPACITY_GB', 'RAM', 'Hiệu năng', 'GB', 'NUMBER', 2, TRUE, TRUE, TRUE, 'RAM'),
('STORAGE_CAPACITY_GB', 'Bộ nhớ trong', 'Bộ nhớ', 'GB', 'NUMBER', 1, TRUE, TRUE, TRUE, 'Bộ nhớ trong'),
('GPU_MODEL', 'GPU', 'Đồ họa', NULL, 'TEXT', 1, TRUE, TRUE, TRUE, 'GPU'),
('SCREEN_SIZE_INCH', 'Kích thước màn hình', 'Màn hình', 'inch', 'NUMBER', 1, TRUE, TRUE, TRUE, 'Kích thước màn hình'),
('SCREEN_REFRESH_RATE_HZ', 'Tần số quét', 'Màn hình', 'Hz', 'NUMBER', 2, TRUE, TRUE, TRUE, 'Tần số quét'),
('OPERATING_SYSTEM', 'Hệ điều hành', 'Phần mềm', NULL, 'TEXT', 1, FALSE, TRUE, TRUE, 'Hệ điều hành'),
('WEIGHT_KG', 'Trọng lượng', 'Thiết kế', 'kg', 'NUMBER', 1, FALSE, TRUE, TRUE, 'Trọng lượng'),
('BATTERY_CAPACITY_WH', 'Dung lượng pin laptop', 'Pin', 'Wh', 'NUMBER', 1, FALSE, TRUE, TRUE, 'Dung lượng pin laptop'),
('COLOR', 'Màu sắc', 'Thiết kế', NULL, 'TEXT', 2, FALSE, TRUE, TRUE, 'Màu sắc'),
('PHONE_CHIPSET', 'Chip điện thoại', 'Hiệu năng', NULL, 'TEXT', 1, TRUE, TRUE, TRUE, 'Chip điện thoại'),
('PHONE_RAM_GB', 'RAM điện thoại', 'Hiệu năng', 'GB', 'NUMBER', 2, TRUE, TRUE, TRUE, 'RAM điện thoại'),
('PHONE_STORAGE_GB', 'Bộ nhớ điện thoại', 'Bộ nhớ', 'GB', 'NUMBER', 1, TRUE, TRUE, TRUE, 'Bộ nhớ điện thoại'),
('BATTERY_CAPACITY_MAH', 'Dung lượng pin', 'Pin & Sạc', 'mAh', 'NUMBER', 1, TRUE, TRUE, TRUE, 'Dung lượng pin'),
('CHARGING_POWER_W', 'Công suất sạc', 'Pin & Sạc', 'W', 'NUMBER', 2, FALSE, TRUE, TRUE, 'Công suất sạc'),
('MAIN_CAMERA_MP', 'Camera chính', 'Camera', 'MP', 'NUMBER', 1, TRUE, TRUE, TRUE, 'Camera chính'),
('CAMERA_CAPABILITY', 'Khả năng chụp ảnh', 'Camera', NULL, 'TEXT', 2, FALSE, TRUE, TRUE, 'Khả năng chụp ảnh'),
('PHONE_GAMING_LEVEL', 'Mức chơi game điện thoại', 'Nhu cầu sử dụng', NULL, 'TEXT', 8, FALSE, TRUE, TRUE, 'Mức chơi game điện thoại'),
('ACCESSORY_TYPE', 'Loại phụ kiện', 'Thông tin chung', NULL, 'TEXT', 2, TRUE, TRUE, TRUE, 'Loại phụ kiện'),
('CONNECTION_TYPE', 'Kiểu kết nối', 'Kết nối', NULL, 'TEXT', 1, TRUE, TRUE, TRUE, 'Kiểu kết nối'),
('COMPATIBLE_DEVICE', 'Thiết bị tương thích', 'Tương thích', NULL, 'TEXT', 1, TRUE, TRUE, TRUE, 'Thiết bị tương thích'),
('MOUSE_DPI', 'Độ phân giải chuột', 'Hiệu năng', 'DPI', 'NUMBER', 1, TRUE, TRUE, TRUE, 'Độ phân giải chuột'),
('AUDIO_DRIVER_MM', 'Kích thước driver âm thanh', 'Âm thanh', 'mm', 'NUMBER', 1, TRUE, TRUE, TRUE, 'Kích thước driver âm thanh'),
('KEYBOARD_SWITCH', 'Loại switch bàn phím', 'Bàn phím', NULL, 'TEXT', 1, TRUE, TRUE, TRUE, 'Loại switch bàn phím'),
('BATTERY_LIFE_HOURS', 'Thời lượng pin', 'Pin', 'giờ', 'NUMBER', 1, TRUE, TRUE, TRUE, 'Thời lượng pin'),
('WATER_RESISTANCE', 'Khả năng kháng nước', 'Độ bền', NULL, 'TEXT', 1, FALSE, TRUE, TRUE, 'Khả năng kháng nước'),
('SPEAKER_POWER_W', 'Công suất loa', 'Âm thanh', 'W', 'NUMBER', 1, TRUE, TRUE, TRUE, 'Công suất loa'),
('WEIGHT_G', 'Trọng lượng phụ kiện', 'Thiết kế', 'g', 'NUMBER', 1, FALSE, TRUE, TRUE, 'Trọng lượng phụ kiện'),
('MATERIAL', 'Chất liệu', 'Thiết kế', NULL, 'TEXT', 2, FALSE, TRUE, TRUE, 'Chất liệu'),
('CPU_SOCKET', 'Socket CPU', 'Tương thích', NULL, 'TEXT', 1, TRUE, TRUE, TRUE, 'Socket CPU'),
('CPU_CORE_COUNT', 'Số nhân CPU', 'Hiệu năng', 'nhân', 'NUMBER', 2, TRUE, TRUE, TRUE, 'Số nhân CPU'),
('CPU_THREAD_COUNT', 'Số luồng CPU', 'Hiệu năng', 'luồng', 'NUMBER', 3, FALSE, TRUE, TRUE, 'Số luồng CPU'),
('CPU_BOOST_CLOCK_GHZ', 'Xung nhịp tối đa', 'Hiệu năng', 'GHz', 'NUMBER', 4, TRUE, TRUE, TRUE, 'Xung nhịp tối đa'),
('CPU_BASE_POWER_W', 'Công suất cơ bản CPU', 'Điện năng', 'W', 'NUMBER', 1, FALSE, TRUE, TRUE, 'Công suất cơ bản CPU'),
('RAM_TYPE', 'Chuẩn RAM', 'Thông số RAM', NULL, 'TEXT', 2, TRUE, TRUE, TRUE, 'Chuẩn RAM'),
('RAM_SPEED_MHZ', 'Bus RAM', 'Thông số RAM', 'MHz', 'NUMBER', 3, TRUE, TRUE, TRUE, 'Bus RAM'),
('RAM_FORM_FACTOR', 'Dạng RAM', 'Tương thích', NULL, 'TEXT', 4, FALSE, TRUE, TRUE, 'Dạng RAM'),
('RAM_MODULE_COUNT', 'Số thanh RAM', 'Thông số RAM', 'thanh', 'NUMBER', 5, FALSE, TRUE, TRUE, 'Số thanh RAM'),
('RAM_CAS_LATENCY', 'Độ trễ RAM', 'Thông số RAM', 'CL', 'NUMBER', 6, FALSE, TRUE, TRUE, 'Độ trễ RAM'),
('RAM_VOLTAGE', 'Điện áp RAM', 'Thông số RAM', 'V', 'NUMBER', 7, FALSE, TRUE, TRUE, 'Điện áp RAM'),
('RAM_DEVICE_COMPATIBILITY', 'Thiết bị dùng RAM', 'Tương thích', NULL, 'TEXT', 8, TRUE, TRUE, TRUE, 'Thiết bị dùng RAM'),
('RAM_RECOMMENDED_TAB_COUNT', 'Số tab trình duyệt phù hợp', 'Nhu cầu sử dụng', 'tab', 'NUMBER', 9, FALSE, TRUE, TRUE, 'Số tab trình duyệt phù hợp'),
('SSD_CAPACITY_GB', 'Dung lượng SSD', 'Thông số SSD', 'GB', 'NUMBER', 1, TRUE, TRUE, TRUE, 'Dung lượng SSD'),
('SSD_INTERFACE', 'Chuẩn kết nối SSD', 'Tương thích', NULL, 'TEXT', 2, TRUE, TRUE, TRUE, 'Chuẩn kết nối SSD'),
('SSD_FORM_FACTOR', 'Kích thước SSD', 'Tương thích', NULL, 'TEXT', 3, FALSE, TRUE, TRUE, 'Kích thước SSD'),
('SSD_READ_SPEED_MBPS', 'Tốc độ đọc SSD', 'Hiệu năng', 'MB/s', 'NUMBER', 4, TRUE, TRUE, TRUE, 'Tốc độ đọc SSD'),
('SSD_WRITE_SPEED_MBPS', 'Tốc độ ghi SSD', 'Hiệu năng', 'MB/s', 'NUMBER', 5, TRUE, TRUE, TRUE, 'Tốc độ ghi SSD'),
('CASE_FORM_FACTOR', 'Loại vỏ máy', 'Thông số case', NULL, 'TEXT', 1, TRUE, TRUE, TRUE, 'Loại vỏ máy'),
('CASE_MOTHERBOARD_SUPPORT', 'Mainboard hỗ trợ', 'Tương thích', NULL, 'TEXT', 2, TRUE, TRUE, TRUE, 'Mainboard hỗ trợ'),
('CASE_MAX_GPU_LENGTH_MM', 'Chiều dài GPU tối đa', 'Tương thích', 'mm', 'NUMBER', 3, FALSE, TRUE, TRUE, 'Chiều dài GPU tối đa'),
('CASE_WEIGHT_KG', 'Trọng lượng case', 'Thiết kế', 'kg', 'NUMBER', 4, FALSE, TRUE, TRUE, 'Trọng lượng case'),
('PSU_POWER_W', 'Công suất nguồn', 'Thông số nguồn', 'W', 'NUMBER', 1, TRUE, TRUE, TRUE, 'Công suất nguồn'),
('PSU_EFFICIENCY', 'Chứng nhận hiệu suất', 'Thông số nguồn', NULL, 'TEXT', 2, TRUE, TRUE, TRUE, 'Chứng nhận hiệu suất'),
('PSU_MODULAR_TYPE', 'Kiểu dây nguồn', 'Thông số nguồn', NULL, 'TEXT', 3, FALSE, TRUE, TRUE, 'Kiểu dây nguồn'),
('PSU_FORM_FACTOR', 'Chuẩn nguồn', 'Tương thích', NULL, 'TEXT', 4, FALSE, TRUE, TRUE, 'Chuẩn nguồn'),
('MOTHERBOARD_SOCKET', 'Socket mainboard', 'Tương thích', NULL, 'TEXT', 1, TRUE, TRUE, TRUE, 'Socket mainboard'),
('MOTHERBOARD_CHIPSET', 'Chipset mainboard', 'Thông số mainboard', NULL, 'TEXT', 2, TRUE, TRUE, TRUE, 'Chipset mainboard'),
('MOTHERBOARD_RAM_TYPE', 'Chuẩn RAM hỗ trợ', 'Tương thích', NULL, 'TEXT', 3, TRUE, TRUE, TRUE, 'Chuẩn RAM hỗ trợ'),
('MOTHERBOARD_FORM_FACTOR', 'Kích thước mainboard', 'Thông số mainboard', NULL, 'TEXT', 4, FALSE, TRUE, TRUE, 'Kích thước mainboard'),
('MOTHERBOARD_WIFI', 'Kết nối Wi-Fi', 'Kết nối', NULL, 'TEXT', 5, FALSE, TRUE, TRUE, 'Kết nối Wi-Fi'),
('GPU_VRAM_GB', 'Dung lượng VRAM', 'Hiệu năng đồ họa', 'GB', 'NUMBER', 1, TRUE, TRUE, TRUE, 'Dung lượng VRAM'),
('GPU_RECOMMENDED_PSU_W', 'Nguồn đề nghị cho GPU', 'Tương thích', 'W', 'NUMBER', 2, TRUE, TRUE, TRUE, 'Nguồn đề nghị cho GPU'),
('GPU_POWER_CONNECTOR', 'Đầu nguồn GPU', 'Tương thích', NULL, 'TEXT', 3, FALSE, TRUE, TRUE, 'Đầu nguồn GPU'),
('GPU_TARGET_RESOLUTION', 'Độ phân giải chơi game phù hợp', 'Nhu cầu sử dụng', NULL, 'TEXT', 4, FALSE, TRUE, TRUE, 'Độ phân giải chơi game phù hợp'),
('GPU_TGP_W', 'Công suất GPU', 'Điện năng', 'W', 'NUMBER', 5, FALSE, TRUE, TRUE, 'Công suất GPU'),
('COOLER_TYPE', 'Loại tản nhiệt', 'Thông số tản nhiệt', NULL, 'TEXT', 1, TRUE, TRUE, TRUE, 'Loại tản nhiệt'),
('COOLER_RADIATOR_SIZE_MM', 'Kích thước radiator', 'Thông số tản nhiệt', 'mm', 'NUMBER', 2, TRUE, TRUE, TRUE, 'Kích thước radiator'),
('COOLER_SOCKET_SUPPORT', 'Socket hỗ trợ', 'Tương thích', NULL, 'TEXT', 3, TRUE, TRUE, TRUE, 'Socket hỗ trợ'),
('COOLER_FAN_SIZE_MM', 'Kích thước quạt', 'Thông số tản nhiệt', 'mm', 'NUMBER', 4, FALSE, TRUE, TRUE, 'Kích thước quạt')
ON DUPLICATE KEY UPDATE
    attribute_code = VALUES(attribute_code),
    attribute_name = VALUES(attribute_name),
    spec_group = VALUES(spec_group),
    attribute_unit = VALUES(attribute_unit),
    value_type = VALUES(value_type),
    display_order = VALUES(display_order),
    is_highlight = VALUES(is_highlight),
    is_filterable = VALUES(is_filterable),
    is_ai_searchable = VALUES(is_ai_searchable),
    attribute_description = VALUES(attribute_description);

-- ------------------------------------------------------------
-- 3. GẮN THUỘC TÍNH VỚI DANH MỤC
-- ------------------------------------------------------------
INSERT IGNORE INTO category_attributes (category_id, attribute_id)
SELECT c.category_id, pa.attribute_id
FROM categories c
CROSS JOIN product_attributes pa
WHERE c.category_slug = 'laptop'
  AND pa.attribute_code IN ('BATTERY_CAPACITY_WH', 'COLOR', 'COMPATIBILITY_NOTE', 'CPU_MODEL', 'GAMING_CAPABILITY', 'GPU_MODEL', 'MULTITASKING_LEVEL', 'OPERATING_SYSTEM', 'PERFORMANCE_LEVEL', 'PRODUCT_TYPE', 'RAM_CAPACITY_GB', 'SCREEN_REFRESH_RATE_HZ', 'SCREEN_SIZE_INCH', 'STORAGE_CAPACITY_GB', 'TARGET_USER', 'USE_CASE', 'WEIGHT_KG');
INSERT IGNORE INTO category_attributes (category_id, attribute_id)
SELECT c.category_id, pa.attribute_id
FROM categories c
CROSS JOIN product_attributes pa
WHERE c.category_slug = 'dien-thoai'
  AND pa.attribute_code IN ('BATTERY_CAPACITY_MAH', 'CAMERA_CAPABILITY', 'CHARGING_POWER_W', 'COLOR', 'COMPATIBILITY_NOTE', 'GAMING_CAPABILITY', 'MAIN_CAMERA_MP', 'MULTITASKING_LEVEL', 'OPERATING_SYSTEM', 'PERFORMANCE_LEVEL', 'PHONE_CHIPSET', 'PHONE_GAMING_LEVEL', 'PHONE_RAM_GB', 'PHONE_STORAGE_GB', 'PRODUCT_TYPE', 'SCREEN_REFRESH_RATE_HZ', 'SCREEN_SIZE_INCH', 'TARGET_USER', 'USE_CASE');
INSERT IGNORE INTO category_attributes (category_id, attribute_id)
SELECT c.category_id, pa.attribute_id
FROM categories c
CROSS JOIN product_attributes pa
WHERE c.category_slug = 'phu-kien'
  AND pa.attribute_code IN ('ACCESSORY_TYPE', 'AUDIO_DRIVER_MM', 'BATTERY_LIFE_HOURS', 'CHARGING_POWER_W', 'COLOR', 'COMPATIBILITY_NOTE', 'COMPATIBLE_DEVICE', 'CONNECTION_TYPE', 'GAMING_CAPABILITY', 'KEYBOARD_SWITCH', 'MATERIAL', 'MOUSE_DPI', 'MULTITASKING_LEVEL', 'PERFORMANCE_LEVEL', 'PRODUCT_TYPE', 'SPEAKER_POWER_W', 'TARGET_USER', 'USE_CASE', 'WATER_RESISTANCE', 'WEIGHT_G');
INSERT IGNORE INTO category_attributes (category_id, attribute_id)
SELECT c.category_id, pa.attribute_id
FROM categories c
CROSS JOIN product_attributes pa
WHERE c.category_slug = 'linh-kien-pc'
  AND pa.attribute_code IN ('CASE_FORM_FACTOR', 'CASE_MAX_GPU_LENGTH_MM', 'CASE_MOTHERBOARD_SUPPORT', 'CASE_WEIGHT_KG', 'COLOR', 'COMPATIBILITY_NOTE', 'COOLER_FAN_SIZE_MM', 'COOLER_RADIATOR_SIZE_MM', 'COOLER_SOCKET_SUPPORT', 'COOLER_TYPE', 'CPU_BASE_POWER_W', 'CPU_BOOST_CLOCK_GHZ', 'CPU_CORE_COUNT', 'CPU_MODEL', 'CPU_SOCKET', 'CPU_THREAD_COUNT', 'GAMING_CAPABILITY', 'GPU_MODEL', 'GPU_POWER_CONNECTOR', 'GPU_RECOMMENDED_PSU_W', 'GPU_TARGET_RESOLUTION', 'GPU_TGP_W', 'GPU_VRAM_GB', 'MOTHERBOARD_CHIPSET', 'MOTHERBOARD_FORM_FACTOR', 'MOTHERBOARD_RAM_TYPE', 'MOTHERBOARD_SOCKET', 'MOTHERBOARD_WIFI', 'MULTITASKING_LEVEL', 'PERFORMANCE_LEVEL', 'PRODUCT_TYPE', 'PSU_EFFICIENCY', 'PSU_FORM_FACTOR', 'PSU_MODULAR_TYPE', 'PSU_POWER_W', 'RAM_CAPACITY_GB', 'RAM_CAS_LATENCY', 'RAM_DEVICE_COMPATIBILITY', 'RAM_FORM_FACTOR', 'RAM_MODULE_COUNT', 'RAM_RECOMMENDED_TAB_COUNT', 'RAM_SPEED_MHZ', 'RAM_TYPE', 'RAM_VOLTAGE', 'SSD_CAPACITY_GB', 'SSD_FORM_FACTOR', 'SSD_INTERFACE', 'SSD_READ_SPEED_MBPS', 'SSD_WRITE_SPEED_MBPS', 'TARGET_USER', 'USE_CASE');

-- ------------------------------------------------------------
-- 4. DỮ LIỆU MÔ TẢ + THÔNG SỐ CỦA 40 SẢN PHẨM
-- ------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS tmp_full_product_specs;

CREATE TEMPORARY TABLE tmp_full_product_specs (
    product_slug VARCHAR(220)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NOT NULL
        PRIMARY KEY,

    brand_name VARCHAR(150)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NOT NULL,

    product_description TEXT
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NOT NULL,

    specs JSON NOT NULL
)
ENGINE = InnoDB
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Có thể chạy riêng lệnh dưới để kiểm tra cấu trúc/collation của bảng tạm.
SHOW CREATE TABLE tmp_full_product_specs;

INSERT INTO tmp_full_product_specs (
    product_slug,
    brand_name,
    product_description,
    specs
)
VALUES
('asus-rog', 'ASUS', 'Laptop gaming cao cấp dành cho game AAA, eSports và công việc đồ họa nặng.', '{"PRODUCT_TYPE":"Laptop","TARGET_USER":"Game thủ, streamer và người làm đồ họa","USE_CASE":"Gaming AAA, eSports, render, dựng video và đa nhiệm nặng","PERFORMANCE_LEVEL":"Rất cao","GAMING_CAPABILITY":"Game AAA thiết lập cao","MULTITASKING_LEVEL":"Đa nhiệm rất cao","COMPATIBILITY_NOTE":"Phù hợp người cần hiệu năng mạnh, ưu tiên dùng nguồn điện khi chơi game","CPU_MODEL":"Intel Core i9-13980HX","RAM_CAPACITY_GB":32,"STORAGE_CAPACITY_GB":1024,"GPU_MODEL":"NVIDIA GeForce RTX 4080 12GB","SCREEN_SIZE_INCH":16,"SCREEN_REFRESH_RATE_HZ":240,"OPERATING_SYSTEM":"Windows 11","WEIGHT_KG":2.5,"BATTERY_CAPACITY_WH":90,"COLOR":"Eclipse Gray"}'),
('lenovo-thinkpad', 'Lenovo', 'Laptop doanh nhân bền bỉ, bàn phím tốt và phù hợp làm việc chuyên nghiệp.', '{"PRODUCT_TYPE":"Laptop","TARGET_USER":"Doanh nhân, nhân viên văn phòng và lập trình viên","USE_CASE":"Văn phòng, lập trình, họp trực tuyến và di chuyển thường xuyên","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Game nhẹ","MULTITASKING_LEVEL":"Đa nhiệm cao","COMPATIBILITY_NOTE":"Ưu tiên độ bền, bảo mật và tính di động","CPU_MODEL":"Intel Core i7-1355U","RAM_CAPACITY_GB":16,"STORAGE_CAPACITY_GB":512,"GPU_MODEL":"Intel Iris Xe","SCREEN_SIZE_INCH":14,"SCREEN_REFRESH_RATE_HZ":60,"OPERATING_SYSTEM":"Windows 11 Pro","WEIGHT_KG":1.12,"BATTERY_CAPACITY_WH":57,"COLOR":"Deep Black"}'),
('hp-victus', 'HP', 'Laptop gaming tầm trung cân bằng giữa học tập, làm việc và chơi game.', '{"PRODUCT_TYPE":"Laptop","TARGET_USER":"Sinh viên, game thủ và người làm nội dung","USE_CASE":"Học tập, lập trình, gaming và chỉnh sửa video","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Game AAA thiết lập trung bình đến cao","MULTITASKING_LEVEL":"Đa nhiệm cao","COMPATIBILITY_NOTE":"Phù hợp nhu cầu gaming tầm trung và công việc đồ họa","CPU_MODEL":"AMD Ryzen 7 7840HS","RAM_CAPACITY_GB":16,"STORAGE_CAPACITY_GB":512,"GPU_MODEL":"NVIDIA GeForce RTX 4050 6GB","SCREEN_SIZE_INCH":16.1,"SCREEN_REFRESH_RATE_HZ":144,"OPERATING_SYSTEM":"Windows 11","WEIGHT_KG":2.3,"BATTERY_CAPACITY_WH":70,"COLOR":"Mica Silver"}'),
('acer-swift', 'Acer', 'Laptop mỏng nhẹ với màn hình đẹp, phù hợp học tập và công việc văn phòng.', '{"PRODUCT_TYPE":"Laptop","TARGET_USER":"Sinh viên, nhân viên văn phòng và người di chuyển nhiều","USE_CASE":"Học tập, văn phòng, lập trình và chỉnh sửa ảnh cơ bản","PERFORMANCE_LEVEL":"Khá","GAMING_CAPABILITY":"Game nhẹ","MULTITASKING_LEVEL":"Đa nhiệm khá","COMPATIBILITY_NOTE":"Ưu tiên tính di động và thời lượng pin","CPU_MODEL":"Intel Core Ultra 7 155H","RAM_CAPACITY_GB":16,"STORAGE_CAPACITY_GB":512,"GPU_MODEL":"Intel Arc Graphics","SCREEN_SIZE_INCH":14,"SCREEN_REFRESH_RATE_HZ":90,"OPERATING_SYSTEM":"Windows 11","WEIGHT_KG":1.3,"BATTERY_CAPACITY_WH":65,"COLOR":"Silver"}'),
('msi-katana', 'MSI', 'Laptop gaming hiệu năng cao với màn hình tần số quét nhanh và GPU rời.', '{"PRODUCT_TYPE":"Laptop","TARGET_USER":"Game thủ và sinh viên ngành kỹ thuật","USE_CASE":"Gaming, lập trình, dựng hình và đa nhiệm","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Game AAA thiết lập cao","MULTITASKING_LEVEL":"Đa nhiệm cao","COMPATIBILITY_NOTE":"Phù hợp người cần GPU rời và màn hình tần số quét cao","CPU_MODEL":"Intel Core i7-13620H","RAM_CAPACITY_GB":16,"STORAGE_CAPACITY_GB":512,"GPU_MODEL":"NVIDIA GeForce RTX 4060 8GB","SCREEN_SIZE_INCH":15.6,"SCREEN_REFRESH_RATE_HZ":144,"OPERATING_SYSTEM":"Windows 11","WEIGHT_KG":2.25,"BATTERY_CAPACITY_WH":53.5,"COLOR":"Black"}'),
('macbook-air', 'Apple', 'Laptop mỏng nhẹ dùng chip Apple M2, vận hành êm và thời lượng pin tốt.', '{"PRODUCT_TYPE":"Laptop","TARGET_USER":"Sinh viên, nhân viên văn phòng và người sáng tạo nội dung","USE_CASE":"Văn phòng, lập trình, chỉnh sửa ảnh và dựng video nhẹ","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Game nhẹ","MULTITASKING_LEVEL":"Đa nhiệm khá","COMPATIBILITY_NOTE":"Sử dụng hệ sinh thái macOS, cần kiểm tra phần mềm chuyên dụng trước khi mua","CPU_MODEL":"Apple M2 8-core","RAM_CAPACITY_GB":8,"STORAGE_CAPACITY_GB":256,"GPU_MODEL":"Apple GPU 8-core","SCREEN_SIZE_INCH":13.6,"SCREEN_REFRESH_RATE_HZ":60,"OPERATING_SYSTEM":"macOS","WEIGHT_KG":1.24,"BATTERY_CAPACITY_WH":52.6,"COLOR":"Midnight"}'),
('dell-inspiron', 'Dell', 'Laptop phổ thông phù hợp học tập, văn phòng và lập trình cơ bản.', '{"PRODUCT_TYPE":"Laptop","TARGET_USER":"Học sinh, sinh viên và nhân viên văn phòng","USE_CASE":"Học tập, văn phòng, lập trình cơ bản và họp trực tuyến","PERFORMANCE_LEVEL":"Khá","GAMING_CAPABILITY":"Game nhẹ","MULTITASKING_LEVEL":"Đa nhiệm cơ bản đến khá","COMPATIBILITY_NOTE":"Phù hợp nhu cầu phổ thông và học tập","CPU_MODEL":"Intel Core i5-1335U","RAM_CAPACITY_GB":8,"STORAGE_CAPACITY_GB":512,"GPU_MODEL":"Intel Iris Xe","SCREEN_SIZE_INCH":15.6,"SCREEN_REFRESH_RATE_HZ":60,"OPERATING_SYSTEM":"Windows 11","WEIGHT_KG":1.65,"BATTERY_CAPACITY_WH":54,"COLOR":"Platinum Silver"}'),
('gigabyte-g5', 'Gigabyte', 'Laptop gaming phổ thông với GPU RTX 4050 và màn hình 144Hz.', '{"PRODUCT_TYPE":"Laptop","TARGET_USER":"Sinh viên kỹ thuật và game thủ","USE_CASE":"Gaming, học tập, lập trình và đồ họa","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Game AAA thiết lập trung bình","MULTITASKING_LEVEL":"Đa nhiệm cao","COMPATIBILITY_NOTE":"Phù hợp gaming tầm trung, nên sử dụng nguồn điện khi tải nặng","CPU_MODEL":"Intel Core i5-12500H","RAM_CAPACITY_GB":16,"STORAGE_CAPACITY_GB":512,"GPU_MODEL":"NVIDIA GeForce RTX 4050 6GB","SCREEN_SIZE_INCH":15.6,"SCREEN_REFRESH_RATE_HZ":144,"OPERATING_SYSTEM":"Windows 11","WEIGHT_KG":2.08,"BATTERY_CAPACITY_WH":54,"COLOR":"Black"}'),
('macbook-pro-m3', 'Apple', 'Laptop chuyên nghiệp dùng chip Apple M3 Pro, phù hợp sáng tạo nội dung và lập trình.', '{"PRODUCT_TYPE":"Laptop","TARGET_USER":"Lập trình viên, designer và nhà sáng tạo nội dung","USE_CASE":"Lập trình, dựng video, thiết kế, xử lý ảnh và đa nhiệm nặng","PERFORMANCE_LEVEL":"Rất cao","GAMING_CAPABILITY":"Game nhẹ đến trung bình","MULTITASKING_LEVEL":"Đa nhiệm rất cao","COMPATIBILITY_NOTE":"Dùng macOS, phù hợp hệ sinh thái Apple và phần mềm sáng tạo","CPU_MODEL":"Apple M3 Pro","RAM_CAPACITY_GB":18,"STORAGE_CAPACITY_GB":512,"GPU_MODEL":"Apple GPU 14-core","SCREEN_SIZE_INCH":14.2,"SCREEN_REFRESH_RATE_HZ":120,"OPERATING_SYSTEM":"macOS","WEIGHT_KG":1.61,"BATTERY_CAPACITY_WH":72.4,"COLOR":"Space Black"}'),
('hp-elitebook', 'HP', 'Laptop doanh nghiệp có thiết kế bền bỉ, bảo mật tốt và tính di động cao.', '{"PRODUCT_TYPE":"Laptop","TARGET_USER":"Doanh nhân và nhân viên văn phòng","USE_CASE":"Văn phòng, họp trực tuyến, quản trị và di chuyển","PERFORMANCE_LEVEL":"Khá","GAMING_CAPABILITY":"Game nhẹ","MULTITASKING_LEVEL":"Đa nhiệm khá","COMPATIBILITY_NOTE":"Tập trung bảo mật, độ bền và công việc doanh nghiệp","CPU_MODEL":"Intel Core i7-1355U","RAM_CAPACITY_GB":16,"STORAGE_CAPACITY_GB":512,"GPU_MODEL":"Intel Iris Xe","SCREEN_SIZE_INCH":14,"SCREEN_REFRESH_RATE_HZ":60,"OPERATING_SYSTEM":"Windows 11 Pro","WEIGHT_KG":1.36,"BATTERY_CAPACITY_WH":51,"COLOR":"Silver"}'),
('iphone-16-pro-max', 'Apple', 'Điện thoại flagship màn hình lớn, hiệu năng mạnh và camera chuyên nghiệp.', '{"PRODUCT_TYPE":"Điện thoại","TARGET_USER":"Người dùng cao cấp và nhà sáng tạo nội dung","USE_CASE":"Chụp ảnh, quay video, làm việc, giải trí và chơi game","PERFORMANCE_LEVEL":"Rất cao","GAMING_CAPABILITY":"Game nặng","MULTITASKING_LEVEL":"Đa nhiệm cao","COMPATIBILITY_NOTE":"Sử dụng hệ sinh thái Apple và cổng USB-C","PHONE_CHIPSET":"Apple A18 Pro","PHONE_RAM_GB":8,"PHONE_STORAGE_GB":256,"BATTERY_CAPACITY_MAH":4685,"CHARGING_POWER_W":30,"MAIN_CAMERA_MP":48,"CAMERA_CAPABILITY":"Chụp ảnh và quay video chuyên nghiệp","PHONE_GAMING_LEVEL":"Game nặng","SCREEN_SIZE_INCH":6.9,"SCREEN_REFRESH_RATE_HZ":120,"OPERATING_SYSTEM":"iOS 18","COLOR":"Titan tự nhiên"}'),
('iphone-15-plus', 'Apple', 'Điện thoại màn hình lớn, pin tốt và hiệu năng ổn định cho nhu cầu hằng ngày.', '{"PRODUCT_TYPE":"Điện thoại","TARGET_USER":"Người dùng cần màn hình lớn và pin tốt","USE_CASE":"Mạng xã hội, chụp ảnh, làm việc và giải trí","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Game phổ biến","MULTITASKING_LEVEL":"Đa nhiệm khá","COMPATIBILITY_NOTE":"Sử dụng hệ sinh thái Apple và cổng USB-C","PHONE_CHIPSET":"Apple A16 Bionic","PHONE_RAM_GB":6,"PHONE_STORAGE_GB":128,"BATTERY_CAPACITY_MAH":4383,"CHARGING_POWER_W":20,"MAIN_CAMERA_MP":48,"CAMERA_CAPABILITY":"Chụp ảnh tốt và quay video ổn định","PHONE_GAMING_LEVEL":"Game phổ biến","SCREEN_SIZE_INCH":6.7,"SCREEN_REFRESH_RATE_HZ":60,"OPERATING_SYSTEM":"iOS 17","COLOR":"Black"}'),
('iphone-13-128gb', 'Apple', 'Điện thoại hiệu năng tốt, camera ổn định và kích thước dễ sử dụng.', '{"PRODUCT_TYPE":"Điện thoại","TARGET_USER":"Người dùng phổ thông và sinh viên","USE_CASE":"Mạng xã hội, chụp ảnh, học tập và giải trí","PERFORMANCE_LEVEL":"Khá","GAMING_CAPABILITY":"Game phổ biến","MULTITASKING_LEVEL":"Đa nhiệm khá","COMPATIBILITY_NOTE":"Sử dụng cổng Lightning và hệ sinh thái Apple","PHONE_CHIPSET":"Apple A15 Bionic","PHONE_RAM_GB":4,"PHONE_STORAGE_GB":128,"BATTERY_CAPACITY_MAH":3240,"CHARGING_POWER_W":20,"MAIN_CAMERA_MP":12,"CAMERA_CAPABILITY":"Chụp ảnh và quay video ổn định","PHONE_GAMING_LEVEL":"Game phổ biến","SCREEN_SIZE_INCH":6.1,"SCREEN_REFRESH_RATE_HZ":60,"OPERATING_SYSTEM":"iOS","COLOR":"Midnight"}'),
('samsung-s24-ultra', 'Samsung', 'Điện thoại flagship Android với bút S Pen, camera độ phân giải cao và màn hình 120Hz.', '{"PRODUCT_TYPE":"Điện thoại","TARGET_USER":"Người dùng cao cấp, doanh nhân và người sáng tạo nội dung","USE_CASE":"Làm việc, ghi chú, chụp ảnh, quay video và chơi game","PERFORMANCE_LEVEL":"Rất cao","GAMING_CAPABILITY":"Game nặng","MULTITASKING_LEVEL":"Đa nhiệm rất cao","COMPATIBILITY_NOTE":"Hỗ trợ S Pen và hệ sinh thái Galaxy","PHONE_CHIPSET":"Snapdragon 8 Gen 3 for Galaxy","PHONE_RAM_GB":12,"PHONE_STORAGE_GB":256,"BATTERY_CAPACITY_MAH":5000,"CHARGING_POWER_W":45,"MAIN_CAMERA_MP":200,"CAMERA_CAPABILITY":"Chụp ảnh độ phân giải cao và zoom xa","PHONE_GAMING_LEVEL":"Game nặng","SCREEN_SIZE_INCH":6.8,"SCREEN_REFRESH_RATE_HZ":120,"OPERATING_SYSTEM":"Android","COLOR":"Xám Titan"}'),
('samsung-a55', 'Samsung', 'Điện thoại tầm trung có màn hình đẹp, pin lớn và camera ổn định.', '{"PRODUCT_TYPE":"Điện thoại","TARGET_USER":"Sinh viên và người dùng phổ thông","USE_CASE":"Học tập, mạng xã hội, chụp ảnh và giải trí","PERFORMANCE_LEVEL":"Khá","GAMING_CAPABILITY":"Game phổ biến","MULTITASKING_LEVEL":"Đa nhiệm khá","COMPATIBILITY_NOTE":"Phù hợp nhu cầu hằng ngày và ưu tiên pin tốt","PHONE_CHIPSET":"Samsung Exynos 1480","PHONE_RAM_GB":8,"PHONE_STORAGE_GB":128,"BATTERY_CAPACITY_MAH":5000,"CHARGING_POWER_W":25,"MAIN_CAMERA_MP":50,"CAMERA_CAPABILITY":"Chụp ảnh khá và chống rung quang học","PHONE_GAMING_LEVEL":"Game phổ biến","SCREEN_SIZE_INCH":6.6,"SCREEN_REFRESH_RATE_HZ":120,"OPERATING_SYSTEM":"Android","COLOR":"Awesome Navy"}'),
('xiaomi-14-ultra', 'Xiaomi', 'Điện thoại flagship tập trung camera, hiệu năng và sạc nhanh.', '{"PRODUCT_TYPE":"Điện thoại","TARGET_USER":"Người yêu nhiếp ảnh và người dùng hiệu năng cao","USE_CASE":"Chụp ảnh, quay video, chơi game và đa nhiệm","PERFORMANCE_LEVEL":"Rất cao","GAMING_CAPABILITY":"Game nặng","MULTITASKING_LEVEL":"Đa nhiệm rất cao","COMPATIBILITY_NOTE":"Hỗ trợ sạc nhanh công suất cao","PHONE_CHIPSET":"Snapdragon 8 Gen 3","PHONE_RAM_GB":16,"PHONE_STORAGE_GB":512,"BATTERY_CAPACITY_MAH":5000,"CHARGING_POWER_W":90,"MAIN_CAMERA_MP":50,"CAMERA_CAPABILITY":"Chụp ảnh chuyên sâu với hệ thống camera Leica","PHONE_GAMING_LEVEL":"Game nặng","SCREEN_SIZE_INCH":6.73,"SCREEN_REFRESH_RATE_HZ":120,"OPERATING_SYSTEM":"HyperOS","COLOR":"Black"}'),
('samsung-z-flip-5', 'Samsung', 'Điện thoại gập nhỏ gọn với màn hình phụ tiện lợi và thiết kế thời trang.', '{"PRODUCT_TYPE":"Điện thoại","TARGET_USER":"Người thích thiết kế nhỏ gọn và thời trang","USE_CASE":"Mạng xã hội, chụp ảnh, liên lạc và giải trí","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Game phổ biến","MULTITASKING_LEVEL":"Đa nhiệm khá","COMPATIBILITY_NOTE":"Thiết kế gập, cần sử dụng và bảo quản bản lề cẩn thận","PHONE_CHIPSET":"Snapdragon 8 Gen 2 for Galaxy","PHONE_RAM_GB":8,"PHONE_STORAGE_GB":256,"BATTERY_CAPACITY_MAH":3700,"CHARGING_POWER_W":25,"MAIN_CAMERA_MP":12,"CAMERA_CAPABILITY":"Chụp ảnh linh hoạt với chế độ gập","PHONE_GAMING_LEVEL":"Game phổ biến","SCREEN_SIZE_INCH":6.7,"SCREEN_REFRESH_RATE_HZ":120,"OPERATING_SYSTEM":"Android","COLOR":"Graphite"}'),
('iphone-12-64gb', 'Apple', 'Điện thoại nhỏ gọn, hiệu năng ổn định và hỗ trợ hệ sinh thái Apple.', '{"PRODUCT_TYPE":"Điện thoại","TARGET_USER":"Người dùng phổ thông","USE_CASE":"Liên lạc, mạng xã hội, chụp ảnh và giải trí","PERFORMANCE_LEVEL":"Khá","GAMING_CAPABILITY":"Game phổ biến","MULTITASKING_LEVEL":"Đa nhiệm cơ bản","COMPATIBILITY_NOTE":"Dung lượng 64GB phù hợp người dùng lưu trữ vừa phải","PHONE_CHIPSET":"Apple A14 Bionic","PHONE_RAM_GB":4,"PHONE_STORAGE_GB":64,"BATTERY_CAPACITY_MAH":2815,"CHARGING_POWER_W":20,"MAIN_CAMERA_MP":12,"CAMERA_CAPABILITY":"Chụp ảnh và quay video ổn định","PHONE_GAMING_LEVEL":"Game phổ biến","SCREEN_SIZE_INCH":6.1,"SCREEN_REFRESH_RATE_HZ":60,"OPERATING_SYSTEM":"iOS","COLOR":"Black"}'),
('oppo-find-x7', 'OPPO', 'Điện thoại flagship có camera mạnh, sạc nhanh và hiệu năng cao.', '{"PRODUCT_TYPE":"Điện thoại","TARGET_USER":"Người yêu nhiếp ảnh và người dùng cao cấp","USE_CASE":"Chụp ảnh, quay video, chơi game và đa nhiệm","PERFORMANCE_LEVEL":"Rất cao","GAMING_CAPABILITY":"Game nặng","MULTITASKING_LEVEL":"Đa nhiệm rất cao","COMPATIBILITY_NOTE":"Ưu tiên camera và sạc nhanh","PHONE_CHIPSET":"Snapdragon 8 Gen 3","PHONE_RAM_GB":16,"PHONE_STORAGE_GB":512,"BATTERY_CAPACITY_MAH":5000,"CHARGING_POWER_W":100,"MAIN_CAMERA_MP":50,"CAMERA_CAPABILITY":"Chụp ảnh cao cấp và zoom quang học","PHONE_GAMING_LEVEL":"Game nặng","SCREEN_SIZE_INCH":6.82,"SCREEN_REFRESH_RATE_HZ":120,"OPERATING_SYSTEM":"ColorOS","COLOR":"Black"}'),
('samsung-s23-fe', 'Samsung', 'Điện thoại cận cao cấp có màn hình 120Hz, camera tốt và hiệu năng mạnh.', '{"PRODUCT_TYPE":"Điện thoại","TARGET_USER":"Sinh viên và người dùng cần hiệu năng tốt","USE_CASE":"Chụp ảnh, mạng xã hội, làm việc và chơi game","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Game phổ biến đến nặng","MULTITASKING_LEVEL":"Đa nhiệm cao","COMPATIBILITY_NOTE":"Phù hợp người cần trải nghiệm flagship với chi phí hợp lý","PHONE_CHIPSET":"Samsung Exynos 2200","PHONE_RAM_GB":8,"PHONE_STORAGE_GB":128,"BATTERY_CAPACITY_MAH":4500,"CHARGING_POWER_W":25,"MAIN_CAMERA_MP":50,"CAMERA_CAPABILITY":"Chụp ảnh tốt và hỗ trợ chống rung","PHONE_GAMING_LEVEL":"Game phổ biến đến nặng","SCREEN_SIZE_INCH":6.4,"SCREEN_REFRESH_RATE_HZ":120,"OPERATING_SYSTEM":"Android","COLOR":"Graphite"}'),
('logitech-g-pro-x', 'Logitech', 'Tai nghe gaming có micro rời, âm thanh rõ và phù hợp thi đấu.', '{"PRODUCT_TYPE":"Phụ kiện","TARGET_USER":"Game thủ và streamer","USE_CASE":"Chơi game, giao tiếp và livestream","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Phù hợp gaming cạnh tranh","MULTITASKING_LEVEL":"Không áp dụng","COMPATIBILITY_NOTE":"Tương thích PC và thiết bị có cổng 3.5mm hoặc USB","ACCESSORY_TYPE":"Tai nghe gaming","CONNECTION_TYPE":"3.5mm và USB","COMPATIBLE_DEVICE":"PC, laptop và console","AUDIO_DRIVER_MM":50,"WEIGHT_G":320,"COLOR":"Black"}'),
('razer-deathadder-v3', 'Razer', 'Chuột gaming công thái học, trọng lượng nhẹ và cảm biến độ phân giải cao.', '{"PRODUCT_TYPE":"Phụ kiện","TARGET_USER":"Game thủ FPS và người dùng cần chuột công thái học","USE_CASE":"Gaming và làm việc","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Phù hợp eSports và FPS","MULTITASKING_LEVEL":"Không áp dụng","COMPATIBILITY_NOTE":"Tương thích PC qua cổng USB","ACCESSORY_TYPE":"Chuột gaming","CONNECTION_TYPE":"USB có dây","COMPATIBLE_DEVICE":"PC và laptop","MOUSE_DPI":30000,"WEIGHT_G":59,"COLOR":"Black"}'),
('hyperx-cloud-alpha', 'HyperX', 'Tai nghe gaming chụp tai có âm thanh mạnh và micro tháo rời.', '{"PRODUCT_TYPE":"Phụ kiện","TARGET_USER":"Game thủ và người học trực tuyến","USE_CASE":"Gaming, gọi thoại và học trực tuyến","PERFORMANCE_LEVEL":"Khá","GAMING_CAPABILITY":"Phù hợp gaming","MULTITASKING_LEVEL":"Không áp dụng","COMPATIBILITY_NOTE":"Tương thích thiết bị có cổng âm thanh 3.5mm","ACCESSORY_TYPE":"Tai nghe gaming","CONNECTION_TYPE":"3.5mm có dây","COMPATIBLE_DEVICE":"PC, laptop, console và điện thoại","AUDIO_DRIVER_MM":50,"WEIGHT_G":336,"COLOR":"Black Red"}'),
('keychron-q1-pro', 'Keychron', 'Bàn phím cơ cao cấp hỗ trợ Bluetooth và USB-C, phù hợp làm việc và gaming.', '{"PRODUCT_TYPE":"Phụ kiện","TARGET_USER":"Lập trình viên, người gõ nhiều và game thủ","USE_CASE":"Gõ văn bản, lập trình và gaming","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Phù hợp gaming","MULTITASKING_LEVEL":"Không áp dụng","COMPATIBILITY_NOTE":"Hỗ trợ Windows, macOS và kết nối đa thiết bị","ACCESSORY_TYPE":"Bàn phím cơ","CONNECTION_TYPE":"Bluetooth và USB-C","COMPATIBLE_DEVICE":"PC, laptop, macOS và thiết bị di động","KEYBOARD_SWITCH":"Keychron K Pro Mechanical","BATTERY_LIFE_HOURS":100,"WEIGHT_G":1800,"COLOR":"Carbon Black"}'),
('anker-735-gan', 'Anker', 'Củ sạc GaN công suất 65W nhỏ gọn, hỗ trợ nhiều cổng sạc.', '{"PRODUCT_TYPE":"Phụ kiện","TARGET_USER":"Người dùng laptop, điện thoại và máy tính bảng","USE_CASE":"Sạc nhanh nhiều thiết bị","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Không áp dụng","MULTITASKING_LEVEL":"Sạc đồng thời nhiều thiết bị","COMPATIBILITY_NOTE":"Thiết bị cần hỗ trợ USB Power Delivery để đạt công suất tối đa","ACCESSORY_TYPE":"Củ sạc GaN","CONNECTION_TYPE":"2 USB-C và 1 USB-A","COMPATIBLE_DEVICE":"Laptop, điện thoại và máy tính bảng","CHARGING_POWER_W":65,"WEIGHT_G":132,"COLOR":"Black"}'),
('sony-wh-1000xm5', 'Sony', 'Tai nghe chống ồn chủ động cao cấp, pin dài và âm thanh chi tiết.', '{"PRODUCT_TYPE":"Phụ kiện","TARGET_USER":"Người đi làm, di chuyển và yêu âm nhạc","USE_CASE":"Nghe nhạc, họp trực tuyến và di chuyển","PERFORMANCE_LEVEL":"Rất cao","GAMING_CAPABILITY":"Game nhẹ","MULTITASKING_LEVEL":"Kết nối và làm việc dài giờ","COMPATIBILITY_NOTE":"Hỗ trợ Bluetooth, cần sạc pin định kỳ","ACCESSORY_TYPE":"Tai nghe Bluetooth chống ồn","CONNECTION_TYPE":"Bluetooth và 3.5mm","COMPATIBLE_DEVICE":"Điện thoại, laptop và máy tính bảng","AUDIO_DRIVER_MM":30,"BATTERY_LIFE_HOURS":30,"WEIGHT_G":250,"COLOR":"Black"}'),
('baseus-holder', 'Baseus', 'Giá đỡ điện thoại nhỏ gọn, điều chỉnh góc nhìn và phù hợp bàn làm việc.', '{"PRODUCT_TYPE":"Phụ kiện","TARGET_USER":"Người học, làm việc và xem nội dung trên điện thoại","USE_CASE":"Giữ điện thoại trên bàn và gọi video","PERFORMANCE_LEVEL":"Cơ bản","GAMING_CAPABILITY":"Không áp dụng","MULTITASKING_LEVEL":"Không áp dụng","COMPATIBILITY_NOTE":"Phù hợp đa số điện thoại, cần kiểm tra kích thước thiết bị","ACCESSORY_TYPE":"Giá đỡ điện thoại","CONNECTION_TYPE":"Không dây","COMPATIBLE_DEVICE":"Điện thoại","MATERIAL":"Hợp kim nhôm và silicone","WEIGHT_G":180,"COLOR":"Silver"}'),
('apple-magic-mouse', 'Apple', 'Chuột không dây cảm ứng đa điểm, thiết kế mỏng và tối ưu cho macOS.', '{"PRODUCT_TYPE":"Phụ kiện","TARGET_USER":"Người dùng Mac và nhân viên văn phòng","USE_CASE":"Văn phòng, thiết kế và thao tác đa điểm","PERFORMANCE_LEVEL":"Khá","GAMING_CAPABILITY":"Không phù hợp gaming cạnh tranh","MULTITASKING_LEVEL":"Không áp dụng","COMPATIBILITY_NOTE":"Tối ưu cho macOS và kết nối Bluetooth","ACCESSORY_TYPE":"Chuột không dây","CONNECTION_TYPE":"Bluetooth","COMPATIBLE_DEVICE":"Mac và iPad","BATTERY_LIFE_HOURS":720,"WEIGHT_G":99,"COLOR":"White"}'),
('jbl-flip-6', 'JBL', 'Loa Bluetooth di động có khả năng chống nước và thời lượng pin tốt.', '{"PRODUCT_TYPE":"Phụ kiện","TARGET_USER":"Người nghe nhạc, du lịch và hoạt động ngoài trời","USE_CASE":"Nghe nhạc trong nhà và ngoài trời","PERFORMANCE_LEVEL":"Khá","GAMING_CAPABILITY":"Không áp dụng","MULTITASKING_LEVEL":"Không áp dụng","COMPATIBILITY_NOTE":"Kết nối Bluetooth, cần sạc pin định kỳ","ACCESSORY_TYPE":"Loa Bluetooth","CONNECTION_TYPE":"Bluetooth","COMPATIBLE_DEVICE":"Điện thoại, laptop và máy tính bảng","SPEAKER_POWER_W":30,"BATTERY_LIFE_HOURS":12,"WATER_RESISTANCE":"IP67","WEIGHT_G":550,"COLOR":"Black"}'),
('logitech-mx-master', 'Logitech', 'Chuột không dây cao cấp cho công việc, cuộn nhanh và hỗ trợ nhiều thiết bị.', '{"PRODUCT_TYPE":"Phụ kiện","TARGET_USER":"Nhân viên văn phòng, designer và lập trình viên","USE_CASE":"Làm việc đa thiết bị, thiết kế và văn phòng","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Game nhẹ","MULTITASKING_LEVEL":"Kết nối nhiều thiết bị","COMPATIBILITY_NOTE":"Hỗ trợ Bluetooth và đầu thu Logi Bolt","ACCESSORY_TYPE":"Chuột không dây","CONNECTION_TYPE":"Bluetooth và Logi Bolt","COMPATIBLE_DEVICE":"PC, laptop và macOS","MOUSE_DPI":8000,"BATTERY_LIFE_HOURS":1680,"WEIGHT_G":141,"COLOR":"Graphite"}'),
('cpu-i9-14900k', 'Intel', 'CPU desktop hiệu năng rất cao dành cho gaming, render và đa nhiệm nặng.', '{"PRODUCT_TYPE":"CPU","TARGET_USER":"Game thủ, streamer và người làm render","USE_CASE":"Gaming cao cấp, render và biên dịch","PERFORMANCE_LEVEL":"Rất cao","GAMING_CAPABILITY":"Game AAA cao cấp","MULTITASKING_LEVEL":"Đa nhiệm rất cao","COMPATIBILITY_NOTE":"Cần mainboard socket LGA1700 và tản nhiệt công suất cao","CPU_MODEL":"Intel Core i9-14900K","CPU_SOCKET":"LGA1700","CPU_CORE_COUNT":24,"CPU_THREAD_COUNT":32,"CPU_BOOST_CLOCK_GHZ":6.0,"CPU_BASE_POWER_W":125,"GPU_MODEL":"Intel UHD Graphics 770"}'),
('ram-corsair-32gb', 'Corsair', 'Bộ RAM DDR5 dung lượng 32GB, phù hợp gaming và đa nhiệm nặng.', '{"PRODUCT_TYPE":"RAM","TARGET_USER":"Game thủ, người làm đồ họa và lập trình viên","USE_CASE":"Nâng cấp RAM, gaming và đa nhiệm","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Hỗ trợ gaming cao cấp","MULTITASKING_LEVEL":"Đa nhiệm cao","COMPATIBILITY_NOTE":"Cần mainboard hỗ trợ DDR5 và khe DIMM desktop","RAM_CAPACITY_GB":32,"RAM_TYPE":"DDR5","RAM_SPEED_MHZ":6000,"RAM_FORM_FACTOR":"DIMM","RAM_MODULE_COUNT":2,"RAM_CAS_LATENCY":36,"RAM_VOLTAGE":1.35,"RAM_DEVICE_COMPATIBILITY":"Desktop","RAM_RECOMMENDED_TAB_COUNT":40}'),
('ssd-samsung-990pro', 'Samsung', 'SSD NVMe PCIe 4.0 tốc độ cao, phù hợp gaming và công việc chuyên nghiệp.', '{"PRODUCT_TYPE":"SSD","TARGET_USER":"Game thủ và người cần tốc độ lưu trữ cao","USE_CASE":"Cài hệ điều hành, game và xử lý dữ liệu","PERFORMANCE_LEVEL":"Rất cao","GAMING_CAPABILITY":"Rút ngắn thời gian tải game","MULTITASKING_LEVEL":"Truy xuất dữ liệu nhanh","COMPATIBILITY_NOTE":"Cần khe M.2 NVMe hỗ trợ PCIe 4.0","SSD_CAPACITY_GB":1024,"SSD_INTERFACE":"NVMe PCIe 4.0 x4","SSD_FORM_FACTOR":"M.2 2280","SSD_READ_SPEED_MBPS":7450,"SSD_WRITE_SPEED_MBPS":6900}'),
('case-corsair-4000d', 'Corsair', 'Vỏ máy mid-tower thoáng khí, hỗ trợ nhiều kích thước mainboard và card đồ họa dài.', '{"PRODUCT_TYPE":"Case máy tính","TARGET_USER":"Người tự lắp PC gaming và workstation","USE_CASE":"Lắp ráp PC và tối ưu luồng gió","PERFORMANCE_LEVEL":"Khá","GAMING_CAPABILITY":"Phù hợp PC gaming","MULTITASKING_LEVEL":"Không áp dụng","COMPATIBILITY_NOTE":"Cần kiểm tra kích thước mainboard, GPU và radiator trước khi lắp","CASE_FORM_FACTOR":"Mid Tower","CASE_MOTHERBOARD_SUPPORT":"ATX, Micro-ATX và Mini-ITX","CASE_MAX_GPU_LENGTH_MM":360,"CASE_WEIGHT_KG":7.8,"COLOR":"Black"}'),
('psu-coolermaster-750w', 'Cooler Master', 'Nguồn máy tính 750W hiệu suất cao, phù hợp cấu hình gaming tầm trung và cao.', '{"PRODUCT_TYPE":"Nguồn máy tính","TARGET_USER":"Người lắp PC gaming và workstation","USE_CASE":"Cấp nguồn cho hệ thống PC","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Phù hợp cấu hình gaming cao","MULTITASKING_LEVEL":"Không áp dụng","COMPATIBILITY_NOTE":"Cần tính tổng công suất CPU và GPU trước khi chọn nguồn","PSU_POWER_W":750,"PSU_EFFICIENCY":"80 Plus Gold","PSU_MODULAR_TYPE":"Fully Modular","PSU_FORM_FACTOR":"ATX"}'),
('main-asus-z790', 'ASUS', 'Mainboard chipset Z790 dành cho CPU Intel socket LGA1700 và RAM DDR5.', '{"PRODUCT_TYPE":"Mainboard","TARGET_USER":"Người lắp PC cao cấp và ép xung","USE_CASE":"Lắp PC gaming, workstation và nâng cấp","PERFORMANCE_LEVEL":"Rất cao","GAMING_CAPABILITY":"Phù hợp PC gaming cao cấp","MULTITASKING_LEVEL":"Không áp dụng","COMPATIBILITY_NOTE":"Chỉ tương thích CPU Intel socket LGA1700 và RAM DDR5","MOTHERBOARD_SOCKET":"LGA1700","MOTHERBOARD_CHIPSET":"Intel Z790","MOTHERBOARD_RAM_TYPE":"DDR5","MOTHERBOARD_FORM_FACTOR":"ATX","MOTHERBOARD_WIFI":"Wi-Fi 6E"}'),
('gpu-rtx-4070-super', 'NVIDIA', 'Card đồ họa 12GB phù hợp gaming 2K, dựng hình và ứng dụng tăng tốc GPU.', '{"PRODUCT_TYPE":"GPU","TARGET_USER":"Game thủ 2K, streamer và người làm đồ họa","USE_CASE":"Gaming, render, AI và dựng video","PERFORMANCE_LEVEL":"Rất cao","GAMING_CAPABILITY":"Game AAA 2K thiết lập cao","MULTITASKING_LEVEL":"Tăng tốc xử lý đồ họa","COMPATIBILITY_NOTE":"Đề nghị nguồn từ 650W và kiểm tra chiều dài case","GPU_MODEL":"NVIDIA GeForce RTX 4070 Super","GPU_VRAM_GB":12,"GPU_RECOMMENDED_PSU_W":650,"GPU_POWER_CONNECTOR":"16-pin 12VHPWR","GPU_TARGET_RESOLUTION":"1440p và 4K","GPU_TGP_W":220}'),
('cool-nzxt-kraken', 'NZXT', 'Tản nhiệt nước AIO dành cho CPU hiệu năng cao, thiết kế hiện đại.', '{"PRODUCT_TYPE":"Tản nhiệt CPU","TARGET_USER":"Game thủ và người dùng CPU hiệu năng cao","USE_CASE":"Làm mát CPU gaming và workstation","PERFORMANCE_LEVEL":"Cao","GAMING_CAPABILITY":"Hỗ trợ hệ thống gaming cao cấp","MULTITASKING_LEVEL":"Không áp dụng","COMPATIBILITY_NOTE":"Cần kiểm tra socket CPU và vị trí lắp radiator trong case","COOLER_TYPE":"Tản nhiệt nước AIO","COOLER_RADIATOR_SIZE_MM":240,"COOLER_SOCKET_SUPPORT":"Intel LGA1700 và AMD AM5","COOLER_FAN_SIZE_MM":120,"COLOR":"Black"}'),
('ram-kingston-16gb', 'Kingston', 'RAM DDR4 16GB phù hợp nâng cấp máy tính văn phòng và gaming phổ thông.', '{"PRODUCT_TYPE":"RAM","TARGET_USER":"Sinh viên, nhân viên văn phòng và game thủ phổ thông","USE_CASE":"Nâng cấp RAM, học tập, lập trình và gaming","PERFORMANCE_LEVEL":"Khá","GAMING_CAPABILITY":"Hỗ trợ gaming phổ thông","MULTITASKING_LEVEL":"Đa nhiệm khá","COMPATIBILITY_NOTE":"Cần mainboard hỗ trợ DDR4 và khe DIMM desktop","RAM_CAPACITY_GB":16,"RAM_TYPE":"DDR4","RAM_SPEED_MHZ":3200,"RAM_FORM_FACTOR":"DIMM","RAM_MODULE_COUNT":1,"RAM_CAS_LATENCY":16,"RAM_VOLTAGE":1.35,"RAM_DEVICE_COMPATIBILITY":"Desktop","RAM_RECOMMENDED_TAB_COUNT":20}'),
('ssd-wd-sn850x', 'Western Digital', 'SSD NVMe PCIe 4.0 dung lượng 2TB, phù hợp gaming và lưu trữ tốc độ cao.', '{"PRODUCT_TYPE":"SSD","TARGET_USER":"Game thủ và người cần dung lượng lớn","USE_CASE":"Cài game, hệ điều hành và lưu dữ liệu tốc độ cao","PERFORMANCE_LEVEL":"Rất cao","GAMING_CAPABILITY":"Rút ngắn thời gian tải game","MULTITASKING_LEVEL":"Truy xuất dữ liệu nhanh","COMPATIBILITY_NOTE":"Cần khe M.2 NVMe PCIe 4.0","SSD_CAPACITY_GB":2048,"SSD_INTERFACE":"NVMe PCIe 4.0 x4","SSD_FORM_FACTOR":"M.2 2280","SSD_READ_SPEED_MBPS":7300,"SSD_WRITE_SPEED_MBPS":6600}');

-- Cập nhật mô tả và thương hiệu theo đúng product_slug đang có.
UPDATE products AS p
INNER JOIN tmp_full_product_specs AS t
    ON CONVERT(p.product_slug USING utf8mb4)
       COLLATE utf8mb4_unicode_ci
       =
       CONVERT(t.product_slug USING utf8mb4)
       COLLATE utf8mb4_unicode_ci
INNER JOIN brands AS b
    ON CONVERT(b.brand_name USING utf8mb4)
       COLLATE utf8mb4_unicode_ci
       =
       CONVERT(t.brand_name USING utf8mb4)
       COLLATE utf8mb4_unicode_ci
SET
    p.brand_id = b.brand_id,
    p.product_description = t.product_description,
    p.updated_at = NOW();

-- ------------------------------------------------------------
-- 5. CHUYỂN JSON THÀNH PRODUCT_ATTRIBUTE_VALUES
-- Đã ép toàn bộ khóa chuỗi về utf8mb4_unicode_ci để tránh lỗi 1267.
-- ------------------------------------------------------------
INSERT INTO product_attribute_values (
    product_id,
    attribute_id,
    attribute_value,
    numeric_value,
    boolean_value,
    normalized_value
)
SELECT
    p.product_id,
    pa.attribute_id,

    JSON_UNQUOTE(
        JSON_EXTRACT(
            t.specs,
            CONCAT('$."', spec_key.attribute_code, '"')
        )
    ) AS attribute_value,

    CASE
        WHEN JSON_TYPE(
            JSON_EXTRACT(
                t.specs,
                CONCAT('$."', spec_key.attribute_code, '"')
            )
        ) IN ('INTEGER', 'DOUBLE', 'DECIMAL')
        THEN CAST(
            JSON_UNQUOTE(
                JSON_EXTRACT(
                    t.specs,
                    CONCAT('$."', spec_key.attribute_code, '"')
                )
            ) AS DECIMAL(18,4)
        )
        ELSE NULL
    END AS numeric_value,

    NULL AS boolean_value,

    LOWER(
        TRIM(
            JSON_UNQUOTE(
                JSON_EXTRACT(
                    t.specs,
                    CONCAT('$."', spec_key.attribute_code, '"')
                )
            )
        )
    ) AS normalized_value

FROM tmp_full_product_specs AS t

INNER JOIN products AS p
    ON CONVERT(p.product_slug USING utf8mb4)
       COLLATE utf8mb4_unicode_ci
       =
       CONVERT(t.product_slug USING utf8mb4)
       COLLATE utf8mb4_unicode_ci

CROSS JOIN JSON_TABLE(
    JSON_KEYS(t.specs),
    '$[*]'
    COLUMNS (
        attribute_code VARCHAR(100) PATH '$'
    )
) AS spec_key

INNER JOIN product_attributes AS pa
    ON CONVERT(pa.attribute_code USING utf8mb4)
       COLLATE utf8mb4_unicode_ci
       =
       CONVERT(spec_key.attribute_code USING utf8mb4)
       COLLATE utf8mb4_unicode_ci

-- Bắt buộc có WHERE để MySQL phân biệt ON JOIN và ON DUPLICATE KEY.
WHERE 1 = 1

ON DUPLICATE KEY UPDATE
    attribute_value = VALUES(attribute_value),
    numeric_value = VALUES(numeric_value),
    boolean_value = VALUES(boolean_value),
    normalized_value = VALUES(normalized_value);

-- ------------------------------------------------------------
-- 6. KIỂM TRA SLUG NÀO KHÔNG KHỚP DATABASE
-- Kết quả đúng phải là 0 dòng.
-- ------------------------------------------------------------
SELECT
    t.product_slug,
    t.brand_name
FROM tmp_full_product_specs t
LEFT JOIN products AS p
    ON CONVERT(p.product_slug USING utf8mb4)
       COLLATE utf8mb4_unicode_ci
       =
       CONVERT(t.product_slug USING utf8mb4)
       COLLATE utf8mb4_unicode_ci
WHERE p.product_id IS NULL
ORDER BY t.product_slug;

-- ------------------------------------------------------------
-- 7. KIỂM TRA SỐ THÔNG SỐ CỦA TỪNG SẢN PHẨM
-- Tất cả 40 sản phẩm phải có specification_count > 0.
-- ------------------------------------------------------------
SELECT
    p.product_id,
    p.product_name,
    p.product_slug,
    COUNT(DISTINCT pav.attribute_id) AS specification_count
FROM products p
LEFT JOIN product_attribute_values pav
    ON pav.product_id = p.product_id
WHERE CONVERT(p.product_slug USING utf8mb4)
      COLLATE utf8mb4_unicode_ci IN (
    SELECT CONVERT(product_slug USING utf8mb4)
           COLLATE utf8mb4_unicode_ci
    FROM tmp_full_product_specs
)
GROUP BY
    p.product_id,
    p.product_name,
    p.product_slug
ORDER BY p.product_id;

-- ------------------------------------------------------------
-- 8. XEM CHI TIẾT THÔNG SỐ ĐÃ INSERT
-- ------------------------------------------------------------
SELECT
    p.product_id,
    p.product_name,
    pa.spec_group,
    pa.attribute_name,
    pav.attribute_value,
    pa.attribute_unit,
    pa.is_highlight
FROM products p
INNER JOIN product_attribute_values pav
    ON pav.product_id = p.product_id
INNER JOIN product_attributes pa
    ON pa.attribute_id = pav.attribute_id
WHERE CONVERT(p.product_slug USING utf8mb4)
      COLLATE utf8mb4_unicode_ci IN (
    SELECT CONVERT(product_slug USING utf8mb4)
           COLLATE utf8mb4_unicode_ci
    FROM tmp_full_product_specs
)
ORDER BY
    p.product_id,
    pa.spec_group,
    pa.display_order,
    pa.attribute_id;

DROP TEMPORARY TABLE IF EXISTS tmp_full_product_specs;

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

-- ============================================================
-- KẾT THÚC
-- ============================================================

-- ============================================================
-- GIỎ HÀNG, NHẬT KÝ ĐĂNG NHẬP VÀ AUDIT MẪU
-- ============================================================

INSERT IGNORE INTO carts (customer_id)
SELECT user_id
FROM users
WHERE user_email = 'customer1@gmail.com';

INSERT IGNORE INTO cart_items (
    cart_id,
    product_id,
    cart_quantity
)
SELECT
    c.cart_id,
    p.product_id,
    1
FROM carts c
JOIN users u
    ON u.user_id = c.customer_id
JOIN products p
    ON p.product_slug = 'dell-inspiron'
WHERE u.user_email = 'customer1@gmail.com';

INSERT IGNORE INTO login_logs (
    user_id,
    ip_address,
    device_info,
    login_status
)
SELECT
    user_id,
    '127.0.0.1',
    'Demo Browser',
    'SUCCESS'
FROM users
WHERE user_email IN (
    'admin@electroshop.vn',
    'staff@electroshop.vn',
    'customer1@gmail.com'
);

INSERT IGNORE INTO audit_logs (
    actor_user_id,
    action_name,
    affected_table_name,
    affected_record_id,
    action_description
)
SELECT
    u.user_id,
    'SEED_DATA',
    'products',
    p.product_id,
    CONCAT('Tạo dữ liệu mẫu cho sản phẩm ', p.product_name)
FROM users u
JOIN products p
WHERE u.user_email = 'admin@electroshop.vn'
  AND p.product_slug IN (
      'asus-rog',
      'dell-inspiron',
      'iphone-16-pro-max'
  );

SELECT
    p.product_id,
    p.product_name,
    p.base_price,
    COALESCE(
        SUM(
            CASE
                WHEN UPPER(os.order_status_code) NOT IN
                     ('CANCELLED', 'CANCELED', 'REFUNDED', 'FAILED')
                THEN oi.ordered_quantity
                ELSE 0
            END
        ),
        0
    ) AS sold_count
FROM products p
LEFT JOIN order_items oi
    ON oi.product_id = p.product_id
LEFT JOIN orders o
    ON o.order_id = oi.order_id
LEFT JOIN order_statuses os
    ON os.order_status_id = o.order_status_id
WHERE p.product_status = 'ACTIVE'
GROUP BY p.product_id, p.product_name, p.base_price
ORDER BY sold_count DESC, p.product_id DESC
LIMIT 10;

-- Tùy chọn tối ưu khi dữ liệu order_items đã lớn.
-- Chỉ chạy một lần. Nếu index đã tồn tại thì không chạy lại.
-- CREATE INDEX idx_order_items_product_order
-- ============================================================
-- SEED DỮ LIỆU TOP 10 SẢN PHẨM BÁN CHẠY - BẢN ĐÃ SỬA
-- Lưu ý: chạy TOÀN BỘ khối, không chỉ bôi đen một dòng DELETE/WHERE.
-- ============================================================

USE electroshop_db;

SET @OLD_SQL_SAFE_UPDATES := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

INSERT IGNORE INTO order_statuses (
    order_status_code,
    order_status_name
) VALUES
('DELIVERED', 'Đã giao hàng');

INSERT IGNORE INTO payment_methods (
    payment_method_code,
    payment_method_name
) VALUES
('QR_BANKING', 'Thanh toán QR chuyển khoản');

INSERT IGNORE INTO payment_statuses (
    payment_status_code,
    payment_status_name
) VALUES
('PAID', 'Đã thanh toán');

INSERT IGNORE INTO users (
    role_id,
    user_full_name,
    user_email,
    user_phone,
    password_hash,
    account_status
)
SELECT
    r.role_id,
    'Khách hàng Top Selling Demo',
    'topselling.demo@electroshop.vn',
    '0900999999',
    '$2b$10$demo_top_selling_password_hash',
    'ACTIVE'
FROM roles r
WHERE r.role_code = 'CUSTOMER';

DROP TEMPORARY TABLE IF EXISTS tmp_top_selling_seed;

CREATE TEMPORARY TABLE tmp_top_selling_seed (
    rank_no INT NOT NULL PRIMARY KEY,
    product_slug VARCHAR(255) NOT NULL,
    sold_quantity INT NOT NULL
);

INSERT INTO tmp_top_selling_seed (
    rank_no,
    product_slug,
    sold_quantity
) VALUES
(1,  'iphone-16-pro-max',  58),
(2,  'samsung-s24-ultra',  52),
(3,  'asus-rog',           47),
(4,  'macbook-air',        41),
(5,  'gpu-rtx-4070-super', 36),
(6,  'cpu-i9-14900k',      31),
(7,  'ram-corsair-32gb',   27),
(8,  'ssd-samsung-990pro', 23),
(9,  'logitech-g-pro-x',   19),
(10, 'logitech-mx-master', 15);

START TRANSACTION;

-- Xóa dữ liệu demo cũ đúng một lần.
DELETE payment_row
FROM payments AS payment_row
INNER JOIN orders AS order_row
    ON order_row.order_id = payment_row.order_id
WHERE order_row.order_code LIKE 'DEMO-TOPSELLING-%';

DELETE log_row
FROM order_status_logs AS log_row
INNER JOIN orders AS order_row
    ON order_row.order_id = log_row.order_id
WHERE order_row.order_code LIKE 'DEMO-TOPSELLING-%';

DELETE address_row
FROM order_shipping_addresses AS address_row
INNER JOIN orders AS order_row
    ON order_row.order_id = address_row.order_id
WHERE order_row.order_code LIKE 'DEMO-TOPSELLING-%';

DELETE item_row
FROM order_items AS item_row
INNER JOIN orders AS order_row
    ON order_row.order_id = item_row.order_id
WHERE order_row.order_code LIKE 'DEMO-TOPSELLING-%';

DELETE FROM orders
WHERE order_code LIKE 'DEMO-TOPSELLING-%';

-- Tạo mỗi sản phẩm một đơn đã giao.
INSERT INTO orders (
    order_code,
    customer_id,
    order_status_id,
    order_note
)
SELECT
    CONCAT('DEMO-TOPSELLING-', LPAD(seed.rank_no, 2, '0')),
    demo_customer.user_id,
    delivered_status.order_status_id,
    CONCAT(
        'Dữ liệu demo Top ',
        seed.rank_no,
        ' - số lượng bán: ',
        seed.sold_quantity
    )
FROM tmp_top_selling_seed AS seed
INNER JOIN products AS product_row
    ON product_row.product_slug = seed.product_slug
   AND product_row.product_status = 'ACTIVE'
INNER JOIN users AS demo_customer
    ON demo_customer.user_email = 'topselling.demo@electroshop.vn'
INNER JOIN order_statuses AS delivered_status
    ON delivered_status.order_status_code = 'DELIVERED';

INSERT INTO order_shipping_addresses (
    order_id,
    receiver_name,
    receiver_phone,
    shipping_province,
    shipping_district,
    shipping_ward,
    shipping_street
)
SELECT
    order_row.order_id,
    'Khách hàng Top Selling Demo',
    '0900999999',
    'Hà Nội',
    'Cầu Giấy',
    'Dịch Vọng',
    'Số 99 đường Demo ElectroShop'
FROM orders AS order_row
WHERE order_row.order_code LIKE 'DEMO-TOPSELLING-%';

INSERT INTO order_items (
    order_id,
    product_id,
    ordered_quantity,
    unit_price_at_order
)
SELECT
    order_row.order_id,
    product_row.product_id,
    seed.sold_quantity,
    product_row.base_price
FROM tmp_top_selling_seed AS seed
INNER JOIN products AS product_row
    ON product_row.product_slug = seed.product_slug
   AND product_row.product_status = 'ACTIVE'
INNER JOIN orders AS order_row
    ON order_row.order_code = CONCAT(
        'DEMO-TOPSELLING-',
        LPAD(seed.rank_no, 2, '0')
    );

INSERT INTO order_status_logs (
    order_id,
    old_order_status_id,
    new_order_status_id,
    changed_by_user_id,
    status_note
)
SELECT
    order_row.order_id,
    NULL,
    order_row.order_status_id,
    staff_user.user_id,
    'Khởi tạo dữ liệu bán chạy demo với trạng thái đã giao'
FROM orders AS order_row
LEFT JOIN users AS staff_user
    ON staff_user.user_email = 'staff@electroshop.vn'
WHERE order_row.order_code LIKE 'DEMO-TOPSELLING-%';

INSERT INTO payments (
    order_id,
    payment_method_id,
    payment_status_id,
    payment_code,
    payment_amount,
    qr_content,
    transaction_code,
    paid_at
)
SELECT
    order_row.order_id,
    payment_method.payment_method_id,
    paid_status.payment_status_id,
    CONCAT('PAY-', order_row.order_code),
    SUM(item_row.ordered_quantity * item_row.unit_price_at_order),
    CONCAT('QR|BANK|ELECTROSHOP|', order_row.order_code),
    CONCAT(
        'TXN-',
        REPLACE(order_row.order_code, 'DEMO-TOPSELLING-', 'TOP-')
    ),
    NOW()
FROM orders AS order_row
INNER JOIN order_items AS item_row
    ON item_row.order_id = order_row.order_id
INNER JOIN payment_methods AS payment_method
    ON payment_method.payment_method_code = 'QR_BANKING'
INNER JOIN payment_statuses AS paid_status
    ON paid_status.payment_status_code = 'PAID'
WHERE order_row.order_code LIKE 'DEMO-TOPSELLING-%'
GROUP BY
    order_row.order_id,
    order_row.order_code,
    payment_method.payment_method_id,
    paid_status.payment_status_id;

COMMIT;

-- Kiểm tra slug nào trong danh sách seed không tồn tại.
SELECT
    seed.rank_no,
    seed.product_slug,
    seed.sold_quantity
FROM tmp_top_selling_seed AS seed
LEFT JOIN products AS product_row
    ON product_row.product_slug = seed.product_slug
   AND product_row.product_status = 'ACTIVE'
WHERE product_row.product_id IS NULL
ORDER BY seed.rank_no;

-- Kiểm tra Top 10 đã bán.
SELECT
    product_row.product_id,
    product_row.product_name,
    product_row.product_slug,
    product_row.base_price,
    SUM(item_row.ordered_quantity) AS total_sold
FROM products AS product_row
INNER JOIN order_items AS item_row
    ON item_row.product_id = product_row.product_id
INNER JOIN orders AS order_row
    ON order_row.order_id = item_row.order_id
INNER JOIN order_statuses AS status_row
    ON status_row.order_status_id = order_row.order_status_id
WHERE status_row.order_status_code = 'DELIVERED'
GROUP BY
    product_row.product_id,
    product_row.product_name,
    product_row.product_slug,
    product_row.base_price
ORDER BY
    total_sold DESC,
    product_row.product_id ASC
LIMIT 10;

DROP TEMPORARY TABLE IF EXISTS tmp_top_selling_seed;

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

-- ============================================================
-- KẾT THÚC
-- ============================================================


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- KIỂM TRA NHANH SAU KHI INSERT
-- ============================================================

SELECT 'products' AS table_name, COUNT(*) AS total_rows FROM products
UNION ALL
SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL
SELECT 'product_variants', COUNT(*) FROM product_variants
UNION ALL
SELECT 'product_attribute_values', COUNT(*) FROM product_attribute_values
UNION ALL
SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;

SELECT
    p.product_id,
    p.product_name,
    COALESCE(vps.current_stock, 0) AS current_stock,
    COUNT(DISTINCT pav.attribute_id) AS specification_count
FROM products p
LEFT JOIN vw_product_stock vps
    ON vps.product_id = p.product_id
LEFT JOIN product_attribute_values pav
    ON pav.product_id = p.product_id
GROUP BY
    p.product_id,
    p.product_name,
    vps.current_stock
ORDER BY p.product_id;
