import React, { useState, useEffect } from "react";
import axios from "axios";
import Product from "./Product"; // Import component động từ TASK-05

function ProductList() {
  // Quản lý trạng thái dữ liệu sản phẩm lấy từ MySQL
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Hàm gọi API lấy danh sách sản phẩm (Hỗ trợ cả lọc theo Category và Tìm kiếm qua API)
  const fetchProducts = () => {
    setLoading(true);
    
    // Nếu người dùng có nhập từ khóa tìm kiếm, ta gọi API /search
    if (searchTerm.trim() !== "") {
      axios
        .get(`http://localhost:5000/search`, {
          params: { q: searchTerm, category: category || undefined }
        })
        .then((response) => {
          setProducts(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Lỗi khi tìm kiếm sản phẩm:", err);
          setLoading(false);
        });
    } else {
      // Nếu không tìm kiếm, gọi API lấy toàn bộ hoặc lọc theo danh mục
      axios
        .get(`http://localhost:3000/products`, {
          params: { category: category || undefined }
        })
        .then((response) => {
          setProducts(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Lỗi khi lấy danh sách sản phẩm:", err);
          setLoading(false);
        });
    }
  };

  // Tự động gọi lại API mỗi khi thay đổi danh mục (Filter) hoặc khi nhấn Tìm kiếm
  useEffect(() => {
    // Kỹ thuật debounce nhẹ hoặc gọi trực tiếp khi thay đổi category
    fetchProducts();
  }, [category]);

  // Xử lý khi người dùng nhấn Enter hoặc submit thanh tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center fw-bold mb-4">Khám Phá Sản Phẩm</h2>

      {/* --- THANH TÌM KIẾM & LỌC --- */}
      <form onSubmit={handleSearchSubmit} className="row justify-content-center mb-5">
        <div className="col-md-8 d-flex gap-2">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="🔍 Nhập tên sản phẩm cần tìm và nhấn Enter..."
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
          <button type="submit" className="btn btn-dark px-4">Tìm</button>
        </div>
      </form>

      {/* --- LƯỚI SẢN PHẨM DỰA TRÊN DỮ LIỆU MYSQL --- */}
      {loading ? (
        <div className="text-center mt-4">
          <p className="text-muted fs-5">Đang kết nối cơ sở dữ liệu MySQL...</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {products.length > 0 ? (
            products.map((item) => (
              // Truyền object data sang cho Component Product xử lý hiển thị động
              <Product key={item.id} data={item} />
            ))
          ) : (
            <div className="col-12 text-center mt-4">
              <p className="text-muted fs-5">Không tìm thấy sản phẩm nào phù hợp từ hệ thống.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductList;