-- ============================================================
-- CNPM / ELECTROSHOP DATABASE
-- FILE 01: CREATE DATABASE, TABLES, VIEWS, TRIGGERS
--
-- THỨ TỰ CHẠY:
--   1) 01_create_tables.sql
--   2) 02_insert_data.sql
--   3) 03_ai_setup.sql
--
-- CẢNH BÁO: file này DROP DATABASE electroshop_db để tạo mới sạch.
-- ============================================================

-- =========================================================
-- Xoa database cu (neu co) de dam bao chay lai file nay luon sach,
-- tranh cac loi "already exists" / "Duplicate column" khi chay lai.
-- CAN THAN: dong nay se XOA TOAN BO du lieu cu trong electroshop_db.
-- =========================================================
DROP DATABASE IF EXISTS electroshop_db;

CREATE DATABASE IF NOT EXISTS electroshop_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE electroshop_db;

SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 1. ROLE & PERMISSION
-- =========================================================

CREATE TABLE IF NOT EXISTS roles (
    role_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    role_description VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
    permission_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    permission_name VARCHAR(150) NOT NULL,
    permission_description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),

    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 2. USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL,
    user_full_name VARCHAR(150) NOT NULL,
    user_email VARCHAR(150) NOT NULL UNIQUE,
    user_phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_addresses (
    address_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    receiver_name VARCHAR(150) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    province_name VARCHAR(100) NOT NULL,
    district_name VARCHAR(100) NOT NULL,
    ward_name VARCHAR(100) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_addresses_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_logs (
    login_log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    ip_address VARCHAR(50),
    device_info VARCHAR(255),
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    login_status VARCHAR(30) NOT NULL,

    CONSTRAINT fk_login_logs_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 3. CATEGORY, BRAND, PRODUCT
-- =========================================================

CREATE TABLE IF NOT EXISTS categories (
    category_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_category_id BIGINT UNSIGNED NULL,
    category_name VARCHAR(150) NOT NULL,
    category_slug VARCHAR(180) NOT NULL UNIQUE,
    category_description TEXT,
    category_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brands (
    brand_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(150) NOT NULL UNIQUE,
    brand_description TEXT,
    brand_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    product_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    brand_id BIGINT UNSIGNED NULL,
    product_name VARCHAR(200) NOT NULL,
    product_slug VARCHAR(220) NOT NULL UNIQUE,
    product_description TEXT,
    base_price DECIMAL(15,2) NOT NULL,
    warranty_months INT DEFAULT 0,
    product_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_by_user_id BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_products_brand
        FOREIGN KEY (brand_id) REFERENCES brands(brand_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_products_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_products_updated_by
        FOREIGN KEY (updated_by_user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CHECK (base_price >= 0),
    CHECK (warranty_months >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE products
ADD COLUMN sku VARCHAR(100) UNIQUE AFTER product_slug,
ADD COLUMN barcode VARCHAR(100) NULL AFTER sku,
ADD COLUMN manufacturer_part_number VARCHAR(100) NULL AFTER barcode,
ADD COLUMN release_year YEAR NULL AFTER manufacturer_part_number,
ADD COLUMN origin_country VARCHAR(100) NULL AFTER release_year;

CREATE TABLE IF NOT EXISTS product_images (
    image_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_thumbnail BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_attributes (
    attribute_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attribute_code VARCHAR(100) NULL,
    attribute_name VARCHAR(100) NOT NULL UNIQUE,
    spec_group VARCHAR(100) NULL,
    attribute_unit VARCHAR(50) NULL,
    value_type VARCHAR(30) NOT NULL DEFAULT 'TEXT',
    display_order INT NOT NULL DEFAULT 0,
    is_highlight BOOLEAN NOT NULL DEFAULT FALSE,
    is_filterable BOOLEAN NOT NULL DEFAULT TRUE,
    is_ai_searchable BOOLEAN NOT NULL DEFAULT TRUE,
    attribute_description VARCHAR(255) NULL,

    UNIQUE KEY uq_product_attributes_code (attribute_code),

    INDEX idx_product_attributes_ai (
        is_ai_searchable,
        is_filterable
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS category_attributes (
    category_id BIGINT UNSIGNED NOT NULL,
    attribute_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (category_id, attribute_id),

    CONSTRAINT fk_category_attributes_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_category_attributes_attribute
        FOREIGN KEY (attribute_id) REFERENCES product_attributes(attribute_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_attribute_values (
    product_id BIGINT UNSIGNED NOT NULL,
    attribute_id BIGINT UNSIGNED NOT NULL,
    attribute_value VARCHAR(255) NOT NULL,
    numeric_value DECIMAL(18,4) NULL,
    boolean_value BOOLEAN NULL,
    normalized_value VARCHAR(255) NULL,
    PRIMARY KEY (product_id, attribute_id),

    CONSTRAINT fk_product_attribute_values_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_product_attribute_values_attribute
        FOREIGN KEY (attribute_id) REFERENCES product_attributes(attribute_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    INDEX idx_product_attribute_numeric (
        attribute_id,
        numeric_value
    ),

    INDEX idx_product_attribute_normalized (
        attribute_id,
        normalized_value
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_variants (
    variant_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    variant_name VARCHAR(200),
    sku VARCHAR(100) UNIQUE,
    color VARCHAR(100),
    ram_size VARCHAR(50),
    storage_size VARCHAR(50),
    gpu_option VARCHAR(100),
    cpu_option VARCHAR(100),
    additional_price DECIMAL(15,2) DEFAULT 0,
    variant_status VARCHAR(30) DEFAULT 'ACTIVE',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_variants_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_logs (
    product_log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    changed_by_user_id BIGINT UNSIGNED NULL,
    product_action VARCHAR(50) NOT NULL,
    old_data JSON,
    new_data JSON,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_logs_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_product_logs_user
        FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 4. SUPPLIER & INVENTORY
-- =========================================================

CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(200) NOT NULL UNIQUE,
    supplier_phone VARCHAR(20),
    supplier_email VARCHAR(150),
    supplier_address VARCHAR(255),
    supplier_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_suppliers (
    product_id BIGINT UNSIGNED NOT NULL,
    supplier_id BIGINT UNSIGNED NOT NULL,
    supplier_sku VARCHAR(100),
    cost_price DECIMAL(15,2),
    PRIMARY KEY (product_id, supplier_id),

    CONSTRAINT fk_product_suppliers_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_product_suppliers_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CHECK (cost_price IS NULL OR cost_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_transaction_types (
    inventory_type_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inventory_type_code VARCHAR(30) NOT NULL UNIQUE,
    inventory_type_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- da them variant_id (nullable) de dong bo voi variant_inventory ben duoi
CREATE TABLE IF NOT EXISTS inventory_transactions (
    inventory_transaction_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    variant_id BIGINT UNSIGNED NULL,
    supplier_id BIGINT UNSIGNED NULL,
    staff_user_id BIGINT UNSIGNED NULL,
    inventory_type_id BIGINT UNSIGNED NOT NULL,
    transaction_quantity INT NOT NULL,
    unit_cost DECIMAL(15,2),
    transaction_note VARCHAR(255),
    transaction_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_transactions_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_inventory_transactions_variant
        FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_inventory_transactions_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_inventory_transactions_user
        FOREIGN KEY (staff_user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_inventory_transactions_type
        FOREIGN KEY (inventory_type_id) REFERENCES inventory_transaction_types(inventory_type_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CHECK (transaction_quantity <> 0),
    CHECK (unit_cost IS NULL OR unit_cost >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS variant_inventory (
    variant_id BIGINT UNSIGNED PRIMARY KEY,
    stock_quantity INT DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_variant_inventory_variant
        FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_tags (
    tag_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(100) UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_tag_mapping (
    product_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (product_id, tag_id),

    CONSTRAINT fk_product_tag_mapping_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_product_tag_mapping_tag
        FOREIGN KEY (tag_id) REFERENCES product_tags(tag_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 5. CART
-- =========================================================

CREATE TABLE IF NOT EXISTS carts (
    cart_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL UNIQUE,
    cart_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_carts_user
        FOREIGN KEY (customer_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- variant_key la generated column thay the IFNULL(variant_id, 0) truc tiep
-- trong PRIMARY KEY (MySQL khong cho phep functional key part trong PK).
-- LUU Y QUAN TRONG: vi variant_id la cot goc cua generated column
-- (variant_key), InnoDB KHONG CHO PHEP FK tren variant_id dung
-- CASCADE / SET NULL (loi 1215 "Cannot add foreign key constraint").
-- Vi vay FK nay phai dung RESTRICT: muon xoa/doi variant_id dang duoc
-- tham chieu trong cart_items thi phai xu ly o tang ung dung truoc
-- (xoa/cap nhat cart_items lien quan), MySQL se khong tu CASCADE.
CREATE TABLE IF NOT EXISTS cart_items (
    cart_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    variant_id BIGINT UNSIGNED NULL,
    variant_key BIGINT UNSIGNED GENERATED ALWAYS AS (IFNULL(variant_id, 0)) STORED,
    cart_quantity INT NOT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cart_id, product_id, variant_key),

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_cart_items_variant
        FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,

    CHECK (cart_quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 6. ORDER
-- =========================================================

CREATE TABLE IF NOT EXISTS order_statuses (
    order_status_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_status_code VARCHAR(50) NOT NULL UNIQUE,
    order_status_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT UNSIGNED NOT NULL,
    order_status_id BIGINT UNSIGNED NOT NULL,
    order_note VARCHAR(255),
    order_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user
        FOREIGN KEY (customer_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_orders_status
        FOREIGN KEY (order_status_id) REFERENCES order_statuses(order_status_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_shipping_addresses (
    order_id BIGINT UNSIGNED PRIMARY KEY,
    receiver_name VARCHAR(150) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    shipping_province VARCHAR(100) NOT NULL,
    shipping_district VARCHAR(100) NOT NULL,
    shipping_ward VARCHAR(100) NOT NULL,
    shipping_street VARCHAR(255) NOT NULL,

    CONSTRAINT fk_order_shipping_addresses_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- variant_key la generated column thay the IFNULL(variant_id, 0) truc tiep
-- trong PRIMARY KEY. LUU Y: cung nhu cart_items, FK tren variant_id
-- KHONG duoc dung SET NULL / CASCADE vi variant_id la cot goc cua
-- generated column variant_key -> phai dung RESTRICT.
CREATE TABLE IF NOT EXISTS order_items (
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    variant_id BIGINT UNSIGNED NULL,
    variant_key BIGINT UNSIGNED GENERATED ALWAYS AS (IFNULL(variant_id, 0)) STORED,
    ordered_quantity INT NOT NULL,
    unit_price_at_order DECIMAL(15,2) NOT NULL,
    PRIMARY KEY (order_id, product_id, variant_key),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_order_items_variant
        FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,

    CHECK (ordered_quantity > 0),
    CHECK (unit_price_at_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_status_logs (
    order_status_log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    old_order_status_id BIGINT UNSIGNED NULL,
    new_order_status_id BIGINT UNSIGNED NOT NULL,
    changed_by_user_id BIGINT UNSIGNED NULL,
    status_note VARCHAR(255),
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_status_logs_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_order_status_logs_old_status
        FOREIGN KEY (old_order_status_id) REFERENCES order_statuses(order_status_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_order_status_logs_new_status
        FOREIGN KEY (new_order_status_id) REFERENCES order_statuses(order_status_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_order_status_logs_user
        FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 7. PAYMENT
-- =========================================================

CREATE TABLE IF NOT EXISTS payment_methods (
    payment_method_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_method_code VARCHAR(50) NOT NULL UNIQUE,
    payment_method_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_statuses (
    payment_status_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_status_code VARCHAR(50) NOT NULL UNIQUE,
    payment_status_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    payment_method_id BIGINT UNSIGNED NOT NULL,
    payment_status_id BIGINT UNSIGNED NOT NULL,
    payment_code VARCHAR(100) NOT NULL UNIQUE,
    payment_amount DECIMAL(15,2) NOT NULL,
    qr_content TEXT,
    transaction_code VARCHAR(100),
    paid_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_payments_method
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_payments_status
        FOREIGN KEY (payment_status_id) REFERENCES payment_statuses(payment_status_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CHECK (payment_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 8. PRODUCT REVIEW
-- =========================================================

CREATE TABLE IF NOT EXISTS product_reviews (
    review_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NULL,
    rating TINYINT UNSIGNED NOT NULL,
    review_title VARCHAR(255),
    review_content TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    review_status VARCHAR(30) DEFAULT 'PENDING',
    helpful_count INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_reviews_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_product_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_product_reviews_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_review_images (
    review_image_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,

    CONSTRAINT fk_product_review_images_review
        FOREIGN KEY (review_id) REFERENCES product_reviews(review_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_review_replies (
    reply_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT UNSIGNED NOT NULL,
    staff_user_id BIGINT UNSIGNED NOT NULL,
    reply_content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_reply_review
        FOREIGN KEY (review_id) REFERENCES product_reviews(review_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_review_reply_staff
        FOREIGN KEY (staff_user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE products
ADD COLUMN average_rating DECIMAL(2,1) DEFAULT 0.0 AFTER base_price,
ADD COLUMN review_count INT DEFAULT 0 AFTER average_rating;

-- =========================================================
-- 9. AI SEARCH
-- =========================================================

CREATE TABLE IF NOT EXISTS ai_search_logs (
    ai_search_log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NULL,
    query_text TEXT NOT NULL,
    detected_intent VARCHAR(100) NULL,
    detected_category_id BIGINT UNSIGNED NULL,
    detected_product_type VARCHAR(100) NULL,
    detected_brand_id BIGINT UNSIGNED NULL,
    detected_min_price DECIMAL(15,2) NULL,
    detected_max_price DECIMAL(15,2) NULL,
    detected_purpose VARCHAR(255) NULL,
    parsed_requirements JSON NULL,
    ai_provider VARCHAR(50) NULL,
    ai_model VARCHAR(100) NULL,
    processing_time_ms INT UNSIGNED NULL,
    search_status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    error_message VARCHAR(500) NULL,
    searched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_search_logs_user
        FOREIGN KEY (customer_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_ai_search_logs_category
        FOREIGN KEY (detected_category_id) REFERENCES categories(category_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_ai_search_logs_brand
        FOREIGN KEY (detected_brand_id) REFERENCES brands(brand_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_ai_search_logs_customer_time (
        customer_id,
        searched_at
    ),

    INDEX idx_ai_search_logs_category (
        detected_category_id
    ),

    CHECK (detected_min_price IS NULL OR detected_min_price >= 0),
    CHECK (detected_max_price IS NULL OR detected_max_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_search_results (
    ai_search_log_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    result_rank INT NOT NULL,
    match_score DECIMAL(7,4) NULL,
    match_reasons JSON NULL,
    matched_attributes JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ai_search_log_id, product_id),

    CONSTRAINT fk_ai_search_results_log
        FOREIGN KEY (ai_search_log_id) REFERENCES ai_search_logs(ai_search_log_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_ai_search_results_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    INDEX idx_ai_search_results_rank (
        ai_search_log_id,
        result_rank
    ),

    INDEX idx_ai_search_results_score (
        match_score
    ),

    CHECK (result_rank > 0),
    CHECK (match_score IS NULL OR match_score >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- =========================================================
-- 9.1 PASSWORD RESET OTP
-- =========================================================

CREATE TABLE IF NOT EXISTS password_reset_otps (
    reset_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    otp_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    verified_at DATETIME NULL,
    used_at DATETIME NULL,
    attempt_count INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_password_reset_otp_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    INDEX idx_password_reset_user_created (
        user_id,
        created_at
    ),

    INDEX idx_password_reset_expiry (
        expires_at
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 9.2 AI CONVERSATION TABLES
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
        FOREIGN KEY (customer_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_ai_conversations_customer_status (
        customer_id,
        conversation_status
    ),

    INDEX idx_ai_conversations_updated_at (
        updated_at
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
        FOREIGN KEY (conversation_id) REFERENCES ai_conversations(conversation_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    INDEX idx_ai_messages_conversation_time (
        conversation_id,
        created_at
    ),

    INDEX idx_ai_messages_intent (
        detected_intent
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_message_feedback (
    feedback_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NULL,
    feedback_type VARCHAR(30) NOT NULL,
    feedback_note VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_message_feedback_message
        FOREIGN KEY (message_id) REFERENCES ai_messages(message_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_ai_message_feedback_customer
        FOREIGN KEY (customer_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    UNIQUE KEY uq_ai_feedback_customer_message (
        message_id,
        customer_id
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 10. AUDIT LOG
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    actor_user_id BIGINT UNSIGNED NULL,
    action_name VARCHAR(100) NOT NULL,
    affected_table_name VARCHAR(100) NOT NULL,
    affected_record_id BIGINT UNSIGNED NULL,
    action_description TEXT,
    action_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_logs_user
        FOREIGN KEY (actor_user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 11. VIEW TINH TOAN
-- =========================================================

DROP VIEW IF EXISTS vw_best_selling_products;
DROP VIEW IF EXISTS vw_customer_spending;
DROP VIEW IF EXISTS vw_order_totals;
DROP VIEW IF EXISTS vw_product_stock;

CREATE VIEW vw_product_stock AS
SELECT
    p.product_id,
    p.product_name,
    COALESCE(
        SUM(
            CASE
                WHEN itt.inventory_type_code = 'IN' THEN it.transaction_quantity
                WHEN itt.inventory_type_code = 'OUT' THEN -it.transaction_quantity
                WHEN itt.inventory_type_code = 'ADJUST' THEN it.transaction_quantity
                ELSE 0
            END
        ), 0
    ) AS current_stock
FROM products p
LEFT JOIN inventory_transactions it
    ON p.product_id = it.product_id
LEFT JOIN inventory_transaction_types itt
    ON it.inventory_type_id = itt.inventory_type_id
GROUP BY p.product_id, p.product_name;

CREATE VIEW vw_order_totals AS
SELECT
    o.order_id,
    o.order_code,
    COALESCE(SUM(oi.ordered_quantity * oi.unit_price_at_order), 0) AS total_amount
FROM orders o
LEFT JOIN order_items oi
    ON o.order_id = oi.order_id
GROUP BY o.order_id, o.order_code;

CREATE VIEW vw_customer_spending AS
SELECT
    u.user_id,
    u.user_full_name,
    COALESCE(
        SUM(
            CASE
                WHEN os.order_status_code = 'DELIVERED'
                THEN oi.ordered_quantity * oi.unit_price_at_order
                ELSE 0
            END
        ), 0
    ) AS total_spent
FROM users u
LEFT JOIN orders o
    ON u.user_id = o.customer_id
LEFT JOIN order_statuses os
    ON o.order_status_id = os.order_status_id
LEFT JOIN order_items oi
    ON o.order_id = oi.order_id
GROUP BY u.user_id, u.user_full_name;

CREATE VIEW vw_best_selling_products AS
SELECT
    p.product_id,
    p.product_name,
    COALESCE(
        SUM(
            CASE
                WHEN os.order_status_code = 'DELIVERED'
                THEN oi.ordered_quantity
                ELSE 0
            END
        ), 0
    ) AS total_sold
FROM products p
LEFT JOIN order_items oi
    ON p.product_id = oi.product_id
LEFT JOIN orders o
    ON oi.order_id = o.order_id
LEFT JOIN order_statuses os
    ON o.order_status_id = os.order_status_id
GROUP BY p.product_id, p.product_name;

-- =========================================================
-- BANG CON THIEU: user_view_history
-- (ProductsService.getRecommendedProducts / logView dang dung bang nay
--  nhung no khong co trong schema.sql goc)
-- =========================================================

CREATE TABLE IF NOT EXISTS user_view_history (
    view_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_view_history_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_user_view_history_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    INDEX idx_user_view_history_product (product_id),
    INDEX idx_user_view_history_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TRIGGER: tu dong cap nhat products.average_rating / review_count
-- Chi tinh cac review co review_status = 'APPROVED'.
-- Vi review moi tao mac dinh la PENDING (theo schema), rating se
-- CHUA doi ngay khi user gui danh gia - chi doi khi admin duyet
-- (UPDATE product_reviews SET review_status = 'APPROVED' ...).
-- Neu do an ban muon hien ngay khong can duyet, bo dieu kien
-- review_status = 'APPROVED' trong ca 3 trigger ben duoi.
-- =========================================================

DROP TRIGGER IF EXISTS trg_review_after_insert;
DROP TRIGGER IF EXISTS trg_review_after_update;
DROP TRIGGER IF EXISTS trg_review_after_delete;

DELIMITER $$

CREATE TRIGGER trg_review_after_insert
AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
  UPDATE products p
  SET p.review_count = (
        SELECT COUNT(*) FROM product_reviews r
        WHERE r.product_id = NEW.product_id AND r.review_status = 'APPROVED'
      ),
      p.average_rating = (
        SELECT COALESCE(AVG(r.rating), 0) FROM product_reviews r
        WHERE r.product_id = NEW.product_id AND r.review_status = 'APPROVED'
      )
  WHERE p.product_id = NEW.product_id;
END$$

CREATE TRIGGER trg_review_after_update
AFTER UPDATE ON product_reviews
FOR EACH ROW
BEGIN
  UPDATE products p
  SET p.review_count = (
        SELECT COUNT(*) FROM product_reviews r
        WHERE r.product_id = NEW.product_id AND r.review_status = 'APPROVED'
      ),
      p.average_rating = (
        SELECT COALESCE(AVG(r.rating), 0) FROM product_reviews r
        WHERE r.product_id = NEW.product_id AND r.review_status = 'APPROVED'
      )
  WHERE p.product_id = NEW.product_id;
END$$

CREATE TRIGGER trg_review_after_delete
AFTER DELETE ON product_reviews
FOR EACH ROW
BEGIN
  UPDATE products p
  SET p.review_count = (
        SELECT COUNT(*) FROM product_reviews r
        WHERE r.product_id = OLD.product_id AND r.review_status = 'APPROVED'
      ),
      p.average_rating = (
        SELECT COALESCE(AVG(r.rating), 0) FROM product_reviews r
        WHERE r.product_id = OLD.product_id AND r.review_status = 'APPROVED'
      )
  WHERE p.product_id = OLD.product_id;
END$$

DELIMITER ;
USE electroshop_db;

CREATE TABLE IF NOT EXISTS password_reset_otps (
    reset_otp_id BIGINT UNSIGNED
        AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NULL,

    email VARCHAR(255)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NOT NULL,

    otp_hash VARCHAR(255) NOT NULL,

    expires_at DATETIME NOT NULL,

    verified_at DATETIME NULL,

    used_at DATETIME NULL,

    attempts INT UNSIGNED
        NOT NULL DEFAULT 0,

    created_at DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_password_reset_email_created (
        email,
        created_at
    ),

    INDEX idx_password_reset_user (
        user_id
    )
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;