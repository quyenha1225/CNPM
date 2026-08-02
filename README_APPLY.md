# CNPM Customer UI Upgrade

Bộ vá này nâng cấp các phần:

- Trang danh sách sản phẩm: hero/filter/sidebar/card/phân trang đồng bộ palette Gearxin.
- Product Detail: ảnh sản phẩm, thông số, chọn cấu hình, số lượng, thêm giỏ và mua ngay.
- Giỏ hàng: CRUD đầy đủ ở frontend, phân biệt từng variant, tăng/giảm/nhập số lượng, xóa từng dòng, xóa toàn bộ.
- Thanh toán: giao diện mới, validate người nhận, phương thức QR/chuyển khoản, tóm tắt đơn và chỉ xóa giỏ sau khi xác nhận thành công.
- Bắt đăng nhập trước khi thêm giỏ hoặc mua hàng từ Product Card và Product Detail.

## Cách áp dụng tự động

Mở PowerShell trong thư mục giải nén:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\apply_upgrade.ps1 "D:\CMC_Uni\HocKi_5\Công nghệ phần mềm\CNPM\CNPM"
```

Script tạo bản sao file cũ với hậu tố:

```text
.before-customer-ui-upgrade
```

Sau đó chạy lại frontend:

```powershell
cd frontend
npm start
```

Tải lại trình duyệt bằng `Ctrl + Shift + R`.

## Áp dụng thủ công

Copy thư mục `frontend/src/...` trong gói vào đúng thư mục của project.

Trong `frontend/src/products/ProductList.js`, thêm:

```js
import "./ProductCatalogV2.css";
```

ngay sau:

```js
import Product from "./Product";
```

Đổi dòng mô tả kỹ thuật:

```jsx
Dữ liệu được lọc và phân trang trực tiếp từ backend.
```

thành:

```jsx
Khám phá sản phẩm chính hãng theo nhu cầu, thương hiệu và ngân sách của bạn.
```

## Lưu ý quan trọng về backend thanh toán

Nhánh `check/staff` công khai hiện đăng ký `CartModule` nhưng chưa đăng ký `PaymentModule` hoặc `OrdersModule` trong `backend/src/app.module.ts`. Giao diện Payment cũ cũng đã gọi `/api/payment`, nên nếu local backend của bạn chưa có endpoint này thì nút tạo đơn sẽ báo 404.

Kiểm tra nhanh:

```text
POST http://localhost:3001/api/payment
```

Các endpoint mà giao diện đang cần:

```text
POST /api/payment
POST /api/payment/:orderId/confirm
```

Bộ vá này hoàn thiện UI và CRUD giỏ hàng ở frontend. Việc hủy một đơn đã được tạo trong database cần thêm trang lịch sử đơn hàng và endpoint riêng, ví dụ:

```text
GET   /api/orders/me
PATCH /api/orders/:orderId/cancel
```

Chỉ nên cho khách hủy khi đơn ở trạng thái `PENDING` hoặc `CONFIRMED` theo quy tắc nghiệp vụ của dự án.
