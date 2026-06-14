import React, { useState, useEffect } from "react";
import Product from "./Product"; // Import component từ TASK-05

// Dữ liệu đồ công nghệ (Giữ nguyên mảng dữ liệu đồng nhất trước đó)
const mockProductsFromMySQL = [
  { id: 1, name: "Bộ Máy Tính PC Gaming Shark i5 13400F | RTX 4060", price: 18500000, category: "PC_Gaming", image_url: "", percent_off: 10 },
  { id: 2, name: "PC Đồ Họa Đua Xe AMD Ryzen 7 5700X | RX 6600", price: 16900000, category: "PC_Gaming", image_url: "", percent_off: 5 },
  { id: 3, name: "PC Văn Phòng Intel Core i3 12100 | 8GB RAM | SSD 256GB", price: 6500000, category: "PC_VanPhong", image_url: "", percent_off: 0 },
  { id: 4, name: "PC Slim Đột Phá i5 11400 | Siêu Nhỏ Gọn", price: 8200000, category: "PC_VanPhong", image_url: "", percent_off: 0 },
  { id: 5, name: "Laptop Asus Vivobook 14 X1404ZA i5", price: 14290000, category: "Laptop", image_url: "", percent_off: 5 },
  { id: 6, name: "Laptop MacBook Air M2 8GB/256GB Chính Hãng", price: 24990000, category: "Laptop", image_url: "", percent_off: 0 },
  { id: 7, name: "CPU Intel Core i5-14600K (Up To 5.3GHz, 14 Nhân 20 Luồng)", price: 8490000, category: "CPU", image_url: "", percent_off: 8 },
  { id: 8, name: "CPU AMD Ryzen 5 7600X (Up To 5.3GHz, 6 Nhân 12 Luồng)", price: 6150000, category: "CPU", image_url: "", percent_off: 12 },
  { id: 9, name: "Mainboard ASUS ROG STRIX B760-F GAMING WIFI", price: 5890000, category: "Mainboard", image_url: "", percent_off: 0 },
  { id: 10, name: "Mainboard MSI MAG B650 TOMAHAWK WIFI", price: 5450000, category: "Mainboard", image_url: "", percent_off: 5 },
  { id: 11, name: "Card Màn Hình ASUS Dual GeForce RTX 4060 EVO 8GB", price: 8990000, category: "VGA", image_url: "", percent_off: 10 },
  { id: 12, name: "Card Màn Hình GIGABYTE GeForce RTX 3060 Vision OC 12G", price: 7850000, category: "VGA", image_url: "", percent_off: 0 },
  { id: 13, name: "RAM Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz", price: 1150000, category: "LinhKien", image_url: "", percent_off: 15 },
  { id: 14, name: "Nguồn Máy Tính Corsair CV750 750W 80 Plus Bronze", price: 1750000, category: "LinhKien", image_url: "", percent_off: 0 },
  { id: 15, name: "Ổ Cứng SSD Samsung 990 PRO 1TB NVMe M.2 PCIe Gen4", price: 2850000, category: "LinhKien", image_url: "", percent_off: 7 },
  { id: 16, name: "Màn Hình Gaming MSI Optix G241V E2 24 inch IPS 75Hz", price: 3290000, category: "ManHinh", image_url: "", percent_off: 12 },
  { id: 17, name: "Màn Hình Đồ Họa ASUS ProArt PA248QV 24 inch IPS FHD", price: 5190000, category: "ManHinh", image_url: "", percent_off: 0 },
  { id: 18, name: "Chuột Không Dây Logitech MX Master 3S Ergonomic", price: 2350000, category: "GamingGear", image_url: "", percent_off: 5 },
  { id: 19, name: "Bàn Phím Cơ ASUS ROG Strix Scope RX Red Switch", price: 3150000, category: "GamingGear", image_url: "", percent_off: 20 },
  { id: 20, name: "Tai Nghe Chụp Tai Sony WH-1000XM5 Chống Ồn Cao Cấp", price: 6990000, category: "GamingGear", image_url: "", percent_off: 15 }
];

