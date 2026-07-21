-- =========================================================
-- CNPM_DB - SAFE AI SEARCH MIGRATION
-- KHÔNG DROP DATABASE
-- KHÔNG DROP TABLE
-- KHÔNG XÓA DỮ LIỆU CŨ
-- =========================================================

USE electroshop_db;
SET SQL_SAFE_UPDATES = 0;
-- =========================================================
-- 0. KIỂM TRA DATABASE VÀ CÁC BẢNG BẮT BUỘC
-- =========================================================

SELECT DATABASE() AS current_database;

SELECT
    CASE
        WHEN COUNT(*) = 8 THEN 'OK - Đủ bảng nền tảng'
        ELSE 'THIẾU BẢNG - Không nên chạy tiếp'
    END AS migration_check
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN (
      'products',
      'categories',
      'product_attributes',
      'category_attributes',
      'product_attribute_values',
      'product_tags',
      'product_tag_mapping',
      'ai_search_logs'
  );

-- =========================================================
-- 1. HÀM HỖ TRỢ THÊM CỘT AN TOÀN
-- =========================================================

DROP PROCEDURE IF EXISTS add_column_if_missing;

DELIMITER $$

CREATE PROCEDURE add_column_if_missing(
    IN p_table_name VARCHAR(64),
    IN p_column_name VARCHAR(64),
    IN p_column_definition TEXT
)
BEGIN
    DECLARE v_column_count INT DEFAULT 0;

    SELECT COUNT(*)
    INTO v_column_count
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND column_name = p_column_name;

    IF v_column_count = 0 THEN
        SET @sql_statement = CONCAT(
            'ALTER TABLE `',
            p_table_name,
            '` ADD COLUMN `',
            p_column_name,
            '` ',
            p_column_definition
        );

        PREPARE prepared_statement FROM @sql_statement;
        EXECUTE prepared_statement;
        DEALLOCATE PREPARE prepared_statement;
    END IF;
END$$

DELIMITER ;

-- =========================================================
-- 2. HÀM HỖ TRỢ THÊM INDEX AN TOÀN
-- =========================================================

DROP PROCEDURE IF EXISTS add_index_if_missing;

DELIMITER $$

CREATE PROCEDURE add_index_if_missing(
    IN p_table_name VARCHAR(64),
    IN p_index_name VARCHAR(64),
    IN p_index_definition TEXT
)
BEGIN
    DECLARE v_index_count INT DEFAULT 0;

    SELECT COUNT(*)
    INTO v_index_count
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND index_name = p_index_name;

    IF v_index_count = 0 THEN
        SET @sql_statement = CONCAT(
            'ALTER TABLE `',
            p_table_name,
            '` ADD ',
            p_index_definition
        );

        PREPARE prepared_statement FROM @sql_statement;
        EXECUTE prepared_statement;
        DEALLOCATE PREPARE prepared_statement;
    END IF;
END$$

DELIMITER ;

-- =========================================================
-- 3. NÂNG CẤP PRODUCT_ATTRIBUTES
-- =========================================================

CALL add_column_if_missing(
    'product_attributes',
    'attribute_code',
    'VARCHAR(100) NULL AFTER attribute_id'
);

CALL add_column_if_missing(
    'product_attributes',
    'value_type',
    'VARCHAR(30) NOT NULL DEFAULT ''TEXT'' AFTER attribute_unit'
);

CALL add_column_if_missing(
    'product_attributes',
    'is_filterable',
    'BOOLEAN NOT NULL DEFAULT TRUE AFTER is_highlight'
);

CALL add_column_if_missing(
    'product_attributes',
    'is_ai_searchable',
    'BOOLEAN NOT NULL DEFAULT TRUE AFTER is_filterable'
);

CALL add_column_if_missing(
    'product_attributes',
    'attribute_description',
    'VARCHAR(255) NULL AFTER is_ai_searchable'
);

-- Cấp mã tạm thời duy nhất cho thuộc tính cũ.
UPDATE product_attributes
SET attribute_code = CONCAT('ATTR_', attribute_id)
WHERE attribute_code IS NULL
   OR TRIM(attribute_code) = '';

-- Chuẩn hóa mã cho các thuộc tính đã có.
UPDATE product_attributes
SET
    attribute_code = 'CPU_MODEL',
    value_type = 'TEXT',
    is_filterable = TRUE,
    is_ai_searchable = TRUE
WHERE attribute_name IN ('CPU', 'Bộ xử lý');

UPDATE product_attributes
SET
    attribute_code = 'RAM_CAPACITY_GB',
    value_type = 'NUMBER',
    is_filterable = TRUE,
    is_ai_searchable = TRUE
WHERE attribute_name = 'RAM';

UPDATE product_attributes
SET
    attribute_code = 'STORAGE_CAPACITY_GB',
    value_type = 'NUMBER',
    is_filterable = TRUE,
    is_ai_searchable = TRUE
WHERE attribute_name IN (
    'Bộ nhớ trong',
    'Ổ cứng',
    'Dung lượng lưu trữ'
);

UPDATE product_attributes
SET
    attribute_code = 'GPU_MODEL',
    value_type = 'TEXT',
    is_filterable = TRUE,
    is_ai_searchable = TRUE
WHERE attribute_name IN ('GPU', 'Card đồ họa');

UPDATE product_attributes
SET
    attribute_code = 'SCREEN_SIZE_INCH',
    value_type = 'NUMBER',
    is_filterable = TRUE,
    is_ai_searchable = TRUE
WHERE attribute_name = 'Kích thước màn hình';

UPDATE product_attributes
SET
    attribute_code = 'SCREEN_REFRESH_RATE_HZ',
    value_type = 'NUMBER',
    is_filterable = TRUE,
    is_ai_searchable = TRUE
WHERE attribute_name = 'Tần số quét';

UPDATE product_attributes
SET
    attribute_code = 'OPERATING_SYSTEM',
    value_type = 'TEXT',
    is_filterable = TRUE,
    is_ai_searchable = TRUE
WHERE attribute_name = 'Hệ điều hành';

UPDATE product_attributes
SET
    attribute_code = 'WEIGHT_KG',
    value_type = 'NUMBER',
    is_filterable = TRUE,
    is_ai_searchable = TRUE
WHERE attribute_name = 'Trọng lượng';

UPDATE product_attributes
SET
    attribute_code = 'USE_CASE',
    value_type = 'TEXT',
    is_filterable = TRUE,
    is_ai_searchable = TRUE
WHERE attribute_name = 'Mục đích sử dụng';

UPDATE product_attributes
SET
    attribute_code = 'PERFORMANCE_LEVEL',
    value_type = 'TEXT',
    is_filterable = TRUE,
    is_ai_searchable = TRUE
WHERE attribute_name = 'Mức hiệu năng';

UPDATE product_attributes
SET
    attribute_code = 'GAMING_CAPABILITY',
    value_type = 'TEXT',
    is_filterable = TRUE,
    is_ai_searchable = TRUE
WHERE attribute_name = 'Khả năng chơi game';

UPDATE product_attributes
SET
    attribute_code = 'TARGET_USER',
    value_type = 'TEXT',
    is_filterable = TRUE,
    is_ai_searchable = TRUE
WHERE attribute_name = 'Đối tượng phù hợp';

-- Nếu một mã bị trùng do dữ liệu cũ, giữ mã đầu tiên,
-- các dòng còn lại quay về mã ATTR_<id>.
UPDATE product_attributes pa
JOIN (
    SELECT
        attribute_code,
        MIN(attribute_id) AS keep_attribute_id
    FROM product_attributes
    GROUP BY attribute_code
    HAVING COUNT(*) > 1
) duplicated
    ON duplicated.attribute_code = pa.attribute_code
SET pa.attribute_code = CONCAT('ATTR_', pa.attribute_id)
WHERE pa.attribute_id <> duplicated.keep_attribute_id;

CALL add_index_if_missing(
    'product_attributes',
    'uq_product_attributes_code',
    'UNIQUE INDEX `uq_product_attributes_code` (`attribute_code`)'
);

CALL add_index_if_missing(
    'product_attributes',
    'idx_product_attributes_ai',
    'INDEX `idx_product_attributes_ai` (`is_ai_searchable`, `is_filterable`)'
);

-- =========================================================
-- 4. NÂNG CẤP PRODUCT_ATTRIBUTE_VALUES
-- =========================================================

CALL add_column_if_missing(
    'product_attribute_values',
    'numeric_value',
    'DECIMAL(18,4) NULL AFTER attribute_value'
);

CALL add_column_if_missing(
    'product_attribute_values',
    'boolean_value',
    'BOOLEAN NULL AFTER numeric_value'
);

CALL add_column_if_missing(
    'product_attribute_values',
    'normalized_value',
    'VARCHAR(255) NULL AFTER boolean_value'
);

-- Sao chép dạng chuẩn ban đầu, không xóa giá trị cũ.
UPDATE product_attribute_values
SET normalized_value = LOWER(TRIM(attribute_value))
WHERE normalized_value IS NULL;

-- Điền numeric_value cho các thuộc tính NUMBER
-- nếu attribute_value đang là số thuần túy.
UPDATE product_attribute_values pav
JOIN product_attributes pa
    ON pa.attribute_id = pav.attribute_id
SET pav.numeric_value = CAST(pav.attribute_value AS DECIMAL(18,4))
WHERE pa.value_type = 'NUMBER'
  AND pav.numeric_value IS NULL
  AND TRIM(pav.attribute_value)
      REGEXP '^[0-9]+([.][0-9]+)?$';

CALL add_index_if_missing(
    'product_attribute_values',
    'idx_product_attribute_numeric',
    'INDEX `idx_product_attribute_numeric` (`attribute_id`, `numeric_value`)'
);

CALL add_index_if_missing(
    'product_attribute_values',
    'idx_product_attribute_normalized',
    'INDEX `idx_product_attribute_normalized` (`attribute_id`, `normalized_value`)'
);

-- =========================================================
-- 5. THÊM BỘ THUỘC TÍNH CHUNG CHO AI
-- INSERT IGNORE KHÔNG GHI ĐÈ THUỘC TÍNH CŨ
-- =========================================================

