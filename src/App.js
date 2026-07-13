import { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import Template from "./template/Template";
import ProductDetail from "./products/detail/ProductDetail";
import Landing from "./landing/Landing"; 
import ProductList from "./products/ProductList";
import Cart from "./cart/Cart";
import About from "./about/About"; // <-- BƯỚC 1: THÊM DÒNG IMPORT NÀY

const categorySlugMap = {
  laptop: "Laptop",
  "dien-thoai": "DienThoai",
  "phu-kien": "PhuKien",
  "linh-kien-pc": "LinhKien",
  "man-hinh": "ManHinh",
};

function CategoryProductPage({ category, setCategory, brand, setBrand }) {
  const { categorySlug } = useParams();

  useEffect(() => {
    setCategory(categorySlugMap[categorySlug] || "");
    setBrand("");
  }, [categorySlug, setBrand, setCategory]);

  return (
    <ProductList
      category={category}
      setCategory={setCategory}
      brand={brand}
      setBrand={setBrand}
    />
  );
}

function App() {
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentBrand, setCurrentBrand] = useState("");

  // =========================================================================
  // BỔ SUNG STATE QUẢN LÝ ĐĂNG NHẬP (Giữ nguyên các State cũ của bạn ở trên)
  // =========================================================================
  const [userRole, setUserRole] = useState(null); // null: chưa log, 'admin': Admin, 'user': Khách
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  return (
    <Template setCategory={setCurrentCategory} setBrand={setCurrentBrand}>
      <Routes>
        {/* 1. Trang chủ mặc định */}
        <Route path="/" element={<Landing />} />
        
        {/* 2. Trang tất cả sản phẩm */}
        <Route 
          path="/products" 
          element={
            <ProductList 
              category={currentCategory} 
              setCategory={setCurrentCategory}
              brand={currentBrand}
              setBrand={setCurrentBrand}
            />
          } 
        />

        {/* 3. Trang sản phẩm theo danh mục */}
        <Route
          path="/category/:categorySlug"
          element={
            <CategoryProductPage
              category={currentCategory}
              setCategory={setCurrentCategory}
              brand={currentBrand}
              setBrand={setCurrentBrand}
            />
          }
        />

        {/* 4. Trang chi tiết sản phẩm */}
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* 5. Giỏ hàng */}
        <Route path="/cart" element={<Cart />} />
        
        {/* 6. Trang Giới thiệu đã sửa đổi */}
        <Route path="/about" element={<About />} /> {/* <-- BƯỚC 2: THAY ĐỔI ĐOẠN NÀY */}
        
        {/* Trang Đăng nhập / Tài khoản (ĐÃ ĐƯỢC THÊM LOGIC PHÂN QUYỀN ĐỂ BẠN COPY) */}
        <Route 
          path="/login" 
          element={
            <div className="container mt-5 py-5 text-center" style={{ maxWidth: '800px' }}>
              
              {/* TRƯỜNG HỢP A: CHƯA ĐĂNG NHẬP -> HIỂN THỊ FORM */}
              {!userRole && (
                <div className="card p-4 shadow-sm border-0 mx-auto" style={{ maxWidth: '400px' }}>
                  <h3 className="fw-bold mb-4 text-dark">Đăng Nhập Hệ Thống</h3>
                  <div className="mb-3 text-start">
                    <label className="form-label small fw-bold">Tài khoản Admin / User</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="admin hoặc khachhang" 
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                    />
                  </div>
                  <div className="mb-4 text-start">
                    <label className="form-label small fw-bold">Mật khẩu</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="admin123 hoặc user123" 
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn btn-primary w-100 py-2 fw-bold" 
                    onClick={() => {
                      if (usernameInput === 'admin' && passwordInput === 'admin123') {
                        setUserRole('admin');
                        alert('Đăng nhập thành công với quyền: QUẢN TRỊ VIÊN (ADMIN)');
                      } else if (usernameInput === 'khachhang' && passwordInput === 'user123') {
                        setUserRole('user');
                        alert('Đăng nhập thành công với quyền: KHÁCH HÀNG');
                      } else {
                        alert('Sai tài khoản hoặc mật khẩu! (Gợi ý: admin/admin123 hoặc khachhang/user123)');
                      }
                    }}
                  >
                    Đăng Nhập
                  </button>
                </div>
              )}

              {/* TRƯỜNG HỢP B: ĐĂNG NHẬP VỚI QUYỀN KHÁCH HÀNG (USER) */}
              {userRole === 'user' && (
                <div className="card p-5 shadow-sm border-0 text-center mx-auto" style={{ maxWidth: '600px' }}>
                  <div className="mb-3 text-success" style={{ fontSize: '4rem' }}>✓</div>
                  <h2 className="fw-bold text-dark">Xin chào, Khách hàng!</h2>
                  <p className="text-muted">Bạn đã đăng nhập thành công hệ thống Gearxin Store. Giờ đây bạn có thể thoải mái xem và đặt mua các sản phẩm công nghệ.</p>
                  <div className="mt-4">
                    <button className="btn btn-outline-danger px-4 fw-bold" onClick={() => { setUserRole(null); setUsernameInput(""); setPasswordInput(""); }}>
                      Đăng Xuất
                    </button>
                  </div>
                </div>
              )}

              {/* TRƯỜNG HỢP C: ĐĂNG NHẬP VỚI QUYỀN ADMIN -> DASHBOARD PHÂN CHIA DATABASE */}
              {userRole === 'admin' && (
                <div className="card p-4 shadow-sm border-0 text-start">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                    <h2 className="fw-bold text-danger mb-0">
                      Hệ Thống Quản Trị (Admin Dashboard)
                    </h2>
                    <button className="btn btn-sm btn-dark fw-bold" onClick={() => { setUserRole(null); setUsernameInput(""); setPasswordInput(""); }}>
                      Đăng Xuất Admin
                    </button>
                  </div>

                  <p className="text-muted">Giao diện phân chia module quản lý dữ liệu dựa theo cơ sở dữ liệu <code>mockProductsFromMySQL</code>:</p>
                  
                  <div className="row g-4">
                    {/* Module 1 */}
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 border">
                        <h5 className="fw-bold text-primary">Module 1: Quản lý Sản phẩm (CRUD)</h5>
                        <p className="small text-secondary mb-2">Thành viên đảm nhận: <strong>Người A</strong></p>
                        <div className="btn-group btn-group-sm w-100">
                          <button className="btn btn-success" onClick={() => alert('Chức năng của Người A: Thêm sản phẩm mới')}>+ Thêm SP Mới</button>
                          <button className="btn btn-warning" onClick={() => alert('Chức năng của Người A: Sửa / Xóa sản phẩm')}>Sửa / Xóa SP</button>
                        </div>
                      </div>
                    </div>

                    {/* Module 2 */}
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 border">
                        <h5 className="fw-bold text-primary">Module 2: Quản lý Danh mục & Bộ lọc</h5>
                        <p className="small text-secondary mb-2">Thành viên đảm nhận: <strong>Người B</strong></p>
                        <div className="btn-group btn-group-sm w-100">
                          <button className="btn btn-outline-primary" onClick={() => alert('Chức năng của Người B: Cấu hình Category')}>Cấu hình Danh mục</button>
                          <button className="btn btn-outline-dark" onClick={() => alert('Chức năng của Người B: Cấu hình Brand')}>Cấu hình Hãng</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bảng hiển thị cấu trúc dữ liệu mô phỏng */}
                  <h4 className="fw-bold text-dark mt-5 mb-3">Xem nhanh cơ sở dữ liệu sản phẩm (MySQL Mock)</h4>
                  <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <table className="table table-bordered table-striped align-middle small">
                      <thead className="table-dark position-sticky top-0">
                        <tr>
                          <th>ID</th>
                          <th>Tên Sản Phẩm</th>
                          <th>Giá (VND)</th>
                          <th>Danh mục</th>
                          <th>Thương hiệu</th>
                          <th>Giảm giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>PC Gaming Shark i5 13400F | RTX 4060 | 16GB RAM</td>
                          <td className="text-danger fw-bold">18,500,000 đ</td>
                          <td>PC_Gaming</td>
                          <td>Khac</td>
                          <td>10%</td>
                        </tr>
                        <tr>
                          <td>21</td>
                          <td>Laptop Asus Vivobook 14 X1404ZA Intel Core i5</td>
                          <td className="text-danger fw-bold">14,290,000 đ</td>
                        </tr>
                        <tr>
                          <td>31</td>
                          <td>Laptop MacBook Air M2 8GB / 256GB Chính Hãng</td>
                          <td className="text-danger fw-bold">24,990,000 đ</td>
                          <td>Laptop</td>
                          <td>Apple</td>
                          <td>0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          } 
        />
        
        {/* 7. Bắt lỗi trang 404 */}
        <Route
          path="*"
          element={
            <div className="container mt-5 text-center">
              <h1 className="text-danger">404 - Không tìm thấy trang</h1>
              <p>Vui lòng quay lại trang chủ.</p>
            </div>
          }
        />
      </Routes>
    </Template>
  );
}

export default App;