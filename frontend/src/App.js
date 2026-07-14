import { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import Template from "./template/Template";
import ProductDetail from "./products/detail/ProductDetail";
import Landing from "./landing/Landing"; 
import ProductList from "./products/ProductList";
import Cart from "./cart/Cart";
import About from "./about/About";

// Map chuẩn khớp 100% với category_slug trong Database MySQL của quyen/admin
const categorySlugMap = {
  laptop: "laptop",
  "dien-thoai": "dien-thoai",
  "phu-kien": "phu-kien",
  "linh-kien-pc": "linh-kien-pc",
  "man-hinh": "man-hinh",
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

  // Logic quản lý Role & Trạng thái Đăng nhập tập trung để thực hiện chuyển đổi vai trò (role)
  const [userRole, setUserRole] = useState(null); // null (chưa đăng nhập), 'admin', 'user'
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  return (
    <Template setCategory={setCurrentCategory} setBrand={setCurrentBrand}>
      <Routes>
        {/* 1. Trang chủ mặc định */}
        <Route path="/" element={<Landing />} />
        
        {/* 2. Trang danh sách sản phẩm công nghệ */}
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

        {/* 3. Trang sản phẩm lọc theo danh mục */}
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
        
        {/* 5. Trang Giỏ hàng */}
        <Route path="/cart" element={<Cart />} />
        
        {/* 6. Trang Giới thiệu (Về chúng tôi) */}
        <Route path="/about" element={<About />} />
        
        {/* 7. Trang Đăng nhập & Bảng quản trị chuyển đổi Role chuẩn KeroUI */}
        <Route 
          path="/login" 
          element={
            <div className="container-fluid p-0" style={{ minHeight: '80vh', backgroundColor: '#f4f6f9' }}>
              
              {/* TRƯỜNG HỢP A: CHƯA ĐĂNG NHẬP -> HIỂN THỊ FORM ĐĂNG NHẬP SẠCH SẼ */}
              {!userRole && (
                <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '75vh' }}>
                  <div className="card shadow-lg p-4 border-0" style={{ width: '100%', maxWidth: '380px', borderRadius: '12px' }}>
                    <div className="text-center mb-4">
                      <h4 className="fw-bold text-dark m-0" style={{ letterSpacing: '0.5px' }}>ĐĂNG NHẬP</h4>
                      <p className="text-muted small mb-0">Hệ thống quản lý Gearxin Store</p>
                    </div>
                    <div className="mb-3 text-start">
                      <label className="form-label small fw-bold text-secondary">Tài khoản</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="admin hoặc khachhang" 
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        style={{ borderRadius: '6px' }}
                      />
                    </div>
                    <div className="mb-4 text-start">
                      <label className="form-label small fw-bold text-secondary">Mật khẩu</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        placeholder="admin123 hoặc user123" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        style={{ borderRadius: '6px' }}
                      />
                    </div>
                    <button 
                      className="btn btn-primary w-100 py-2 fw-bold text-uppercase" 
                      style={{ borderRadius: '6px', background: '#e74c3c', border: 'none' }}
                      onClick={() => {
                        if (usernameInput === 'admin' && passwordInput === 'admin123') {
                          setUserRole('admin');
                        } else if (usernameInput === 'khachhang' && passwordInput === 'user123') {
                          setUserRole('user');
                        } else {
                          alert('Sai tài khoản hoặc mật khẩu! (admin/admin123 hoặc khachhang/user123)');
                        }
                      }}
                    >
                      Đăng Nhập
                    </button>
                  </div>
                </div>
              )}

              {/* TRƯỜNG HỢP B: ĐÃ ĐĂNG NHẬP -> HIỂN THỊ TRANG QUẢN TRỊ ANLYTICS DASHBOARD CHUYÊN NGHIỆP */}
              {userRole && (
                <div className="d-flex" style={{ minHeight: '80vh' }}>
                  
                  {/* THANH MENU DỌC BÊN TRÁI (SIDEBAR) */}
                  <aside className="bg-white border-end d-flex flex-column justify-content-between" style={{ width: '240px', padding: '20px 0' }}>
                    <div>
                      <div className="px-4 mb-4">
                        <h4 className="fw-bold text-danger m-0">KeroUI <span className="text-muted fs-6 fw-normal">v1.0</span></h4>
                      </div>
                      
                      <div className="px-3 mb-2 small text-uppercase text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Menu</div>
                      
                      <ul className="list-unstyled px-2">
                        <li className="mb-1">
                          <button className="btn btn-light w-100 text-start fw-bold text-danger py-2 px-3 border-0" style={{ borderRadius: '8px' }}>
                            <i className="fa-solid fa-chart-pie me-2"></i> Analytics Dashboard
                          </button>
                        </li>
                        <li className="mb-1">
                          <button className="btn btn-link w-100 text-start text-secondary py-2 px-3 text-decoration-none border-0" onClick={() => alert('Chức năng Quản lý Đơn hàng')}>
                            <i className="fa-solid fa-tasks me-2"></i> Management
                          </button>
                        </li>
                        <li className="mb-1">
                          <button className="btn btn-link w-100 text-start text-secondary py-2 px-3 text-decoration-none border-0" onClick={() => alert('Chức năng Quản lý MySQL Database')}>
                            <i className="fa-solid fa-table me-2"></i> Tables & DB Source
                          </button>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="px-3">
                      <button className="btn btn-outline-dark btn-sm w-100 fw-bold" style={{ borderRadius: '6px' }} onClick={() => { setUserRole(null); setUsernameInput(""); setPasswordInput(""); }}>
                        <i className="fa-solid fa-sign-out-alt me-2"></i> Đăng Xuất
                      </button>
                    </div>
                  </aside>

                  {/* VÙNG HIỂN THỊ DASHBOARD THỐNG KÊ (MAIN CONTENT) */}
                  <main className="flex-grow-1 p-4 text-start">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h4 className="fw-bold text-dark m-0">Analytics</h4>
                        <p className="text-muted small m-0">Đây là bản mô phỏng dashboard quản trị sử dụng các phần tử giao diện cao cấp.</p>
                      </div>
                      <div className="small text-muted">
                        Quyền hạn: <span className="badge bg-danger text-uppercase">{userRole === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</span>
                      </div>
                    </div>

                    {/* Hàng chứa 3 Card Thống kê Số liệu */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-4">
                        <div className="card p-3 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                          <span className="small text-muted text-uppercase fw-bold">Doanh số mục tiêu</span>
                          <h2 className="fw-bold my-1 text-dark">1,7M đ</h2>
                          <small className="text-danger fw-bold">↓ 64.1%</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card p-3 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                          <span className="small text-muted text-uppercase fw-bold">Tổng sản phẩm MySQL</span>
                          <h2 className="fw-bold my-1 text-dark">9M items</h2>
                          <small className="text-primary fw-bold">↑ 14.1%</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card p-3 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                          <span className="small text-muted text-uppercase fw-bold">Doanh thu giả lập</span>
                          <h2 className="fw-bold my-1 text-success">$563</h2>
                          <small className="text-warning fw-bold">↑ 1.5%</small>
                        </div>
                      </div>
                    </div>

                    {/* Biểu đồ hoạt họa kỹ thuật & Phân chia nhiệm vụ nhóm */}
                    <div className="row g-4">
                      {/* Cột trái: Đồ thị hoạt họa SVG */}
                      <div className="col-lg-7">
                        <div className="card p-3 border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                          <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-wave-square me-2 text-primary"></i>Technical Support Flow</h6>
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <h3 className="fw-bold text-dark m-0">↑ 78%</h3>
                            <span className="badge bg-success-subtle text-success small">+14</span>
                          </div>
                          <div className="bg-light rounded p-2" style={{ height: '180px' }}>
                            <svg viewBox="0 0 500 150" width="100%" height="100%">
                              <path 
                                d="M0,130 C50,120 100,50 150,90 C200,130 250,140 300,70 C350,10 400,90 450,40 C480,10 500,20 500,20 L500,150 L0,150 Z" 
                                fill="rgba(46, 204, 113, 0.15)"
                              />
                              <path 
                                d="M0,130 C50,120 100,50 150,90 C200,130 250,140 300,70 C350,10 400,90 450,40 C480,10 500,20 500,20" 
                                fill="none" 
                                stroke="#2ecc71" 
                                strokeWidth="3"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Cột phải: Phân chia quản lý database theo yêu cầu bài tập nhóm */}
                      <div className="col-lg-5">
                        <div className="card p-3 border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                          <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-users-cog me-2 text-danger"></i>Phân Chia Chức Năng Admin</h6>
                          
                          <div className="mb-3 p-2 bg-light rounded text-start">
                            <div className="d-flex justify-content-between">
                              <span className="small fw-bold text-primary">Phân hệ 1: CRUD Sản phẩm</span>
                              <span className="badge bg-secondary-subtle text-dark small">Người A</span>
                            </div>
                            <p className="m-0 text-muted" style={{ fontSize: '0.8rem' }}>Đảm nhận các tác vụ: Thêm sản phẩm mới, sửa đổi thông tin chi tiết và xóa sản phẩm khỏi Database MySQL.</p>
                          </div>

                          <div className="p-2 bg-light rounded text-start">
                            <div className="d-flex justify-content-between">
                              <span className="small fw-bold text-primary">Phân hệ 2: Đồng bộ Menu & Bộ lọc</span>
                              <span className="badge bg-secondary-subtle text-dark small">Người B</span>
                            </div>
                            <p className="m-0 text-muted" style={{ fontSize: '0.8rem' }}>Quản lý cây danh mục Category (Laptop, PC, Màn hình...) và danh sách Brand đồng bộ ra Mega Menu bên ngoài.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </main>
                </div>
              )}

            </div>
          } 
        />

        {/* 8. Bắt lỗi trang 404 */}
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