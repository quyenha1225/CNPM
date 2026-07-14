# Hướng dẫn cài đặt và sử dụng

## Tính năng đã xây dựng

### 1. ✅ Quản lý trạng thái người dùng (AuthContext)
- Đăng ký tài khoản mới
- Đăng nhập với email/password
- Lưu token JWT vào localStorage
- Tự động load user khi ứng dụng khởi động
- Logout

### 2. ✅ Giỏ hàng (CartContext)
- Thêm sản phẩm vào giỏ hàng
- Cập nhật số lượng sản phẩm
- Xóa sản phẩm khỏi giỏ hàng
- Tính tổng số lượng sản phẩm
- Tính tổng tiền tự động
- Lưu giỏ hàng vào localStorage
- Tự động load giỏ hàng từ localStorage

### 3. ✅ Trang Login/Register
- Form đăng nhập với email/password
- Form đăng ký với name/email/password/confirm password
- Xử lý lỗi validation
- Redirect sau khi đăng nhập/đăng ký thành công

### 4. ✅ Trang Giỏ hàng
- Hiển thị danh sách sản phẩm trong giỏ
- Cập nhật số lượng cho từng sản phẩm
- Xóa sản phẩm khỏi giỏ
- Hiển thị tổng tiền và số lượng sản phẩm
- Nút thanh toán (yêu cầu login nếu chưa)

### 5. ✅ Trang Thanh toán
- Hiển thị chi tiết đơn hàng
- Chọn phương thức thanh toán (QR Code/Chuyển khoản)
- Tạo mã QR từ thông tin đơn hàng
- Tải xuống mã QR
- Xác nhận thanh toán

### 6. ✅ Cập nhật Header
- Hiển thị số lượng sản phẩm trong giỏ
- Hiển thị trạng thái login (tên người dùng nếu đã đăng nhập)
- Link đến Login/Register nếu chưa đăng nhập
- Nút Logout nếu đã đăng nhập

### 7. ✅ Cập nhật ProductDetail
- Nút "Add to cart" hoạt động
- Nút "Buy now" hoạt động
- Chọn số lượng sản phẩm
- Thông báo sau khi thêm vào giỏ

---

## Cài đặt và chạy ứng dụng

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cài đặt thư viện QR Code (nếu chưa có)
```bash
npm install qrcode.react
```

### 3. Chạy ứng dụng
```bash
npm start
```

Ứng dụng sẽ mở ở: `http://localhost:3000/react-ecommerce-template`

---

## Cấu trúc thư mục

```
src/
├── context/                      # Context Providers
│   ├── AuthContext.js            # Quản lý authentication & user
│   └── CartContext.js            # Quản lý giỏ hàng
├── pages/                        # Pages
│   ├── auth/
│   │   ├── Login.js              # Trang đăng nhập
│   │   └── Register.js           # Trang đăng ký
│   ├── cart/
│   │   └── Cart.js               # Trang giỏ hàng
│   └── payment/
│       └── Payment.js            # Trang thanh toán
├── template/                     # Template layout
│   ├── Template.js
│   ├── Header.js                 # (Updated) - Thêm auth & cart info
│   ├── Footer.js
│   └── ...
├── products/                     # Product pages
│   └── detail/
│       └── ProductDetail.js      # (Updated) - Thêm "Add to cart"
└── ...
```

---

## Routes được thêm

| Route | Component | Mô tả |
|-------|-----------|-------|
| `/login` | Login | Trang đăng nhập |
| `/register` | Register | Trang đăng ký |
| `/cart` | Cart | Giỏ hàng |
| `/payment` | Payment | Thanh toán & QR Code |

---

## Các API endpoints cần backend xây dựng

Chi tiết xem file **API_DOCUMENTATION.md**

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/register` | Đăng ký tài khoản |
| POST | `/api/login` | Đăng nhập |
| POST | `/api/cart` | Gửi giỏ hàng |
| POST | `/api/payment` | Tạo mã QR thanh toán |
| POST | `/api/payment/{orderId}/confirm` | Xác nhận thanh toán |

---

## Lưu ý quan trọng

### Authentication Flow
1. User điền email/password
2. Frontend gửi request đến `POST /api/login` hoặc `POST /api/register`
3. Backend xác thực và trả về JWT token
4. Frontend lưu token vào localStorage
5. Token được gửi kèm mỗi request protected qua header `Authorization: Bearer <token>`

### Local Storage
- `token`: JWT token của user
- `user`: Thông tin user (JSON)
- `cart`: Danh sách sản phẩm trong giỏ (JSON)

### Payment QR Code
- Mã QR được tạo từ đối tượng JSON:
  ```json
  {
    "orderId": "ORD-2024-001",
    "amount": 20000,
    "customer": "John Doe"
  }
  ```

---

## Testing

### Test Flow 1: Register & Login
1. Vào `/register` → Điền thông tin → Click "Đăng ký"
2. Sau khi đăng ký thành công, sẽ redirect về home
3. Kiểm tra header: Nên thấy tên người dùng và nút "Logout"

### Test Flow 2: Add to Cart & View Cart
1. Vào `/products/:slug` → Nhập số lượng → Click "Add to cart"
2. Kiểm tra header: Badge giỏ hàng cập nhật số lượng
3. Vào `/cart` → Kiểm tra danh sách sản phẩm
4. Cập nhật số lượng → Tổng tiền tự động cập nhật

### Test Flow 3: Payment & QR
1. Vào `/cart` → Click "Thanh toán"
2. Nếu chưa login: redirect đến `/login`
3. Sau khi login → Quay lại `/payment`
4. Chọn phương thức QR → Click "Tạo mã QR"
5. Kiểm tra mã QR hiển thị đúng
6. Click "Tải mã QR" → Tải xuống PNG
7. Click "Xác nhận thanh toán" → Clear cart & redirect home

---

## Troubleshooting

### 1. Lỗi "Provider is not defined"
- Kiểm tra `App.js` xem đã wrap `<AuthProvider>` và `<CartProvider>` chưa

### 2. Giỏ hàng không load khi reload trang
- Kiểm tra Browser DevTools → Application → localStorage
- Xem `cart` có được lưu không

### 3. QR Code không hiển thị
- Kiểm tra console xem có error nào không
- Kiểm tra `qrcode.react` đã được import đúng không

### 4. Login không hoạt động
- Kiểm tra xem backend API `/api/login` đã được xây dựng chưa
- Kiểm tra response format có đúng không (xem API_DOCUMENTATION.md)

---

## Kế tiếp

Để hoàn thiện ứng dụng, cần:

1. **Backend API**: Xây dựng các endpoint được mô tả trong API_DOCUMENTATION.md
2. **Database**: Tạo các table (users, orders, order_items)
3. **Email**: Tích hợp email confirm cho đăng ký (tuỳ chọn)
4. **Payment Gateway**: Tích hợp với Stripe, PayPal, hoặc gateway khác
5. **Admin Panel**: Quản lý sản phẩm, đơn hàng (tuỳ chọn)
6. **Search & Filter**: Thêm tìm kiếm & filter sản phẩm
7. **Analytics**: Tracking user behavior (tuỳ chọn)
