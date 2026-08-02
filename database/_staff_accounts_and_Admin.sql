-- ============================================================
-- GEARXIN / ELECTROSHOP
-- ADMIN + STAFF BACKEND EXTENSION (MERGED)
--
-- Chạy sau:
--   1) schema (1).sql
--   2) insert.sql
--
-- Có thể chạy lại nhiều lần:
--   - Không xóa dữ liệu cũ
--   - Không tạo trùng role/quyền/trạng thái
--   - Tự kiểm tra cột/index trước khi bổ sung
-- ============================================================

USE electroshop_db;

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @OLD_SQL_SAFE_UPDATES := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- ============================================================
-- 1. ROLE
-- ============================================================

INSERT INTO roles (
    role_code,
    role_name,
    role_description
)
VALUES
(
    'CUSTOMER',
    'Khách hàng',
    'Khách hàng mua sắm trên website'
),
(
    'STAFF',
    'Nhân viên',
    'Nhân viên xử lý đơn hàng, kho, thanh toán và đánh giá'
),
(
    'ADMIN',
    'Quản trị viên',
    'Quản trị toàn bộ hệ thống'
)
ON DUPLICATE KEY UPDATE
    role_name = VALUES(role_name),
    role_description = VALUES(role_description);


-- ============================================================
-- 2. PERMISSION
-- ============================================================

INSERT INTO permissions (
    permission_code,
    permission_name,
    permission_description
)
VALUES
(
    'VIEW_PRODUCTS',
    'Xem sản phẩm',
    'Cho phép xem danh sách và chi tiết sản phẩm'
),
(
    'VIEW_ADMIN_DASHBOARD',
    'Xem dashboard admin',
    'Xem số liệu tổng quan quản trị'
),
(
    'MANAGE_USERS',
    'Quản lý người dùng',
    'Quản lý khách hàng và tài khoản'
),
(
    'MANAGE_STAFF',
    'Quản lý nhân viên',
    'Tạo, cập nhật, khóa và phân quyền tài khoản nhân viên'
),
(
    'MANAGE_PRODUCTS',
    'Quản lý sản phẩm',
    'CRUD sản phẩm, ảnh, biến thể và thông số kỹ thuật'
),
(
    'MANAGE_INVENTORY',
    'Quản lý kho',
    'Nhập, xuất và điều chỉnh kho'
),
(
    'MANAGE_ORDERS',
    'Quản lý đơn hàng',
    'Xem và cập nhật trạng thái đơn hàng'
),
(
    'MANAGE_PAYMENTS',
    'Quản lý thanh toán',
    'Xác nhận và cập nhật thanh toán'
),
(
    'MODERATE_REVIEWS',
    'Kiểm duyệt đánh giá',
    'Duyệt, từ chối và phản hồi đánh giá'
),
(
    'MANAGE_PROMOTIONS',
    'Quản lý khuyến mãi',
    'CRUD chương trình khuyến mãi'
),
(
    'VIEW_REPORTS',
    'Xem báo cáo',
    'Xem doanh thu và thống kê'
),
(
    'USE_AI_SEARCH',
    'Sử dụng AI Search',
    'Cho phép sử dụng chức năng tìm kiếm thông minh'
),
(
    'MANAGE_AI_CONFIG',
    'Cấu hình AI',
    'Quản lý cấu hình AI Search'
),
(
    'VIEW_AUDIT_LOGS',
    'Xem nhật ký hệ thống',
    'Xem lịch sử hoạt động và thao tác quản trị'
)
ON DUPLICATE KEY UPDATE
    permission_name = VALUES(permission_name),
    permission_description = VALUES(permission_description);


-- ============================================================
-- 3. GÁN QUYỀN CHO STAFF
--
-- STAFF không có:
--   - MANAGE_USERS
--   - MANAGE_STAFF
--   - VIEW_ADMIN_DASHBOARD
--   - MANAGE_AI_CONFIG
--   - VIEW_AUDIT_LOGS
-- ============================================================

INSERT IGNORE INTO role_permissions (
    role_id,
    permission_id
)
SELECT
    role_row.role_id,
    permission_row.permission_id
