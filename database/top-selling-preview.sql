use electroshop_db;
-- Đây là SELECT để đọc top sản phẩm bán chạy, KHÔNG phải INSERT.
-- INSERT chỉ dùng để thêm dữ liệu mới, không dùng để xếp hạng sản phẩm.

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
