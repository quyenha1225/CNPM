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