import React, { useState } from "react";
import { Link } from "react-router-dom";

const mockProducts = [
  { id: 1, name: "Điện thoại iPhone 15 Pro Max", price: "29.000.000", category: "DienThoai", image: "https://via.placeholder.com/300", slug: "iphone-15-pro-max" },
  { id: 2, name: "Laptop MacBook Air M2", price: "25.000.000", category: "Laptop", image: "https://via.placeholder.com/300", slug: "macbook-air-m2" },
  { id: 3, name: "Điện thoại Samsung Galaxy S24", price: "22.000.000", category: "DienThoai", image: "https://via.placeholder.com/300", slug: "samsung-galaxy-s24" },
  { id: 4, name: "Laptop Asus Vivobook 14", price: "15.000.000", category: "Laptop", image: "https://via.placeholder.com/300", slug: "asus-vivobook-14" }
];

function ProductList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");

  const filteredProducts = mockProducts.filter((item) => {
    const matchCategory = category === "" || item.category === category;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center fw-bold mb-4">Khám Phá Sản Phẩm</h2>

      {/* --- THANH TÌM KIẾM & LỌC --- */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-8 d-flex gap-2">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="🔍 Nhập tên sản phẩm cần tìm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select shadow-sm w-25"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="DienThoai">Điện thoại</option>
            <option value="Laptop">Laptop</option>
          </select>
        </div>
      </div>

      {/* --- LƯỚI SẢN PHẨM --- */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <div className="col" key={item.id}>
              <div className="card h-100 shadow-sm border-0 bg-light">
                <img 
                  src={item.image} 
                  className="card-img-top rounded-top" 
                  alt={item.name} 
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fs-6 fw-bold">{item.name}</h5>
                  <p className="card-text text-danger fw-bold fs-5 mb-3">{item.price} ₫</p>
                  
                  <Link to={`/products/${item.slug}`} className="btn btn-dark mt-auto w-100 rounded-pill">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center mt-4">
            <p className="text-muted fs-5">Không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;