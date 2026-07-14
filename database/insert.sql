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

-- -------------------------
-- 12.7 PRODUCTS
-- -------------------------

INSERT IGNORE INTO products (
    category_id,
    brand_id,
    product_name,
    product_slug,
    product_description,
    base_price,
    warranty_months,
    product_status,
    created_by_user_id
)
SELECT c.category_id, b.brand_id,
       'iPhone 15 128GB',
       'iphone-15-128gb',
       'Điện thoại iPhone 15 bản 128GB, phù hợp chụp ảnh, học tập và làm việc.',
       18990000,
       12,
       'ACTIVE',
       u.user_id
FROM categories c
JOIN brands b ON b.brand_name = 'Apple'
LEFT JOIN users u ON u.user_email = 'admin@electroshop.vn'
WHERE c.category_slug = 'dien-thoai';

INSERT IGNORE INTO products (
    category_id,
    brand_id,
    product_name,
    product_slug,
    product_description,
    base_price,
    warranty_months,
    product_status,
    created_by_user_id
)
SELECT c.category_id, b.brand_id,
       'Samsung Galaxy A55 5G',
       'samsung-galaxy-a55-5g',
       'Điện thoại Samsung Galaxy A55 5G, pin tốt, màn hình đẹp, phù hợp sinh viên.',
       8990000,
       12,
       'ACTIVE',
       u.user_id
FROM categories c
JOIN brands b ON b.brand_name = 'Samsung'
LEFT JOIN users u ON u.user_email = 'admin@electroshop.vn'
WHERE c.category_slug = 'dien-thoai';

INSERT IGNORE INTO products (
    category_id,
    brand_id,
    product_name,
    product_slug,
    product_description,
    base_price,
    warranty_months,
    product_status,
    created_by_user_id
)
SELECT c.category_id, b.brand_id,
       'Dell Inspiron 15',
       'dell-inspiron-15',
       'Laptop Dell Inspiron 15 phù hợp sinh viên, văn phòng và học lập trình cơ bản.',
       13590000,
       24,
       'ACTIVE',
       u.user_id
FROM categories c
JOIN brands b ON b.brand_name = 'Dell'
LEFT JOIN users u ON u.user_email = 'admin@electroshop.vn'
WHERE c.category_slug = 'laptop';

INSERT IGNORE INTO products (
    category_id,
    brand_id,
    product_name,
    product_slug,
    product_description,
    base_price,
    warranty_months,
    product_status,
    created_by_user_id
)
SELECT c.category_id, b.brand_id,
       'Asus TUF Gaming F15',
       'asus-tuf-gaming-f15',
       'Laptop gaming Asus TUF F15, hiệu năng mạnh, phù hợp học đồ họa và chơi game.',
       19990000,
       24,
       'ACTIVE',
       u.user_id
FROM categories c
JOIN brands b ON b.brand_name = 'Asus'
LEFT JOIN users u ON u.user_email = 'admin@electroshop.vn'
WHERE c.category_slug = 'laptop';

INSERT IGNORE INTO products (
    category_id,
    brand_id,
    product_name,
    product_slug,
    product_description,
    base_price,
    warranty_months,
    product_status,
    created_by_user_id
)
SELECT c.category_id, b.brand_id,
       'Lenovo IdeaPad Slim 3',
       'lenovo-ideapad-slim-3',
       'Laptop Lenovo IdeaPad Slim 3 mỏng nhẹ, phù hợp học tập và làm việc văn phòng.',
       10990000,
       24,
       'ACTIVE',
       u.user_id
FROM categories c
JOIN brands b ON b.brand_name = 'Lenovo'
LEFT JOIN users u ON u.user_email = 'admin@electroshop.vn'
WHERE c.category_slug = 'laptop';

INSERT IGNORE INTO products (
    category_id,
    brand_id,
    product_name,
    product_slug,
    product_description,
    base_price,
    warranty_months,
    product_status,
    created_by_user_id
)
SELECT c.category_id, b.brand_id,
       'Chuột Logitech G102',
       'chuot-logitech-g102',
       'Chuột gaming Logitech G102, cảm biến tốt, phù hợp học tập và giải trí.',
       390000,
       12,
       'ACTIVE',
       u.user_id
