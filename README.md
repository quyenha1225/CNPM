../CNPM
npm run install-all
npm run dev

Thêm vào dependencies:




run/
npm install cookie-parser
npm install -D @types/cookie-parser
# CNPM Gearxin — Admin hoàn chỉnh + cấu hình cloud bằng ENV

Gói này bổ sung các trang Admin thật thay cho placeholder và giữ nguyên API Admin đã chạy được trong project.

## Chức năng đã hoàn thiện

- Tổng quan lấy dữ liệu thật từ `/api/admin/dashboard`.
- Quản lý sản phẩm: tìm kiếm, lọc, phân trang, thêm/sửa, bật/tắt, ảnh, biến thể, thông số kỹ thuật.
- Quản lý kho: tồn kho, giữ chỗ, khả dụng, lịch sử, nhập/xuất/điều chỉnh.
- Đơn hàng: tìm kiếm, lọc trạng thái, cập nhật trạng thái, xem chi tiết.
- Người dùng: tìm kiếm, lọc, khóa/mở khóa. Đã sửa payload backend từ `accountStatus` thành `status`.
- Nhân viên: danh sách, tạo tài khoản STAFF, khóa/mở khóa.
- Đánh giá: duyệt, từ chối, phản hồi.
- Khuyến mãi: danh sách, tạo, sửa, vô hiệu hóa.
- AI Search: cấu hình ENV trong database và lịch sử truy vấn.
- Báo cáo: doanh thu, đơn hàng, khách mua, sản phẩm bán chạy.
- Audit log: tìm kiếm, lọc ngày, phân trang.

## Cấu hình API

Tất cả trang Admin mới dùng:

```text
frontend/src/config/api.js
```

Thứ tự ưu tiên:

1. `frontend/public/runtime-config.js`
2. `REACT_APP_API_URL` trong `.env`
3. `/api` cùng domain

### Local

Tạo `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_STORE_URL=http://localhost:3000
REACT_APP_REQUEST_TIMEOUT_MS=20000
```

### Cloud

Tạo `frontend/.env.production`:

```env
REACT_APP_API_URL=https://api-tenmien-cua-ban.com/api
REACT_APP_STORE_URL=https://tenmien-cua-ban.com
REACT_APP_REQUEST_TIMEOUT_MS=30000
```

Sau khi đổi `.env.production`, chạy lại:

```bash
npm run build
```

Hoặc sửa trực tiếp sau khi build:

```js
// frontend/build/runtime-config.js
window.__GEARXIN_CONFIG__ = {
  API_URL: "https://api-tenmien-cua-ban.com/api",
  STORE_URL: "https://tenmien-cua-ban.com",
  REQUEST_TIMEOUT_MS: 30000,
};
```

## Backend cloud

Thay `backend/.env` theo file `.env.production.example`.

Frontend và backend tách domain cần:

```env
NODE_ENV=production
FRONTEND_URLS=https://tenmien-frontend.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
TRUST_PROXY=true
```

Nếu frontend và backend cùng một domain/reverse proxy, có thể dùng:

```env
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
```

Không đưa `DB_PASSWORD`, `JWT_SECRET` hoặc `GEMINI_API_KEY` vào frontend.

## Cách áp dụng tự động

Mở PowerShell tại thư mục đã giải nén:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\apply_full_admin_cloud_patch.ps1 "D:\CMC_Uni\HocKi_5\Công nghệ phần mềm\CNPM\CNPM"
```

Script tự sao lưu file cũ trước khi copy.

## Chạy lại

Backend:

```powershell
cd backend
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm install
npm run build
npm run start:dev
```

Frontend:

```powershell
cd frontend
npm install
npm start
```

## Kiểm tra API

Sau khi đăng nhập Admin:

```text
http://localhost:3001/api/admin/products?page=1&limit=10
http://localhost:3001/api/admin/inventory?page=1&limit=10
http://localhost:3001/api/admin/dashboard
```

## Lưu ý

- Database của bạn đã có dữ liệu, không cần chạy lại SQL cho patch frontend này.
- File `backend/src/main.ts` và `backend/src/auth/auth.controller.ts` trong gói bổ sung CORS/cookie theo ENV để triển khai cloud.
- Nếu dùng hosting frontend tĩnh và backend riêng, phải bật HTTPS để cookie `SameSite=None` hoạt động.
