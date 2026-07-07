# API Routes Documentation

## Tổng quan
Tài liệu này mô tả các API endpoints cần thiết cho ứng dụng ecommerce. Backend cần xây dựng các routes dựa trên mô tả dưới đây.

---

## 1. Authentication API

### POST /api/register
**Đăng ký tài khoản mới**

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

### POST /api/login
**Đăng nhập tài khoản**

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 2. Cart API

### POST /api/cart
**Gửi và lưu giỏ hàng**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Nillkin iPhone X cover",
      "price": 10000,
      "quantity": 2,
      "image": "image_url"
    }
  ]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "cartId": "cart_123",
  "totalItems": 2,
  "totalPrice": 20000
}
```

---

## 3. Payment API

### POST /api/payment
**Tạo mã QR thanh toán**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Nillkin iPhone X cover",
      "price": 10000,
      "quantity": 2
    }
  ],
  "totalAmount": 20000,
  "paymentMethod": "qr"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "orderId": "ORD-2024-001",
  "totalAmount": 20000,
  "qrData": {
    "orderId": "ORD-2024-001",
    "amount": 20000,
    "customer": "John Doe"
  },
  "paymentUrl": "https://payment.example.com/qr_image"
}
```

---

### POST /api/payment/{orderId}/confirm
**Xác nhận thanh toán hoàn thành**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "completed",
  "paymentProof": "transaction_id_or_screenshot"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "orderId": "ORD-2024-001",
  "status": "completed"
}
```

---

## Database Schema (tham khảo)

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId VARCHAR(50) UNIQUE NOT NULL,
  userId INT NOT NULL,
  totalAmount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  paymentMethod VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### OrderItems Table
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders(id)
);
```

---

## Ghi chú quan trọng

1. **JWT Token**: Sử dụng JWT để xác thực. Token được gửi trong header `Authorization: Bearer <token>`
2. **Validation**: Validation dữ liệu input ở server side
3. **Error Handling**: Trả về HTTP status code phù hợp (400, 401, 404, 500, etc.)
4. **CORS**: Bật CORS nếu frontend và backend chạy trên domain khác
5. **QR Payment**: Mã QR được tạo từ đối tượng JSON chứa thông tin đơn hàng