FROM categories c
JOIN brands b ON b.brand_name = 'Logitech'
LEFT JOIN users u ON u.user_email = 'admin@electroshop.vn'
WHERE c.category_slug = 'phu-kien';

INSERT IGNORE INTO products (
    category_id,
    brand_id,
    product_name,
    product_slug,
    product_description,
    base_price,
    warranty_months,
    product_status,
    created_by_user_id
)
SELECT c.category_id, b.brand_id,
       'Màn hình LG 24 inch 75Hz',
       'man-hinh-lg-24-inch-75hz',
       'Màn hình LG 24 inch, tần số quét 75Hz, phù hợp học tập và làm việc.',
       2590000,
       24,
       'ACTIVE',
       u.user_id
FROM categories c
JOIN brands b ON b.brand_name = 'LG'
LEFT JOIN users u ON u.user_email = 'admin@electroshop.vn'
WHERE c.category_slug = 'man-hinh';

-- -------------------------
-- 12.8 PRODUCT IMAGES
-- -------------------------

INSERT IGNORE INTO product_images (product_id, image_url, is_thumbnail, sort_order)
SELECT product_id, 'https://example.com/images/iphone-15.jpg', TRUE, 1
FROM products WHERE product_slug = 'iphone-15-128gb';

INSERT IGNORE INTO product_images (product_id, image_url, is_thumbnail, sort_order)
SELECT product_id, 'https://example.com/images/samsung-a55.jpg', TRUE, 1
FROM products WHERE product_slug = 'samsung-galaxy-a55-5g';

INSERT IGNORE INTO product_images (product_id, image_url, is_thumbnail, sort_order)
SELECT product_id, 'https://example.com/images/dell-inspiron-15.jpg', TRUE, 1
FROM products WHERE product_slug = 'dell-inspiron-15';

INSERT IGNORE INTO product_images (product_id, image_url, is_thumbnail, sort_order)
SELECT product_id, 'https://example.com/images/asus-tuf-f15.jpg', TRUE, 1
FROM products WHERE product_slug = 'asus-tuf-gaming-f15';

INSERT IGNORE INTO product_images (product_id, image_url, is_thumbnail, sort_order)
SELECT product_id, 'https://example.com/images/lenovo-ideapad-slim-3.jpg', TRUE, 1
FROM products WHERE product_slug = 'lenovo-ideapad-slim-3';

-- -------------------------
-- 12.9 PRODUCT ATTRIBUTE VALUES
-- -------------------------

INSERT IGNORE INTO product_attribute_values (product_id, attribute_id, attribute_value)
SELECT p.product_id, a.attribute_id, '8'
FROM products p JOIN product_attributes a
WHERE p.product_slug = 'dell-inspiron-15' AND a.attribute_name = 'RAM';

INSERT IGNORE INTO product_attribute_values (product_id, attribute_id, attribute_value)
SELECT p.product_id, a.attribute_id, '512'
FROM products p JOIN product_attributes a
WHERE p.product_slug = 'dell-inspiron-15' AND a.attribute_name = 'Bộ nhớ trong';

INSERT IGNORE INTO product_attribute_values (product_id, attribute_id, attribute_value)
SELECT p.product_id, a.attribute_id, 'Intel Core i5'
FROM products p JOIN product_attributes a
WHERE p.product_slug = 'dell-inspiron-15' AND a.attribute_name = 'CPU';

INSERT IGNORE INTO product_attribute_values (product_id, attribute_id, attribute_value)
SELECT p.product_id, a.attribute_id, '16'
FROM products p JOIN product_attributes a
WHERE p.product_slug = 'asus-tuf-gaming-f15' AND a.attribute_name = 'RAM';

INSERT IGNORE INTO product_attribute_values (product_id, attribute_id, attribute_value)
SELECT p.product_id, a.attribute_id, '512'
FROM products p JOIN product_attributes a
WHERE p.product_slug = 'asus-tuf-gaming-f15' AND a.attribute_name = 'Bộ nhớ trong';

INSERT IGNORE INTO product_attribute_values (product_id, attribute_id, attribute_value)
SELECT p.product_id, a.attribute_id, 'NVIDIA GTX/RTX'
FROM products p JOIN product_attributes a
WHERE p.product_slug = 'asus-tuf-gaming-f15' AND a.attribute_name = 'GPU';

INSERT IGNORE INTO product_attribute_values (product_id, attribute_id, attribute_value)
SELECT p.product_id, a.attribute_id, '8'
FROM products p JOIN product_attributes a
WHERE p.product_slug = 'iphone-15-128gb' AND a.attribute_name = 'Bộ nhớ trong';

INSERT IGNORE INTO product_attribute_values (product_id, attribute_id, attribute_value)
SELECT p.product_id, a.attribute_id, 'IOS'
FROM products p JOIN product_attributes a
WHERE p.product_slug = 'iphone-15-128gb' AND a.attribute_name = 'Hệ điều hành';

-- -------------------------
-- 12.10 SUPPLIERS
-- -------------------------

INSERT IGNORE INTO suppliers (
    supplier_name,
    supplier_phone,
    supplier_email,
    supplier_address,
    supplier_status
) VALUES
('Công ty TNHH Công Nghệ Sao Việt', '02411112222', 'saoviet@example.com', 'Hà Nội', 'ACTIVE'),
('Nhà phân phối Điện Tử Minh Anh', '02833334444', 'minhanh@example.com', 'TP. Hồ Chí Minh', 'ACTIVE'),
('Công ty Phụ Kiện Việt', '02455556666', 'phukienviet@example.com', 'Đà Nẵng', 'ACTIVE');

INSERT IGNORE INTO product_suppliers (product_id, supplier_id, supplier_sku, cost_price)
SELECT p.product_id, s.supplier_id, CONCAT('SKU-', p.product_id, '-', s.supplier_id), p.base_price * 0.85
FROM products p
JOIN suppliers s
WHERE s.supplier_name = 'Công ty TNHH Công Nghệ Sao Việt'
AND p.product_slug IN ('iphone-15-128gb', 'samsung-galaxy-a55-5g', 'dell-inspiron-15');

INSERT IGNORE INTO product_suppliers (product_id, supplier_id, supplier_sku, cost_price)
SELECT p.product_id, s.supplier_id, CONCAT('SKU-', p.product_id, '-', s.supplier_id), p.base_price * 0.82
FROM products p
JOIN suppliers s
WHERE s.supplier_name = 'Nhà phân phối Điện Tử Minh Anh'
AND p.product_slug IN ('asus-tuf-gaming-f15', 'lenovo-ideapad-slim-3', 'man-hinh-lg-24-inch-75hz');

INSERT IGNORE INTO product_suppliers (product_id, supplier_id, supplier_sku, cost_price)
SELECT p.product_id, s.supplier_id, CONCAT('SKU-', p.product_id, '-', s.supplier_id), p.base_price * 0.75
FROM products p
JOIN suppliers s
WHERE s.supplier_name = 'Công ty Phụ Kiện Việt'
AND p.product_slug IN ('chuot-logitech-g102');

-- -------------------------
-- 12.11 INVENTORY TRANSACTIONS
-- -------------------------

INSERT IGNORE INTO inventory_transactions (
    product_id,
    supplier_id,
    staff_user_id,
    inventory_type_id,
    transaction_quantity,
    unit_cost,
    transaction_note
)
SELECT p.product_id, ps.supplier_id, u.user_id, itt.inventory_type_id, 30, ps.cost_price, 'Nhập kho ban đầu'
FROM products p
JOIN product_suppliers ps ON p.product_id = ps.product_id
JOIN users u ON u.user_email = 'staff@electroshop.vn'
JOIN inventory_transaction_types itt ON itt.inventory_type_code = 'IN'
WHERE p.product_slug IN (
    'iphone-15-128gb',
    'samsung-galaxy-a55-5g',
    'dell-inspiron-15',
    'asus-tuf-gaming-f15',
    'lenovo-ideapad-slim-3',
    'chuot-logitech-g102',
    'man-hinh-lg-24-inch-75hz'
);

-- -------------------------
-- 12.12 CARTS & CART ITEMS
-- -------------------------

INSERT IGNORE INTO carts (customer_id)
SELECT user_id FROM users WHERE user_email = 'customer1@gmail.com';

INSERT IGNORE INTO carts (customer_id)
SELECT user_id FROM users WHERE user_email = 'customer2@gmail.com';

INSERT IGNORE INTO cart_items (cart_id, product_id, cart_quantity)
SELECT c.cart_id, p.product_id, 1
FROM carts c
JOIN users u ON c.customer_id = u.user_id
JOIN products p ON p.product_slug = 'dell-inspiron-15'
WHERE u.user_email = 'customer1@gmail.com';

INSERT IGNORE INTO cart_items (cart_id, product_id, cart_quantity)
SELECT c.cart_id, p.product_id, 2
FROM carts c
JOIN users u ON c.customer_id = u.user_id
JOIN products p ON p.product_slug = 'chuot-logitech-g102'
WHERE u.user_email = 'customer1@gmail.com';

-- -------------------------
-- 12.13 ORDERS
-- -------------------------

INSERT IGNORE INTO orders (
    order_code,
    customer_id,
    order_status_id,
    order_note
)
SELECT 'ORD-0001', u.user_id, os.order_status_id, 'Đơn hàng demo đã giao'
FROM users u
JOIN order_statuses os ON os.order_status_code = 'DELIVERED'
WHERE u.user_email = 'customer1@gmail.com';

INSERT IGNORE INTO orders (
    order_code,
    customer_id,
    order_status_id,
    order_note
)
SELECT 'ORD-0002', u.user_id, os.order_status_id, 'Đơn hàng demo đang chờ xác nhận'
FROM users u
JOIN order_statuses os ON os.order_status_code = 'PENDING'
WHERE u.user_email = 'customer2@gmail.com';

INSERT IGNORE INTO order_shipping_addresses (
    order_id,
    receiver_name,
    receiver_phone,
    shipping_province,
    shipping_district,
    shipping_ward,
    shipping_street
)
SELECT o.order_id, 'Lê Minh Khách', '0900000003', 'Hà Nội', 'Hoàn Kiếm', 'Hàng Bạc', 'Số 12 phố Hàng Bạc'
FROM orders o
WHERE o.order_code = 'ORD-0001';

INSERT IGNORE INTO order_shipping_addresses (
    order_id,
    receiver_name,
    receiver_phone,
    shipping_province,
    shipping_district,
    shipping_ward,
    shipping_street
)
SELECT o.order_id, 'Phạm Hoàng Anh', '0900000004', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 25 đường Cầu Giấy'
FROM orders o
WHERE o.order_code = 'ORD-0002';

INSERT IGNORE INTO order_items (
    order_id,
    product_id,
    ordered_quantity,
    unit_price_at_order
)
SELECT o.order_id, p.product_id, 1, p.base_price
FROM orders o
JOIN products p ON p.product_slug = 'dell-inspiron-15'
WHERE o.order_code = 'ORD-0001';

INSERT IGNORE INTO order_items (
    order_id,
    product_id,
    ordered_quantity,
    unit_price_at_order
)
SELECT o.order_id, p.product_id, 1, p.base_price
FROM orders o
JOIN products p ON p.product_slug = 'chuot-logitech-g102'
WHERE o.order_code = 'ORD-0001';

INSERT IGNORE INTO order_items (
    order_id,
    product_id,
    ordered_quantity,
    unit_price_at_order
)
SELECT o.order_id, p.product_id, 1, p.base_price
FROM orders o
JOIN products p ON p.product_slug = 'samsung-galaxy-a55-5g'
WHERE o.order_code = 'ORD-0002';

INSERT IGNORE INTO order_status_logs (
    order_id,
    old_order_status_id,
    new_order_status_id,
    changed_by_user_id,
    status_note
)
SELECT o.order_id, NULL, os.order_status_id, u.user_id, 'Tạo đơn hàng'
FROM orders o
JOIN order_statuses os ON os.order_status_id = o.order_status_id
LEFT JOIN users u ON u.user_email = 'staff@electroshop.vn'
WHERE o.order_code IN ('ORD-0001', 'ORD-0002');

-- -------------------------
-- 12.14 PAYMENTS
-- -------------------------

INSERT IGNORE INTO payments (
    order_id,
    payment_method_id,
    payment_status_id,
    payment_code,
    payment_amount,
    qr_content,
    transaction_code,
    paid_at
)
SELECT o.order_id, pm.payment_method_id, ps.payment_status_id,
       'PAY-ORD-0001',
       SUM(oi.ordered_quantity * oi.unit_price_at_order),
       'QR|BANK|ELECTROSHOP|ORD-0001',
       'TXN0001',
       NOW()
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN payment_methods pm ON pm.payment_method_code = 'QR_BANKING'
JOIN payment_statuses ps ON ps.payment_status_code = 'PAID'
WHERE o.order_code = 'ORD-0001'
GROUP BY o.order_id, pm.payment_method_id, ps.payment_status_id;

INSERT IGNORE INTO payments (
    order_id,
    payment_method_id,
    payment_status_id,
    payment_code,
    payment_amount,
    qr_content,
    transaction_code,
    paid_at
)
SELECT o.order_id, pm.payment_method_id, ps.payment_status_id,
       'PAY-ORD-0002',
       SUM(oi.ordered_quantity * oi.unit_price_at_order),
       'QR|BANK|ELECTROSHOP|ORD-0002',
       NULL,
       NULL
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN payment_methods pm ON pm.payment_method_code = 'QR_BANKING'
JOIN payment_statuses ps ON ps.payment_status_code = 'UNPAID'
WHERE o.order_code = 'ORD-0002'
GROUP BY o.order_id, pm.payment_method_id, ps.payment_status_id;

-- -------------------------
-- 12.15 AI SEARCH LOGS & RESULTS
-- -------------------------

INSERT IGNORE INTO ai_search_logs (
    customer_id,
    query_text,
    detected_category_id,
    detected_min_price,
    detected_max_price,
    detected_purpose
)
SELECT u.user_id,
       'Tôi cần laptop 8 đến 14 triệu cho sinh viên học lập trình',
       c.category_id,
       8000000,
       14000000,
       'Sinh viên học lập trình'
FROM users u
JOIN categories c ON c.category_slug = 'laptop'
WHERE u.user_email = 'customer1@gmail.com';

INSERT IGNORE INTO ai_search_results (
    ai_search_log_id,
    product_id,
    result_rank,
    match_score
)
SELECT asl.ai_search_log_id, p.product_id, 1, 0.9500
FROM ai_search_logs asl
JOIN products p ON p.product_slug = 'dell-inspiron-15'
WHERE asl.query_text = 'Tôi cần laptop 8 đến 14 triệu cho sinh viên học lập trình';

INSERT IGNORE INTO ai_search_results (
    ai_search_log_id,
    product_id,
    result_rank,
    match_score
)
SELECT asl.ai_search_log_id, p.product_id, 2, 0.8900
FROM ai_search_logs asl
JOIN products p ON p.product_slug = 'lenovo-ideapad-slim-3'
WHERE asl.query_text = 'Tôi cần laptop 8 đến 14 triệu cho sinh viên học lập trình';

-- -------------------------
-- 12.16 LOGIN LOGS & AUDIT LOGS
-- -------------------------

INSERT IGNORE INTO login_logs (
    user_id,
    ip_address,
    device_info,
    login_status
)
SELECT user_id, '127.0.0.1', 'Demo Browser', 'SUCCESS'
FROM users
WHERE user_email IN ('admin@electroshop.vn', 'staff@electroshop.vn', 'customer1@gmail.com');

INSERT IGNORE INTO audit_logs (
    actor_user_id,
    action_name,
    affected_table_name,
    affected_record_id,
    action_description
)
SELECT u.user_id, 'SEED_DATA', 'products', p.product_id, CONCAT('Tạo dữ liệu mẫu cho sản phẩm ', p.product_name)
FROM users u
JOIN products p
WHERE u.user_email = 'admin@electroshop.vn'
AND p.product_slug IN ('iphone-15-128gb', 'dell-inspiron-15', 'asus-tuf-gaming-f15');

-- =========================================================
-- 13. CÂU LỆNH KIỂM TRA NHANH
-- =========================================================

SELECT 'roles' AS table_name, COUNT(*) AS total_rows FROM roles
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'brands', COUNT(*) FROM brands
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'ai_search_logs', COUNT(*) FROM ai_search_logs;
