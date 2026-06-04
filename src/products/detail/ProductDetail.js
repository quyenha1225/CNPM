import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const mockProducts = [
  { id: 1, name: "Điện thoại iPhone 15 Pro Max", price: "29.000.000", category: "DienThoai", description: "Màn hình 6.7 inch, chip A17 Pro siêu mạnh mẽ, camera 48MP sắc nét.", image: "https://via.placeholder.com/600x600", slug: "iphone-15-pro-max" },
  { id: 2, name: "Laptop MacBook Air M2", price: "25.000.000", category: "Laptop", description: "Chip M2 mượt mà, thiết kế siêu mỏng nhẹ, pin dùng cả ngày.", image: "https://via.placeholder.com/600x600", slug: "macbook-air-m2" },
  { id: 3, name: "Điện thoại Samsung Galaxy S24", price: "22.000.000", category: "DienThoai", description: "Tích hợp AI thông minh, viền siêu mỏng, thiết kế sang trọng.", image: "https://via.placeholder.com/600x600", slug: "samsung-galaxy-s24" },
  { id: 4, name: "Laptop Asus Vivobook 14", price: "15.000.000", category: "Laptop", description: "Màn hình OLED rực rỡ, cấu hình phục vụ cực tốt cho học tập và làm việc.", image: "https://via.placeholder.com/600x600", slug: "asus-vivobook-14" }
];

function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const foundProduct = mockProducts.find(item => item.slug === slug);
    setProduct(foundProduct);
  }, [slug]);

  if (!product) {
    return (
      <div className="container mt-5 text-center">
        <h2 className="text-danger mb-4">Sản phẩm không tồn tại!</h2>
        <Link to="/products" className="btn btn-outline-dark px-4 py-2">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <Link to="/products" className="text-decoration-none text-dark mb-4 d-inline-block fw-bold">
        ← Quay lại danh sách
      </Link>
      
      <div className="row bg-white shadow-sm rounded p-4">
        {/* Cột Trái: Ảnh sản phẩm */}
        <div className="col-md-5 text-center mb-4 mb-md-0">
          <img 
            src={product.image} 
            alt={product.name} 
            className="img-fluid rounded border p-2"
          />
        </div>

        {/* Cột Phải: Thông tin chi tiết */}
        <div className="col-md-7 d-flex flex-column justify-content-center px-lg-5">
          <h2 className="fw-bold mb-3">{product.name}</h2>
          <p className="fs-4 text-danger fw-bold mb-3">{product.price} ₫</p>
          
          <div className="mb-4">
            <span className="badge bg-secondary me-2">Danh mục: {product.category}</span>
            <span className="badge bg-success">Còn hàng</span>
          </div>
          
          <p className="text-muted lh-lg mb-4 border-top pt-3">
            <strong>Đặc điểm nổi bật:</strong> {product.description}
          </p>
          
          <div className="d-flex gap-3 mt-auto">
            <button className="btn btn-dark btn-lg flex-grow-1 py-3 rounded-1">
              Thêm vào giỏ hàng
            </button>
            <button className="btn btn-outline-danger btn-lg flex-grow-1 py-3 rounded-1">
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;