FROM roles role_row
JOIN permissions permission_row
    ON permission_row.permission_code IN (
        'VIEW_PRODUCTS',
        'MANAGE_PRODUCTS',
        'MANAGE_ORDERS',
        'MANAGE_INVENTORY',
        'MANAGE_PAYMENTS',
        'MODERATE_REVIEWS',
        'VIEW_REPORTS',
        'USE_AI_SEARCH'
    )
WHERE role_row.role_code = 'STAFF';


-- ============================================================
-- 4. GÁN TOÀN BỘ QUYỀN CHO ADMIN
-- ============================================================

INSERT IGNORE INTO role_permissions (
    role_id,
    permission_id
)
SELECT
    role_row.role_id,
    permission_row.permission_id
FROM roles role_row
CROSS JOIN permissions permission_row
WHERE role_row.role_code = 'ADMIN';


-- ============================================================
-- 5. TẠO/CẬP NHẬT TÀI KHOẢN DEMO
--
-- ADMIN
--   Email: admin@electroshop.vn
--   Password: Admin@123
--
-- STAFF
--   Email: staff@electroshop.vn
--   Password: Staff@123
--
-- Đổi mật khẩu sau khi kiểm thử.
-- ============================================================

INSERT INTO users (
    role_id,
    user_full_name,
    user_email,
    user_phone,
    password_hash,
    account_status
)
SELECT
    role_row.role_id,
    'Nguyễn Văn Admin',
    'admin@electroshop.vn',
    '0900000001',
    '$2b$12$F6HWPXBVAN5Dwb5F76a9yeIZMZWmxEbeyWhOLdEiu6Ze2FUtXIyI.',
    'ACTIVE'
FROM roles role_row
WHERE role_row.role_code = 'ADMIN'
ON DUPLICATE KEY UPDATE
    role_id = VALUES(role_id),
    user_full_name = VALUES(user_full_name),
    user_phone = VALUES(user_phone),
    password_hash = VALUES(password_hash),
    account_status = 'ACTIVE',
    updated_at = NOW();


INSERT INTO users (
    role_id,
    user_full_name,
    user_email,
    user_phone,
    password_hash,
    account_status
)
SELECT
    role_row.role_id,
    'Trần Thị Nhân Viên',
    'staff@electroshop.vn',
    '0900000002',
    '$2b$12$04QfKlTdVE4/HEVKWujDKO15kKIH91EfK/LDMjmBBxu1ZsH4WvKGO',
    'ACTIVE'
FROM roles role_row
WHERE role_row.role_code = 'STAFF'
ON DUPLICATE KEY UPDATE
    role_id = VALUES(role_id),
    user_full_name = VALUES(user_full_name),
    user_phone = VALUES(user_phone),
    password_hash = VALUES(password_hash),
    account_status = 'ACTIVE',
    updated_at = NOW();


-- ============================================================
-- 6. TRẠNG THÁI ĐƠN HÀNG
-- ============================================================

INSERT INTO order_statuses (
    order_status_code,
    order_status_name
)
VALUES
('PENDING', 'Chờ xác nhận'),
('CONFIRMED', 'Đã xác nhận'),
('PROCESSING', 'Đang xử lý'),
('SHIPPING', 'Đang giao hàng'),
('DELIVERED', 'Đã giao hàng'),
('CANCELLED', 'Đã hủy'),
('REFUNDED', 'Đã hoàn tiền')
ON DUPLICATE KEY UPDATE
    order_status_name = VALUES(order_status_name);


-- ============================================================
-- 7. TRẠNG THÁI THANH TOÁN
-- ============================================================

INSERT INTO payment_statuses (
    payment_status_code,
    payment_status_name
)
VALUES
('PENDING', 'Chờ thanh toán'),
('PAID', 'Đã thanh toán'),
('FAILED', 'Thanh toán thất bại'),
('CANCELLED', 'Đã hủy'),
('REFUNDED', 'Đã hoàn tiền')
ON DUPLICATE KEY UPDATE
    payment_status_name = VALUES(payment_status_name);


-- ============================================================
-- 8. LOẠI GIAO DỊCH KHO
-- ============================================================

INSERT INTO inventory_transaction_types (
    inventory_type_code,
    inventory_type_name
)
VALUES
('IN', 'Nhập kho'),
('OUT', 'Xuất kho'),
('ADJUST', 'Điều chỉnh kho')
ON DUPLICATE KEY UPDATE
    inventory_type_name = VALUES(inventory_type_name);


-- ============================================================
-- 9. BỔ SUNG CỘT PHỤC VỤ PRODUCT DETAIL + AI SEARCH
-- ============================================================

-- ------------------------------------------------------------
-- 9.1 product_attributes.attribute_code
-- ------------------------------------------------------------

SET @sql := IF(
    EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'product_attributes'
          AND column_name = 'attribute_code'
    ),
    'SELECT 1',
    'ALTER TABLE product_attributes
        ADD COLUMN attribute_code VARCHAR(100)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NULL
        AFTER attribute_id'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


UPDATE product_attributes
SET attribute_code = CONCAT('ATTR_', attribute_id)
WHERE attribute_code IS NULL
   OR TRIM(attribute_code) = '';


ALTER TABLE product_attributes
    MODIFY attribute_code VARCHAR(100)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NULL;


-- ------------------------------------------------------------
-- 9.2 product_attribute_values.numeric_value
-- ------------------------------------------------------------

SET @sql := IF(
    EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'product_attribute_values'
          AND column_name = 'numeric_value'
    ),
    'SELECT 1',
    'ALTER TABLE product_attribute_values
        ADD COLUMN numeric_value DECIMAL(18,4)
        NULL
        AFTER attribute_value'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ------------------------------------------------------------
-- 9.3 product_attribute_values.boolean_value
-- ------------------------------------------------------------

SET @sql := IF(
    EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'product_attribute_values'
          AND column_name = 'boolean_value'
    ),
    'SELECT 1',
    'ALTER TABLE product_attribute_values
        ADD COLUMN boolean_value BOOLEAN
        NULL
        AFTER numeric_value'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ------------------------------------------------------------
-- 9.4 product_attribute_values.normalized_value
--
-- Chỉ dùng VARCHAR(255) vì cột này có thể nằm trong index.
-- Không đổi thành VARCHAR(1000), tránh lỗi:
--   Error 1071: Specified key was too long
-- ------------------------------------------------------------

SET @sql := IF(
    EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'product_attribute_values'
          AND column_name = 'normalized_value'
    ),
    'SELECT 1',
    'ALTER TABLE product_attribute_values
        ADD COLUMN normalized_value VARCHAR(255)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NULL
        AFTER boolean_value'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


ALTER TABLE product_attribute_values
    MODIFY attribute_value VARCHAR(1000)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NOT NULL,
    MODIFY normalized_value VARCHAR(255)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NULL;


UPDATE product_attribute_values
SET normalized_value = LEFT(
    LOWER(
        TRIM(
            COALESCE(attribute_value, '')
        )
    ),
    255
)
WHERE normalized_value IS NULL
   OR TRIM(normalized_value) = '';


-- ============================================================
-- 10. BẢNG KHUYẾN MÃI
-- ============================================================