INSERT IGNORE INTO product_attributes (
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
(
    'PRODUCT_TYPE',
    'Loại sản phẩm',
    'Thông tin chung',
    NULL,
    'TEXT',
    1,
    TRUE,
    TRUE,
    TRUE,
    'Laptop, điện thoại, RAM, SSD, CPU, GPU, màn hình hoặc phụ kiện'
),
(
    'TARGET_USER',
    'Đối tượng phù hợp',
    'AI Recommendation',
    NULL,
    'TEXT',
    2,
    FALSE,
    TRUE,
    TRUE,
    'Sinh viên, học sinh, nhân viên văn phòng, game thủ hoặc người làm đồ họa'
),
(
    'USE_CASE',
    'Mục đích sử dụng',
    'AI Recommendation',
    NULL,
    'TEXT',
    3,
    FALSE,
    TRUE,
    TRUE,
    'Học tập, lập trình, văn phòng, đa nhiệm, gaming, thiết kế hoặc render'
),
(
    'PERFORMANCE_LEVEL',
    'Mức hiệu năng',
    'AI Recommendation',
    NULL,
    'TEXT',
    4,
    FALSE,
    TRUE,
    TRUE,
    'Cơ bản, khá, cao hoặc rất cao'
),
(
    'GAMING_CAPABILITY',
    'Khả năng chơi game',
    'AI Recommendation',
    NULL,
    'TEXT',
    5,
    FALSE,
    TRUE,
    TRUE,
    'Game nhẹ, eSports, game AAA hoặc không phù hợp chơi game'
),
(
    'MULTITASKING_LEVEL',
    'Khả năng đa nhiệm',
    'AI Recommendation',
    NULL,
    'TEXT',
    6,
    FALSE,
    TRUE,
    TRUE,
    'Số lượng ứng dụng hoặc tab trình duyệt có thể sử dụng phù hợp'
),
(
    'COMPATIBILITY_NOTE',
    'Thông tin tương thích',
    'Tương thích',
    NULL,
    'TEXT',
    7,
    FALSE,
    TRUE,
    TRUE,
    'Thông tin cần biết trước khi mua linh kiện hoặc phụ kiện'
);

-- =========================================================
-- 6. THUỘC TÍNH DÀNH CHO ĐIỆN THOẠI
-- =========================================================

INSERT IGNORE INTO product_attributes (
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
(
    'PHONE_CHIPSET',
    'Chip điện thoại',
    'Hiệu năng',
    NULL,
    'TEXT',
    1,
    TRUE,
    TRUE,
    TRUE,
    'Chip xử lý chính của điện thoại'
),
(
    'PHONE_RAM_GB',
    'RAM điện thoại',
    'Hiệu năng',
    'GB',
    'NUMBER',
    2,
    TRUE,
    TRUE,
    TRUE,
    'Dung lượng RAM của điện thoại'
),
(
    'PHONE_STORAGE_GB',
    'Bộ nhớ điện thoại',
    'Bộ nhớ',
    'GB',
    'NUMBER',
    3,
    TRUE,
    TRUE,
    TRUE,
    'Dung lượng lưu trữ của điện thoại'
),
(
    'BATTERY_CAPACITY_MAH',
    'Dung lượng pin',
    'Pin & Sạc',
    'mAh',
    'NUMBER',
    1,
    TRUE,
    TRUE,
    TRUE,
    'Dung lượng pin danh định'
),
(
    'CHARGING_POWER_W',
    'Công suất sạc',
    'Pin & Sạc',
    'W',
    'NUMBER',
    2,
    FALSE,
    TRUE,
    TRUE,
    'Công suất sạc nhanh tối đa'
),
(
    'MAIN_CAMERA_MP',
    'Camera chính',
    'Camera',
    'MP',
    'NUMBER',
    1,
    TRUE,
    TRUE,
    TRUE,
    'Độ phân giải camera chính'
),
(
    'CAMERA_CAPABILITY',
    'Khả năng chụp ảnh',
    'AI Recommendation',
    NULL,
    'TEXT',
    8,
    FALSE,
    TRUE,
    TRUE,
    'Chụp ảnh cơ bản, chân dung, thiếu sáng hoặc quay video'
),
(
    'PHONE_GAMING_LEVEL',
    'Mức chơi game điện thoại',
    'AI Recommendation',
    NULL,
    'TEXT',
    9,
    FALSE,
    TRUE,
    TRUE,
    'Game nhẹ, game phổ biến hoặc game nặng'
);

-- =========================================================
-- 7. THUỘC TÍNH DÀNH CHO RAM
-- =========================================================

INSERT IGNORE INTO product_attributes (
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
(
    'RAM_CAPACITY_GB',
    'Dung lượng RAM',
    'Thông số RAM',
    'GB',
    'NUMBER',
    1,
    TRUE,
    TRUE,
    TRUE,
    'Dung lượng của một thanh hoặc bộ RAM'
),
(
    'RAM_TYPE',
    'Chuẩn RAM',
    'Thông số RAM',
    NULL,
    'TEXT',
    2,
    TRUE,
    TRUE,
    TRUE,
    'DDR3, DDR4 hoặc DDR5'
),
(
    'RAM_SPEED_MHZ',
    'Bus RAM',
    'Thông số RAM',
    'MHz',
    'NUMBER',
    3,
    TRUE,
    TRUE,
    TRUE,
    'Tốc độ hoạt động của RAM'
),
(
    'RAM_FORM_FACTOR',
    'Dạng RAM',
    'Tương thích',
    NULL,
    'TEXT',
    4,
    FALSE,
    TRUE,
    TRUE,
    'DIMM cho desktop hoặc SO-DIMM cho laptop'
),
(
    'RAM_MODULE_COUNT',
    'Số thanh RAM',
    'Thông số RAM',
    'thanh',
    'NUMBER',
    5,
    FALSE,
    TRUE,
    TRUE,
    'Số thanh RAM trong bộ sản phẩm'
),
(
    'RAM_CAS_LATENCY',
    'Độ trễ RAM',
    'Thông số RAM',
    'CL',
    'NUMBER',
    6,
    FALSE,
    TRUE,
    TRUE,
    'CAS Latency của RAM'
),
(
    'RAM_VOLTAGE',
    'Điện áp RAM',
    'Thông số RAM',
    'V',
    'NUMBER',
    7,
    FALSE,
    TRUE,
    TRUE,
    'Điện áp hoạt động của RAM'
),
(
    'RAM_DEVICE_COMPATIBILITY',
    'Thiết bị dùng RAM',
    'Tương thích',
    NULL,
    'TEXT',
    8,
    TRUE,
    TRUE,
    TRUE,
    'Laptop hoặc desktop'
),
(
    'RAM_RECOMMENDED_TAB_COUNT',
    'Số tab trình duyệt phù hợp',
    'AI Recommendation',
    'tab',
    'NUMBER',
    9,
    FALSE,
    TRUE,
    TRUE,
    'Số tab trình duyệt ước tính sử dụng phù hợp'
);

-- =========================================================
-- 8. THUỘC TÍNH DÀNH CHO SSD
-- =========================================================

INSERT IGNORE INTO product_attributes (
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
(
    'SSD_CAPACITY_GB',
    'Dung lượng SSD',
    'Thông số SSD',
    'GB',
    'NUMBER',
    1,
    TRUE,
    TRUE,
    TRUE,
    'Dung lượng lưu trữ SSD'
),
(
    'SSD_INTERFACE',
    'Chuẩn kết nối SSD',
    'Tương thích',
    NULL,
    'TEXT',
    2,
    TRUE,
    TRUE,
    TRUE,
    'SATA, NVMe PCIe Gen 3, Gen 4 hoặc Gen 5'
),
(
    'SSD_FORM_FACTOR',
    'Kích thước SSD',
    'Tương thích',
    NULL,
    'TEXT',
    3,
    FALSE,
    TRUE,
    TRUE,
    '2.5 inch, M.2 2280 hoặc định dạng khác'
),
(
    'SSD_READ_SPEED_MBPS',
    'Tốc độ đọc SSD',
    'Hiệu năng',
    'MB/s',
    'NUMBER',
    4,
    TRUE,
    TRUE,
    TRUE,
    'Tốc độ đọc tuần tự'
),
(
    'SSD_WRITE_SPEED_MBPS',
    'Tốc độ ghi SSD',
    'Hiệu năng',
    'MB/s',
    'NUMBER',
    5,
    TRUE,
    TRUE,
    TRUE,
    'Tốc độ ghi tuần tự'
);

-- =========================================================
-- 9. THUỘC TÍNH DÀNH CHO CPU VÀ GPU
-- =========================================================

INSERT IGNORE INTO product_attributes (
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
(
    'CPU_SOCKET',
    'Socket CPU',
    'Tương thích',
    NULL,
    'TEXT',
    1,
    TRUE,
    TRUE,
    TRUE,
    'Socket CPU phải tương thích với mainboard'
),
(
    'CPU_CORE_COUNT',
    'Số nhân CPU',
    'Hiệu năng',
    'nhân',
    'NUMBER',
    2,
    TRUE,
    TRUE,
    TRUE,
    'Tổng số nhân CPU'
),
(
    'CPU_THREAD_COUNT',
    'Số luồng CPU',
    'Hiệu năng',
    'luồng',
    'NUMBER',
    3,
    FALSE,
    TRUE,
    TRUE,
    'Tổng số luồng xử lý'
),
(
    'GPU_VRAM_GB',
    'Dung lượng VRAM',
    'Hiệu năng đồ họa',
    'GB',
    'NUMBER',
    1,
    TRUE,
    TRUE,
    TRUE,
    'Dung lượng bộ nhớ đồ họa'
),
(
    'GPU_RECOMMENDED_PSU_W',
    'Nguồn đề nghị cho GPU',
    'Tương thích',
    'W',
    'NUMBER',
    2,
    TRUE,
    TRUE,
    TRUE,
    'Công suất nguồn tối thiểu được đề nghị'
),
(
    'GPU_POWER_CONNECTOR',
    'Đầu nguồn GPU',
    'Tương thích',
    NULL,
    'TEXT',
    3,
    FALSE,
    TRUE,
    TRUE,
    'Chuẩn đầu cấp nguồn phụ cho GPU'
),
(
    'GPU_TARGET_RESOLUTION',
    'Độ phân giải chơi game phù hợp',
    'AI Recommendation',
    NULL,
    'TEXT',
    4,
    FALSE,
    TRUE,
    TRUE,
    'Full HD, 2K hoặc 4K'
);

-- =========================================================
-- 10. THUỘC TÍNH DÀNH CHO MÀN HÌNH
-- =========================================================

INSERT IGNORE INTO product_attributes (
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
(
    'MONITOR_SIZE_INCH',
    'Kích thước màn hình rời',
    'Màn hình',
    'inch',
    'NUMBER',
    1,
    TRUE,
    TRUE,
    TRUE,
    'Kích thước đường chéo của màn hình'
),
(
    'MONITOR_RESOLUTION',
    'Độ phân giải màn hình',
    'Màn hình',
    NULL,
    'TEXT',
    2,
    TRUE,
    TRUE,
    TRUE,
    'Full HD, 2K hoặc 4K'
),
(
    'MONITOR_REFRESH_RATE_HZ',
    'Tần số quét màn hình',
    'Màn hình',
    'Hz',
    'NUMBER',
    3,
    TRUE,
    TRUE,
    TRUE,
    'Tần số quét tối đa'
),
(
    'MONITOR_PANEL_TYPE',
    'Tấm nền màn hình',
    'Màn hình',
    NULL,
    'TEXT',
    4,
    FALSE,
    TRUE,
    TRUE,
    'IPS, VA, TN hoặc OLED'
),
(
    'MONITOR_RESPONSE_TIME_MS',
    'Thời gian phản hồi',
    'Màn hình',
    'ms',
    'NUMBER',
    5,
    FALSE,
    TRUE,
    TRUE,
    'Thời gian phản hồi của màn hình'
);

-- =========================================================
-- 11. GẮN THUỘC TÍNH CHUNG CHO TẤT CẢ DANH MỤC
-- =========================================================

INSERT IGNORE INTO category_attributes (
    category_id,
    attribute_id
)
SELECT
    c.category_id,
    pa.attribute_id
FROM categories c
CROSS JOIN product_attributes pa
WHERE c.category_status = 'ACTIVE'
  AND pa.attribute_code IN (
      'PRODUCT_TYPE',
      'TARGET_USER',
      'USE_CASE',
      'PERFORMANCE_LEVEL',
      'COMPATIBILITY_NOTE'
  );

-- =========================================================
-- 12. GẮN THUỘC TÍNH CHO DANH MỤC ĐIỆN THOẠI
-- =========================================================

INSERT IGNORE INTO category_attributes (
    category_id,
    attribute_id
)
SELECT
    c.category_id,
    pa.attribute_id
FROM categories c
CROSS JOIN product_attributes pa
WHERE c.category_slug IN (
    'dien-thoai',
    'dien-thoai-di-dong',
    'smartphone'
)
AND pa.attribute_code IN (
    'PHONE_CHIPSET',
    'PHONE_RAM_GB',
    'PHONE_STORAGE_GB',
    'BATTERY_CAPACITY_MAH',
    'CHARGING_POWER_W',
    'MAIN_CAMERA_MP',
    'CAMERA_CAPABILITY',
    'PHONE_GAMING_LEVEL',
    'SCREEN_SIZE_INCH',
    'SCREEN_REFRESH_RATE_HZ',
    'OPERATING_SYSTEM',
    'MULTITASKING_LEVEL'
);

-- =========================================================
-- 13. GẮN THUỘC TÍNH LINH KIỆN PC
-- =========================================================

INSERT IGNORE INTO category_attributes (
    category_id,
    attribute_id
)
SELECT
    c.category_id,
    pa.attribute_id
FROM categories c
CROSS JOIN product_attributes pa
WHERE c.category_slug IN (
    'linh-kien-pc',
    'linh-kien',
    'ram',
    'ssd',
    'cpu',
    'gpu',
    'card-man-hinh'
)
AND pa.attribute_code IN (
    'RAM_CAPACITY_GB',
    'RAM_TYPE',
    'RAM_SPEED_MHZ',
    'RAM_FORM_FACTOR',
    'RAM_MODULE_COUNT',
    'RAM_CAS_LATENCY',
    'RAM_VOLTAGE',
    'RAM_DEVICE_COMPATIBILITY',
    'RAM_RECOMMENDED_TAB_COUNT',

    'SSD_CAPACITY_GB',
    'SSD_INTERFACE',
    'SSD_FORM_FACTOR',
    'SSD_READ_SPEED_MBPS',
    'SSD_WRITE_SPEED_MBPS',

    'CPU_SOCKET',
    'CPU_CORE_COUNT',
    'CPU_THREAD_COUNT',

    'GPU_VRAM_GB',
    'GPU_RECOMMENDED_PSU_W',
    'GPU_POWER_CONNECTOR',
    'GPU_TARGET_RESOLUTION',

    'MULTITASKING_LEVEL'
);

-- =========================================================
-- 14. GẮN THUỘC TÍNH MÀN HÌNH
-- =========================================================

INSERT IGNORE INTO category_attributes (
    category_id,
    attribute_id
)
SELECT
    c.category_id,
    pa.attribute_id
FROM categories c
CROSS JOIN product_attributes pa
WHERE c.category_slug IN (
    'man-hinh',
    'monitor'
)
AND pa.attribute_code IN (
    'MONITOR_SIZE_INCH',
    'MONITOR_RESOLUTION',
    'MONITOR_REFRESH_RATE_HZ',
    'MONITOR_PANEL_TYPE',
    'MONITOR_RESPONSE_TIME_MS'
);

-- =========================================================
-- 15. BỔ SUNG TAG CHUNG CHO AI
-- =========================================================

INSERT IGNORE INTO product_tags (tag_name)
VALUES
('sinh-vien'),
('hoc-sinh'),
('gia-re'),
('hoc-tap'),
('lap-trinh'),
('van-phong'),
('da-nhiem'),
('mo-nhieu-tab'),
('10-15-tab'),
('gaming-nhe'),
('gaming-trung-binh'),
('gaming-nang'),
('game-aaa'),
('do-hoa'),
('render'),
('chup-anh-tot'),
('quay-video-tot'),
('pin-tot'),
('sac-nhanh'),
('mong-nhe'),
('di-chuyen-nhieu'),
('nang-cap-may'),
('tuong-thich-laptop'),
('tuong-thich-desktop'),
('ram'),
('ssd'),
('cpu'),
('gpu'),
('man-hinh'),
('dien-thoai'),
('laptop'),
('phu-kien'),
('gia-duoi-500-nghin'),
('gia-duoi-1-trieu'),
('gia-duoi-2-trieu'),
('gia-duoi-5-trieu'),
('gia-duoi-10-trieu'),
('gia-tu-10-den-20-trieu'),
('gia-tu-20-den-30-trieu'),
('gia-tren-30-trieu');

-- =========================================================
-- 16. NÂNG CẤP AI_SEARCH_LOGS
-- =========================================================

CALL add_column_if_missing(
    'ai_search_logs',
    'detected_intent',
    'VARCHAR(100) NULL AFTER query_text'
);

CALL add_column_if_missing(
    'ai_search_logs',
    'detected_product_type',
    'VARCHAR(100) NULL AFTER detected_category_id'
);

CALL add_column_if_missing(
    'ai_search_logs',
    'detected_brand_id',
    'BIGINT UNSIGNED NULL AFTER detected_product_type'
);

CALL add_column_if_missing(
    'ai_search_logs',
    'parsed_requirements',
    'JSON NULL AFTER detected_purpose'
);

CALL add_column_if_missing(
    'ai_search_logs',
    'ai_provider',
    'VARCHAR(50) NULL AFTER parsed_requirements'
);

CALL add_column_if_missing(
    'ai_search_logs',
    'ai_model',
    'VARCHAR(100) NULL AFTER ai_provider'
);

CALL add_column_if_missing(
    'ai_search_logs',
    'processing_time_ms',
    'INT UNSIGNED NULL AFTER ai_model'
);

CALL add_column_if_missing(
    'ai_search_logs',
    'search_status',
    'VARCHAR(30) NOT NULL DEFAULT ''SUCCESS'' AFTER processing_time_ms'
);

CALL add_column_if_missing(
    'ai_search_logs',
    'error_message',
    'VARCHAR(500) NULL AFTER search_status'
);

CALL add_index_if_missing(
    'ai_search_logs',
    'idx_ai_search_logs_customer_time',
    'INDEX `idx_ai_search_logs_customer_time` (`customer_id`, `searched_at`)'
);

CALL add_index_if_missing(
    'ai_search_logs',
    'idx_ai_search_logs_category',
    'INDEX `idx_ai_search_logs_category` (`detected_category_id`)'
);

-- =========================================================
-- 17. NÂNG CẤP AI_SEARCH_RESULTS
-- =========================================================

CALL add_column_if_missing(
    'ai_search_results',
    'match_reasons',
    'JSON NULL AFTER match_score'
);

CALL add_column_if_missing(
    'ai_search_results',
    'matched_attributes',
    'JSON NULL AFTER match_reasons'
);

CALL add_column_if_missing(
    'ai_search_results',
    'created_at',
    'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER matched_attributes'
);

-- Cho phép điểm 100.0000.
ALTER TABLE ai_search_results
MODIFY COLUMN match_score DECIMAL(7,4) NULL;

CALL add_index_if_missing(
    'ai_search_results',
    'idx_ai_search_results_rank',
    'INDEX `idx_ai_search_results_rank` (`ai_search_log_id`, `result_rank`)'
);

CALL add_index_if_missing(
    'ai_search_results',
    'idx_ai_search_results_score',
    'INDEX `idx_ai_search_results_score` (`match_score`)'
);

-- =========================================================
-- 18. BẢNG HỘI THOẠI AI HỖ TRỢ KHÁCH HÀNG
-- Chỉ tạo mới, không ảnh hưởng bảng cũ
-- =========================================================

CREATE TABLE IF NOT EXISTS ai_conversations (
    conversation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NULL,
    conversation_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    conversation_title VARCHAR(255) NULL,
    ai_provider VARCHAR(50) NULL,
    ai_model VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    closed_at DATETIME NULL,

    CONSTRAINT fk_ai_conversations_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_ai_conversations_customer_status (
        customer_id,
        conversation_status
    ),

    INDEX idx_ai_conversations_updated_at (
        updated_at
    )
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_messages (
    message_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_type VARCHAR(30) NOT NULL,
    message_content TEXT NOT NULL,
    detected_intent VARCHAR(100) NULL,
    tool_name VARCHAR(100) NULL,
    tool_arguments JSON NULL,
    tool_result JSON NULL,
    token_usage INT UNSIGNED NULL,
    processing_time_ms INT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_messages_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES ai_conversations(conversation_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    INDEX idx_ai_messages_conversation_time (
        conversation_id,
        created_at
    ),

    INDEX idx_ai_messages_intent (
        detected_intent
    )
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 19. BẢNG LƯU PHẢN HỒI VỀ CÂU TRẢ LỜI AI
-- =========================================================

CREATE TABLE IF NOT EXISTS ai_message_feedback (
    feedback_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NULL,
    feedback_type VARCHAR(30) NOT NULL,
    feedback_note VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_message_feedback_message
        FOREIGN KEY (message_id)
        REFERENCES ai_messages(message_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_ai_message_feedback_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    UNIQUE KEY uq_ai_feedback_customer_message (
        message_id,
        customer_id
    )
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 20. DỌN PROCEDURE TẠM
-- =========================================================

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;

-- =========================================================
-- 21. KIỂM TRA KẾT QUẢ MIGRATION
-- =========================================================

SELECT
    attribute_id,
    attribute_code,
    attribute_name,
    value_type,
    attribute_unit,
    is_filterable,
    is_ai_searchable
FROM product_attributes
ORDER BY attribute_id;

SELECT
    c.category_id,
    c.category_name,
    c.category_slug,
    COUNT(ca.attribute_id) AS total_attributes
FROM categories c
LEFT JOIN category_attributes ca
    ON ca.category_id = c.category_id
GROUP BY
    c.category_id,
    c.category_name,
    c.category_slug
ORDER BY c.category_id;

SELECT
    COUNT(*) AS total_ai_tags
FROM product_tags;

SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN (
      'ai_search_logs',
      'ai_search_results',
      'ai_conversations',
      'ai_messages',
      'ai_message_feedback'
  )
ORDER BY table_name;

SELECT
    'MIGRATION COMPLETED' AS migration_status,
    DATABASE() AS database_name,
    NOW() AS completed_at;
    SET SQL_SAFE_UPDATES = 1;
    

SET SQL_SAFE_UPDATES = 0;

-- =====================================================
-- 1. ĐẢM BẢO 2 SẢN PHẨM TỒN TẠI
-- =====================================================

SELECT product_id, product_name, base_price
FROM products
WHERE product_id IN (32, 39);

-- =====================================================
-- 2. TẠO CÁC THUỘC TÍNH CẦN THIẾT NẾU CHƯA CÓ
-- =====================================================

INSERT IGNORE INTO product_attributes (
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
(
    'PRODUCT_TYPE',
    'Loại sản phẩm',
    'Thông tin chung',
    NULL,
    'TEXT',
    1,
    TRUE,
    TRUE,
    TRUE,
    'Loại sản phẩm dùng để tìm kiếm'
),
(
    'RAM_CAPACITY_GB',
    'Dung lượng RAM',
    'Thông số RAM',
    'GB',
    'NUMBER',
    2,
    TRUE,
    TRUE,
    TRUE,
    'Dung lượng RAM tính bằng GB'
),
(
    'TARGET_USER',
    'Đối tượng phù hợp',
    'AI Recommendation',
    NULL,
    'TEXT',
    3,
    FALSE,
    TRUE,
    TRUE,
    'Nhóm người dùng phù hợp'
),
(
    'USE_CASE',
    'Mục đích sử dụng',
    'AI Recommendation',
    NULL,
    'TEXT',
    4,
    FALSE,
    TRUE,
    TRUE,
    'Nhu cầu sử dụng phù hợp'
),
(
    'MULTITASKING_LEVEL',
    'Khả năng đa nhiệm',
    'AI Recommendation',
    NULL,
    'TEXT',
    5,
    FALSE,
    TRUE,
    TRUE,
    'Mức độ đa nhiệm phù hợp'
),
(
    'RAM_RECOMMENDED_TAB_COUNT',
    'Số tab trình duyệt phù hợp',
    'AI Recommendation',
    'tab',
    'NUMBER',
    6,
    FALSE,
    TRUE,
    TRUE,
    'Số tab trình duyệt phù hợp'
),
(
    'COMPATIBILITY_NOTE',
    'Thông tin tương thích',
    'Tương thích',
    NULL,
    'TEXT',
    7,
    FALSE,
    TRUE,
    TRUE,
    'Thông tin cần kiểm tra trước khi mua'
);

-- =====================================================
-- 3. GẮN CÁC THUỘC TÍNH RAM VÀO DANH MỤC LINH KIỆN PC
-- =====================================================

INSERT IGNORE INTO category_attributes (
    category_id,
    attribute_id
)
SELECT
    c.category_id,
    pa.attribute_id
FROM categories c
CROSS JOIN product_attributes pa
WHERE c.category_slug = 'linh-kien-pc'
  AND pa.attribute_code IN (
      'PRODUCT_TYPE',
      'RAM_CAPACITY_GB',
      'TARGET_USER',
      'USE_CASE',
      'MULTITASKING_LEVEL',
      'RAM_RECOMMENDED_TAB_COUNT',
      'COMPATIBILITY_NOTE'
  );

-- =====================================================
-- 4. INSERT THUỘC TÍNH RAM CORSAIR 32GB
-- PRODUCT_ID = 32
-- =====================================================

INSERT INTO product_attribute_values (
    product_id,
    attribute_id,
    attribute_value,
    numeric_value,
    boolean_value,
    normalized_value
)
SELECT
    32,
    pa.attribute_id,

    CASE pa.attribute_code
        WHEN 'PRODUCT_TYPE'
            THEN 'RAM'

        WHEN 'RAM_CAPACITY_GB'
            THEN '32'

        WHEN 'TARGET_USER'
            THEN 'Sinh viên công nghệ, lập trình viên và người dùng đa nhiệm'

        WHEN 'USE_CASE'
            THEN 'Học tập, lập trình, làm việc và mở nhiều tab'

        WHEN 'MULTITASKING_LEVEL'
            THEN 'Đa nhiệm cao'

        WHEN 'RAM_RECOMMENDED_TAB_COUNT'
            THEN '30'

        WHEN 'COMPATIBILITY_NOTE'
            THEN 'Cần kiểm tra chuẩn DDR, bus RAM và dạng DIMM hoặc SO-DIMM'
    END AS attribute_value,

    CASE pa.attribute_code
        WHEN 'RAM_CAPACITY_GB' THEN 32
        WHEN 'RAM_RECOMMENDED_TAB_COUNT' THEN 30
        ELSE NULL
    END AS numeric_value,

    NULL AS boolean_value,

    CASE pa.attribute_code
        WHEN 'PRODUCT_TYPE'
            THEN 'ram'

        WHEN 'RAM_CAPACITY_GB'
            THEN '32'

        WHEN 'TARGET_USER'
            THEN 'sinh vien cong nghe lap trinh vien nguoi dung da nhiem'

        WHEN 'USE_CASE'
            THEN 'hoc tap lap trinh lam viec mo nhieu tab'

        WHEN 'MULTITASKING_LEVEL'
            THEN 'da nhiem cao'

        WHEN 'RAM_RECOMMENDED_TAB_COUNT'
            THEN '30'

        WHEN 'COMPATIBILITY_NOTE'
            THEN 'kiem tra ddr bus ram dimm sodimm'
    END AS normalized_value

FROM product_attributes pa
WHERE pa.attribute_code IN (
    'PRODUCT_TYPE',
    'RAM_CAPACITY_GB',
    'TARGET_USER',
    'USE_CASE',
    'MULTITASKING_LEVEL',
    'RAM_RECOMMENDED_TAB_COUNT',
    'COMPATIBILITY_NOTE'
)
AND EXISTS (
    SELECT 1
    FROM products p
    WHERE p.product_id = 32
)

ON DUPLICATE KEY UPDATE
    attribute_value = VALUES(attribute_value),
    numeric_value = VALUES(numeric_value),
    boolean_value = VALUES(boolean_value),
    normalized_value = VALUES(normalized_value);

-- =====================================================
-- 5. INSERT THUỘC TÍNH RAM KINGSTON 16GB
-- PRODUCT_ID = 39
-- =====================================================

INSERT INTO product_attribute_values (
    product_id,
    attribute_id,
    attribute_value,
    numeric_value,
    boolean_value,
    normalized_value
)
SELECT
    39,
    pa.attribute_id,

    CASE pa.attribute_code
        WHEN 'PRODUCT_TYPE'
            THEN 'RAM'

        WHEN 'RAM_CAPACITY_GB'
            THEN '16'

        WHEN 'TARGET_USER'
            THEN 'Sinh viên, học sinh, nhân viên văn phòng và lập trình viên'

        WHEN 'USE_CASE'
            THEN 'Học tập, lập trình, văn phòng và mở 10 đến 15 tab'

        WHEN 'MULTITASKING_LEVEL'
            THEN 'Đa nhiệm khá'

        WHEN 'RAM_RECOMMENDED_TAB_COUNT'
            THEN '15'

        WHEN 'COMPATIBILITY_NOTE'
            THEN 'Cần kiểm tra chuẩn DDR, bus RAM và dạng DIMM hoặc SO-DIMM'
    END AS attribute_value,

    CASE pa.attribute_code
        WHEN 'RAM_CAPACITY_GB' THEN 16
        WHEN 'RAM_RECOMMENDED_TAB_COUNT' THEN 15
        ELSE NULL
    END AS numeric_value,

    NULL AS boolean_value,

    CASE pa.attribute_code
        WHEN 'PRODUCT_TYPE'
            THEN 'ram'

        WHEN 'RAM_CAPACITY_GB'
            THEN '16'

        WHEN 'TARGET_USER'
            THEN 'sinh vien hoc sinh nhan vien van phong lap trinh vien'

        WHEN 'USE_CASE'
            THEN 'hoc tap lap trinh van phong mo 10 den 15 tab'

        WHEN 'MULTITASKING_LEVEL'
            THEN 'da nhiem kha'

        WHEN 'RAM_RECOMMENDED_TAB_COUNT'
            THEN '15'

        WHEN 'COMPATIBILITY_NOTE'
            THEN 'kiem tra ddr bus ram dimm sodimm'
    END AS normalized_value

FROM product_attributes pa
WHERE pa.attribute_code IN (
    'PRODUCT_TYPE',
    'RAM_CAPACITY_GB',
    'TARGET_USER',
    'USE_CASE',
    'MULTITASKING_LEVEL',
    'RAM_RECOMMENDED_TAB_COUNT',
    'COMPATIBILITY_NOTE'
)
AND EXISTS (
    SELECT 1
    FROM products p
    WHERE p.product_id = 39
)

ON DUPLICATE KEY UPDATE
    attribute_value = VALUES(attribute_value),
    numeric_value = VALUES(numeric_value),
    boolean_value = VALUES(boolean_value),
    normalized_value = VALUES(normalized_value);

-- =====================================================
-- 6. TẠO TAG NẾU CHƯA CÓ
-- =====================================================

INSERT IGNORE INTO product_tags (tag_name)
VALUES
('ram'),
('sinh-vien'),
('hoc-sinh'),
('hoc-tap'),
('lap-trinh'),
('van-phong'),
('da-nhiem'),
('mo-nhieu-tab'),
('10-15-tab'),
('nang-cap-may'),
('gia-re'),
('gia-duoi-2-trieu'),
('gia-duoi-5-trieu');

-- =====================================================
-- 7. GẮN TAG CHO RAM CORSAIR 32GB
-- =====================================================

INSERT IGNORE INTO product_tag_mapping (
    product_id,
    tag_id
)
SELECT
    32,
    pt.tag_id
FROM product_tags pt
WHERE pt.tag_name IN (
    'ram',
    'sinh-vien',
    'lap-trinh',
    'van-phong',
    'da-nhiem',
    'mo-nhieu-tab',
    'nang-cap-may',
    'gia-duoi-5-trieu'
)
AND EXISTS (
    SELECT 1
    FROM products p
    WHERE p.product_id = 32
);

-- =====================================================
-- 8. GẮN TAG CHO RAM KINGSTON 16GB
-- =====================================================

INSERT IGNORE INTO product_tag_mapping (
    product_id,
    tag_id
)
SELECT
    39,
    pt.tag_id
FROM product_tags pt
WHERE pt.tag_name IN (
    'ram',
    'sinh-vien',
    'hoc-sinh',
    'hoc-tap',
    'lap-trinh',
    'van-phong',
    'da-nhiem',
    'mo-nhieu-tab',
    '10-15-tab',
    'nang-cap-may',
    'gia-re',
    'gia-duoi-2-trieu'
)
AND EXISTS (
    SELECT 1
    FROM products p
    WHERE p.product_id = 39
);

SET SQL_SAFE_UPDATES = 1;

-- =====================================================
-- 9. KIỂM TRA KẾT QUẢ THUỘC TÍNH
-- =====================================================

SELECT
    p.product_id,
    p.product_name,
    pa.attribute_code,
    pav.attribute_value,
    pav.numeric_value,
    pav.normalized_value
FROM product_attribute_values pav
JOIN products p
    ON p.product_id = pav.product_id
JOIN product_attributes pa
    ON pa.attribute_id = pav.attribute_id
WHERE p.product_id IN (32, 39)
ORDER BY
    p.product_id,
    pa.attribute_code;

-- =====================================================
-- 10. KIỂM TRA KẾT QUẢ TAG
-- =====================================================

SELECT
    p.product_id,
    p.product_name,
    pt.tag_name
FROM product_tag_mapping ptm
JOIN products p
    ON p.product_id = ptm.product_id
JOIN product_tags pt
    ON pt.tag_id = ptm.tag_id
WHERE p.product_id IN (32, 39)
ORDER BY
    p.product_id,
    pt.tag_name;
    
    SELECT product_id, product_name
FROM products
WHERE product_id IN (32, 39);


USE electroshop_db;

SELECT
    ai_search_log_id,
    query_text,
    search_status,
    error_message,
    searched_at
FROM ai_search_logs
ORDER BY ai_search_log_id DESC
LIMIT 5;