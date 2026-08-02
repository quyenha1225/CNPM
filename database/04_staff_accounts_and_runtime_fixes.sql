-- ============================================================
-- GEARXIN / ELECTROSHOP
-- STAFF ACCOUNTS + AI RUNTIME FIXES
-- Chạy sau file create table và insert dữ liệu chính.
-- ============================================================

USE electroshop_db;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET @OLD_SQL_SAFE_UPDATES := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- ------------------------------------------------------------
-- 1. Đảm bảo role và quyền cần thiết tồn tại
-- ------------------------------------------------------------
INSERT INTO roles (
    role_code,
    role_name,
    role_description
)
VALUES
('CUSTOMER', 'Khách hàng', 'Người mua hàng trên website'),
('STAFF', 'Nhân viên', 'Nhân viên xử lý đơn hàng, kho, thanh toán và đánh giá'),
('ADMIN', 'Quản trị viên', 'Quản trị toàn bộ hệ thống')
ON DUPLICATE KEY UPDATE
    role_name = VALUES(role_name),
    role_description = VALUES(role_description);

INSERT INTO permissions (
    permission_code,
    permission_name,
    permission_description
)
VALUES
('VIEW_PRODUCTS', 'Xem sản phẩm', 'Cho phép xem danh sách và chi tiết sản phẩm'),
('MANAGE_PRODUCTS', 'Quản lý sản phẩm', 'Cho phép cập nhật thông tin sản phẩm'),
('MANAGE_ORDERS', 'Quản lý đơn hàng', 'Cho phép xem và cập nhật đơn hàng'),
('MANAGE_INVENTORY', 'Quản lý kho hàng', 'Cho phép nhập, xuất và điều chỉnh kho'),
('MANAGE_PAYMENTS', 'Quản lý thanh toán', 'Cho phép xác nhận và cập nhật thanh toán'),
('MODERATE_REVIEWS', 'Kiểm duyệt đánh giá', 'Cho phép duyệt, từ chối và phản hồi đánh giá'),
('VIEW_REPORTS', 'Xem báo cáo', 'Cho phép xem doanh thu và thống kê'),
('MANAGE_USERS', 'Quản lý người dùng', 'Cho phép quản lý tài khoản nhân viên'),
('USE_AI_SEARCH', 'Sử dụng AI Search', 'Cho phép dùng chức năng tìm kiếm thông minh'),
('VIEW_AUDIT_LOGS', 'Xem nhật ký hệ thống', 'Cho phép xem lịch sử hoạt động hệ thống')
ON DUPLICATE KEY UPDATE
    permission_name = VALUES(permission_name),
    permission_description = VALUES(permission_description);

-- STAFF không được tạo tài khoản STAFF; không gán MANAGE_USERS.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
JOIN permissions p
  ON p.permission_code IN (
      'VIEW_PRODUCTS',
      'MANAGE_PRODUCTS',
      'MANAGE_ORDERS',
      'MANAGE_INVENTORY',
      'MANAGE_PAYMENTS',
      'MODERATE_REVIEWS',
      'VIEW_REPORTS',
      'USE_AI_SEARCH'
  )
WHERE r.role_code = 'STAFF';

-- ADMIN có toàn bộ quyền.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.role_code = 'ADMIN';

-- ------------------------------------------------------------
-- 2. Tạo/cập nhật tài khoản demo có bcrypt hash thật
-- ------------------------------------------------------------
-- Admin:
--   Email: admin@electroshop.vn
--   Password: Admin@123
-- Staff:
--   Email: staff@electroshop.vn
--   Password: Staff@123
-- Hãy đổi mật khẩu sau khi kiểm thử.

INSERT INTO users (
    role_id,
    user_full_name,
    user_email,
    user_phone,
    password_hash,
    account_status
)
SELECT
    r.role_id,
    'Nguyễn Văn Admin',
    'admin@electroshop.vn',
    '0900000001',
    '$2b$12$F6HWPXBVAN5Dwb5F76a9yeIZMZWmxEbeyWhOLdEiu6Ze2FUtXIyI.',
    'ACTIVE'
FROM roles r
WHERE r.role_code = 'ADMIN'
ON DUPLICATE KEY UPDATE
    role_id = VALUES(role_id),
    user_full_name = VALUES(user_full_name),
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
    r.role_id,
    'Trần Thị Nhân Viên',
    'staff@electroshop.vn',
    '0900000002',
    '$2b$12$04QfKlTdVE4/HEVKWujDKO15kKIH91EfK/LDMjmBBxu1ZsH4WvKGO',
    'ACTIVE'
FROM roles r
WHERE r.role_code = 'STAFF'
ON DUPLICATE KEY UPDATE
    role_id = VALUES(role_id),
    user_full_name = VALUES(user_full_name),
    password_hash = VALUES(password_hash),
    account_status = 'ACTIVE',
    updated_at = NOW();

-- ------------------------------------------------------------
-- 3. Sửa schema AI Search theo kiểu an toàn, chạy lại không lỗi
-- ------------------------------------------------------------

-- LƯU Ý: normalized_value chỉ để VARCHAR(255).
-- Bảng đang có index (attribute_id, normalized_value); utf8mb4 dùng tối đa
-- 4 byte/ký tự. VARCHAR(1000) làm index vượt giới hạn 3072 byte và gây lỗi 1071.

-- product_attributes.attribute_code
SET @sql := IF(
    EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'product_attributes'
          AND column_name = 'attribute_code'
    ),
    'SELECT 1',
    'ALTER TABLE product_attributes ADD COLUMN attribute_code VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER attribute_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Nếu attribute_code vừa được thêm, tạo mã ổn định từ attribute_id.
UPDATE product_attributes
SET attribute_code = CONCAT('ATTR_', attribute_id)
WHERE attribute_code IS NULL
   OR TRIM(attribute_code) = '';

-- numeric_value
SET @sql := IF(
    EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'product_attribute_values'
          AND column_name = 'numeric_value'
    ),
    'SELECT 1',
    'ALTER TABLE product_attribute_values ADD COLUMN numeric_value DECIMAL(18,4) NULL AFTER attribute_value'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- boolean_value
SET @sql := IF(
    EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'product_attribute_values'
          AND column_name = 'boolean_value'
    ),
    'SELECT 1',
    'ALTER TABLE product_attribute_values ADD COLUMN boolean_value BOOLEAN NULL AFTER numeric_value'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- normalized_value: sửa trực tiếp lỗi
-- Unknown column pav_filter.normalized_value
SET @sql := IF(
    EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'product_attribute_values'
          AND column_name = 'normalized_value'
    ),
    'SELECT 1',
    'ALTER TABLE product_attribute_values ADD COLUMN normalized_value VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER boolean_value'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Đồng bộ collation để tránh Illegal mix of collations.
ALTER TABLE product_attributes
    MODIFY attribute_code VARCHAR(100)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NULL;

ALTER TABLE product_attribute_values
    MODIFY attribute_value VARCHAR(1000)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NOT NULL,
    MODIFY normalized_value VARCHAR(255)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NULL;

-- Điền normalized_value cho dữ liệu đã insert.
UPDATE product_attribute_values
SET normalized_value = LOWER(TRIM(COALESCE(attribute_value, '')))
WHERE normalized_value IS NULL
   OR TRIM(normalized_value) = '';

-- Không bắt buộc tạo unique index tại bước runtime; tránh lỗi nếu dữ liệu cũ có mã trùng.

-- ------------------------------------------------------------
-- 4. Kiểm tra kết quả
-- ------------------------------------------------------------
SELECT
    u.user_id,
    u.user_full_name,
    u.user_email,
    u.user_phone,
    r.role_code,
    u.account_status
FROM users u
JOIN roles r ON r.role_id = u.role_id
WHERE u.user_email IN (
    'admin@electroshop.vn',
    'staff@electroshop.vn'
)
ORDER BY r.role_code;

SELECT
    COUNT(*) AS total_product_specifications,
    SUM(
        CASE
            WHEN normalized_value IS NOT NULL
             AND TRIM(normalized_value) <> ''
            THEN 1 ELSE 0
        END
    ) AS normalized_specifications
FROM product_attribute_values;

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;