CREATE TABLE IF NOT EXISTS promotions (
    promotion_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    promotion_code VARCHAR(50) NOT NULL UNIQUE,
    promotion_name VARCHAR(150) NOT NULL,
    promotion_description TEXT NULL,

    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(15,2) NOT NULL,

    min_order_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    max_discount_value DECIMAL(15,2) NULL,

    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,

    usage_limit INT UNSIGNED NULL,
    used_count INT UNSIGNED NOT NULL DEFAULT 0,

    promotion_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    created_by_user_id BIGINT UNSIGNED NULL,
    updated_by_user_id BIGINT UNSIGNED NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_promotions_created_by
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_promotions_updated_by
        FOREIGN KEY (updated_by_user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CHECK (discount_type IN ('PERCENT', 'FIXED')),
    CHECK (discount_value >= 0),
    CHECK (min_order_value >= 0),
    CHECK (
        max_discount_value IS NULL
        OR max_discount_value >= 0
    ),
    CHECK (end_at > start_at)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS promotion_products (
    promotion_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (
        promotion_id,
        product_id
    ),

    CONSTRAINT fk_promotion_products_promotion
        FOREIGN KEY (promotion_id)
        REFERENCES promotions(promotion_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_promotion_products_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- ============================================================
-- 11. BẢNG CẤU HÌNH HỆ THỐNG VÀ AI
-- ============================================================

CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,

    setting_group VARCHAR(50) NOT NULL,
    setting_value LONGTEXT NOT NULL,
    value_type VARCHAR(20) NOT NULL DEFAULT 'STRING',

    setting_description VARCHAR(255) NULL,

    updated_by_user_id BIGINT UNSIGNED NULL,

    updated_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_system_settings_user
        FOREIGN KEY (updated_by_user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


INSERT INTO system_settings (
    setting_key,
    setting_group,
    setting_value,
    value_type,
    setting_description
)
VALUES
(
    'AI_PROVIDER',
    'AI',
    'GEMINI',
    'STRING',
    'Nhà cung cấp AI'
),
(
    'AI_MODEL',
    'AI',
    'gemini-2.5-flash',
    'STRING',
    'Model AI Search'
),
(
    'AI_ENABLED',
    'AI',
    'true',
    'BOOLEAN',
    'Bật hoặc tắt AI Search'
),
(
    'AI_RESULT_LIMIT',
    'AI',
    '10',
    'NUMBER',
    'Số sản phẩm AI trả về'
),
(
    'STORE_NAME',
    'STORE',
    'Gearxin',
    'STRING',
    'Tên cửa hàng'
),
(
    'LOW_STOCK_THRESHOLD',
    'INVENTORY',
    '5',
    'NUMBER',
    'Ngưỡng cảnh báo tồn kho thấp'
)
ON DUPLICATE KEY UPDATE
    setting_group = VALUES(setting_group),
    value_type = VALUES(value_type),
    setting_description = VALUES(setting_description);


-- ============================================================
-- 12. INDEX PHỤC VỤ ADMIN
-- ============================================================

-- ------------------------------------------------------------
-- 12.1 orders
-- ------------------------------------------------------------

SET @sql := IF(
    EXISTS(
        SELECT 1
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'orders'
          AND index_name = 'idx_admin_orders_created_status'
    ),
    'SELECT 1',
    'CREATE INDEX idx_admin_orders_created_status
        ON orders(order_created_at, order_status_id)'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ------------------------------------------------------------
-- 12.2 audit_logs
-- ------------------------------------------------------------

SET @sql := IF(
    EXISTS(
        SELECT 1
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'audit_logs'
          AND index_name = 'idx_admin_audit_action_at'
    ),
    'SELECT 1',
    'CREATE INDEX idx_admin_audit_action_at
        ON audit_logs(action_at, actor_user_id)'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ------------------------------------------------------------
-- 12.3 product_reviews
-- ------------------------------------------------------------

SET @sql := IF(
    EXISTS(
        SELECT 1
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'product_reviews'
          AND index_name = 'idx_admin_review_status_created'
    ),
    'SELECT 1',
    'CREATE INDEX idx_admin_review_status_created
        ON product_reviews(review_status, created_at)'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ============================================================
-- 13. KIỂM TRA TÀI KHOẢN ADMIN + STAFF
-- ============================================================

SELECT
    user_row.user_id,
    user_row.user_full_name,
    user_row.user_email,
    user_row.user_phone,
    role_row.role_code,
    user_row.account_status
FROM users user_row
JOIN roles role_row
    ON role_row.role_id = user_row.role_id
WHERE user_row.user_email IN (
    'admin@electroshop.vn',
    'staff@electroshop.vn'
)
ORDER BY role_row.role_code;


-- ============================================================
-- 14. KIỂM TRA SỐ THÔNG SỐ SẢN PHẨM
-- ============================================================

SELECT
    COUNT(*) AS total_product_specifications,

    SUM(
        CASE
            WHEN normalized_value IS NOT NULL
             AND TRIM(normalized_value) <> ''
            THEN 1
            ELSE 0
        END
    ) AS normalized_specifications
FROM product_attribute_values;


-- ============================================================
-- 15. KIỂM TRA QUYỀN THEO ROLE
-- ============================================================

SELECT
    role_row.role_code,
    permission_row.permission_code,
    permission_row.permission_name
FROM role_permissions role_permission_row
JOIN roles role_row
    ON role_row.role_id = role_permission_row.role_id
JOIN permissions permission_row
    ON permission_row.permission_id =
       role_permission_row.permission_id
WHERE role_row.role_code IN (
    'ADMIN',
    'STAFF'
)
ORDER BY
    role_row.role_code,
    permission_row.permission_code;


-- ============================================================
-- 16. HOÀN TẤT
-- ============================================================

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

SELECT
    'ADMIN + STAFF BACKEND EXTENSION READY'
    AS result;