const menuCategories = [
  { id: "PC_ChuyenDung", name: "PC Chuyên Dụng" },
  { id: "PC_GiaRe", name: "PC Giá Rẻ" },
  { id: "PC_Gaming", name: "PC Gaming, Học Tập" },
  { id: "PC_VanPhong", name: "PC Văn Phòng" },
  { id: "Laptop", name: "Laptop - Notebook" },
  { id: "CPU", name: "CPU - Bộ Vi Xử Lý" },
  { id: "Mainboard", name: "Mainboard - Bo Mạch Chủ" },
  { id: "VGA", name: "VGA - Card Màn Hình" },
  { id: "LinhKien", name: "Linh Kiện Máy Tính" },
  { id: "ManHinh", name: "Màn Hình Máy Tính" },
  { id: "O_Cung", name: "HDD - SSD - NAS" },
  { id: "TanNhiet", name: "Tản Nhiệt Cooling" },
  { id: "GamingGear", name: "Gaming Gear" }
];

function ProductList() {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  
  // NĂM TRẠNG THÁI QUẢN LÝ PHÂN TRANG (MẤY CÁI CHẤM TRÒN)
  const [currentPage, setCurrentPage] = useState(0); 
  const productsPerPage = 4; // Định mức hiển thị 4 sản phẩm trên một trang giống như giao diện của bạn

  // Xử lý lọc dữ liệu theo Search và Category
  const filterMockData = () => {
    const filtered = mockProductsFromMySQL.filter((item) => {
      const matchCategory = category === "" || item.category === category;
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
    setFilteredProducts(filtered);
    setCurrentPage(0); // Reset về dấu chấm đầu tiên mỗi khi đổi danh mục hoặc tìm kiếm
  };

  useEffect(() => {
    filterMockData();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    filterMockData();
  };

  // Tính toán vị trí cắt mảng sản phẩm để hiển thị theo dấu chấm đang chọn
  const indexOfLastProduct = (currentPage + 1) * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProductsToShow = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Tính số lượng dấu chấm cần render dựa trên tổng số sản phẩm sau khi lọc
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      {/* --- THANH TÌM KIẾM --- */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
            <input
              type="text"
              className="form-control shadow-sm"
              placeholder="🔍 Nhập tên linh kiện, máy tính cần tìm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-dark px-4">Tìm</button>
          </form>
        </div>
      </div>

      {/* --- BỐ CỤC CHÍNH --- */}
      <div className="row">
        {/* === SIDEBAR TRÁI === */}
        <div className="col-md-3 mb-4">
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <div className="list-group list-group-flush">
              <button
                type="button"
                className={`list-group-item list-group-item-action text-start fw-bold py-3 ${category === "" ? "active bg-dark text-white" : ""}`}
                onClick={() => setCategory("")}
              >
                🏠 Tất cả sản phẩm
              </button>
              {menuCategories.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  className={`list-group-item list-group-item-action text-start py-2 d-flex justify-content-between align-items-center ${category === menu.id ? "active bg-dark text-white" : ""}`}
                  onClick={() => setCategory(menu.id)}
                >
                  <span>🔹 {menu.name}</span>
                  <small className="text-muted">➔</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* === LƯỚI SẢN PHẨM BÊN PHẢI === */}
        <div className="col-md-9 d-flex flex-column justify-content-between">
          <div>
            <h3 className="fw-bold mb-4">
              {category === "" ? "Tất cả sản phẩm nổi bật" : `Danh mục: ${menuCategories.find(m => m.id === category)?.name}`}
            </h3>

            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {currentProductsToShow.length > 0 ? (
                currentProductsToShow.map((item) => (
                  <Product key={item.id} data={item} />
                ))
              ) : (
                <div className="col-12 text-center mt-4">
                  <p className="text-muted fs-5">Chưa có sản phẩm nào thuộc mục này.</p>
                </div>
              )}
            </div>
          </div>

          {/* === HỆ THỐNG CÁC CHẤM TRÒN PHÂN TRANG (PAGINATION DOTS) === */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentPage(index)}
                  style={{
                    width: index === currentPage ? "30px" : "10px", // Chấm đang chọn sẽ dài ra giống ảnh mẫu
                    height: "10px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: index === currentPage ? "#0dcaf0" : "#cccccc", // Màu xanh lục khi chọn giống ảnh mẫu
                    transition: "all 0.3s ease",
                    cursor: "pointer"
                  }}
                  title={`Trang ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProductList;