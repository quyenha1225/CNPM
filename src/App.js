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
        
        {/* Trang Đăng nhập / Tài khoản (BẢN THIẾT KẾ VIP ĐẬM CHẤT CÔNG NGHỆ) */}
        <Route 
          path="/login" 
          element={
            <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: '70vh', background: '#0f172a', borderRadius: '16px', margin: '40px 0', padding: '40px 20px' }}>
              
              {/* TRƯỜNG HỢP A: CHƯA ĐĂNG NHẬP -> HIỂN THỊ FORM LOGIN HIỆN ĐẠI */}
              {!userRole && (
                <div className="card p-4 shadow-lg border-0 position-relative text-white" style={{ width: '100%', maxWidth: '420px', background: '#1e293b', borderRadius: '20px', overflow: 'hidden' }}>
                  
                  {/* Các vòng tròn hiệu ứng phát sáng Neon chìm phía sau card */}
                  <div className="position-absolute" style={{ width: '150px', height: '150px', background: 'rgba(59, 130, 246, 0.25)', filter: 'blur(40px)', top: '-30px', left: '-30px', zIndex: 0 }}></div>
                  <div className="position-absolute" style={{ width: '150px', height: '150px', background: 'rgba(168, 85, 247, 0.25)', filter: 'blur(40px)', bottom: '-30px', right: '-30px', zIndex: 0 }}></div>

                  <div className="position-relative" style={{ zIndex: 1 }}>
                    <div className="text-center mb-4">
                      <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '16px', boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      </div>
                      <h3 className="fw-bold m-0" style={{ letterSpacing: '0.5px', background: 'linear-gradient(to right, #3b82f6, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GEARXIN PORTAL</h3>
                      <p className="text-muted small mt-1 mb-0" style={{ fontSize: '0.8rem' }}>Hệ thống định danh & phân quyền thành viên</p>
                    </div>

                    <div className="mb-3 text-start">
                      <label className="form-label small fw-semibold text-uppercase text-white-50" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>Tài khoản hệ thống</label>
                      <input 
                        type="text" 
                        className="form-control border-0 text-white px-3 py-2" 
                        style={{ background: '#334155', borderRadius: '10px', fontSize: '0.9rem' }}
                        placeholder="admin hoặc khachhang" 
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                      />
                    </div>
                    
                    <div className="mb-4 text-start">
                      <label className="form-label small fw-semibold text-uppercase text-white-50" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>Mật khẩu bảo mật</label>
                      <input 
                        type="password" 
                        className="form-control border-0 text-white px-3 py-2" 
                        style={{ background: '#334155', borderRadius: '10px', fontSize: '0.9rem' }}
                        placeholder="admin123 hoặc user123" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                      />
                    </div>
                    
                    <button 
                      className="btn btn-primary w-100 py-2.5 fw-bold text-uppercase border-0" 
                      style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)', fontSize: '0.9rem', letterSpacing: '0.5px' }}
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
                      Kích Hoạt Phiên Làm Việc
                    </button>
                  </div>
                </div>
              )}

              {/* TRƯỜNG HỢP B: ĐĂNG NHẬP VỚI QUYỀN KHÁCH HÀNG (USER) */}
              {userRole === 'user' && (
                <div className="card p-5 border-0 shadow text-center text-white" style={{ width: '100%', maxWidth: '550px', background: '#1e293b', borderRadius: '20px' }}>
                  <div className="d-inline-flex align-items-center justify-content-center mb-3 mx-auto" style={{ width: '70px', height: '70px', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '50%' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <h3 className="fw-bold mb-2">Xin chào, Khách hàng!</h3>
                  <p className="text-secondary small px-3">Hệ thống Gearxin đã định danh thành công vai trò người dùng cá nhân. Bạn đã có toàn quyền truy cập mua sắm, tích hợp giỏ hàng và thanh toán sản phẩm.</p>
                  <div className="mt-4">
                    <button className="btn btn-outline-danger px-4 py-2 fw-bold" style={{ borderRadius: '10px', fontSize: '0.85rem' }} onClick={() => { setUserRole(null); setUsernameInput(""); setPasswordInput(""); }}>
                      Đăng Xuất Hệ Thống
                    </button>
                  </div>
                </div>
              )}

              {/* TRƯỜNG HỢP C: ĐĂNG NHẬP VỚI QUYỀN ADMIN -> DASHBOARD PHÂN CHIA COMPUTER DATABASE CAO CẤP */}
              {userRole === 'admin' && (
                <div className="card p-4 border-0 shadow text-white w-100 text-start" style={{ background: '#1e293b', borderRadius: '20px' }}>
                  <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-4">
                    <h3 className="fw-bold m-0 text-uppercase d-flex align-items-center gap-2" style={{ background: 'linear-gradient(to right, #3b82f6, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.25rem', letterSpacing: '0.5px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
                      Hệ Thống Quản Trị Cơ Sở Dữ Liệu (Admin)
                    </h3>
                    <button className="btn btn-sm btn-danger fw-bold px-3 py-1.5" style={{ borderRadius: '8px', fontSize: '0.8rem' }} onClick={() => { setUserRole(null); setUsernameInput(""); setPasswordInput(""); }}>
                      Đăng Xuất Admin
                    </button>
                  </div>

                  <div className="p-3 mb-4 rounded-3 border border-info border-opacity-25" style={{ background: 'rgba(56, 189, 248, 0.06)', color: '#bae6fd' }}>
                    <p className="m-0 small"><strong>Kiến trúc phân phối:</strong> Dữ liệu từ thực thể nguồn <code>mockProductsFromMySQL</code> đang được cấu trúc hóa để ánh xạ trực tiếp thành hai phân hệ nhiệm vụ riêng biệt bên dưới.</p>
                  </div>
                  
                  <div className="row g-4 mb-4">
                    {/* Phân việc Admin 1 */}
                    <div className="col-md-6">
                      <div className="p-3 border border-secondary rounded-3 h-100 d-flex flex-column justify-content-between" style={{ background: '#0f172a' }}>
                        <div>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 mb-2" style={{ fontSize: '0.7rem', borderRadius: '4px' }}>PHÂN HỆ NGHIỆP VỤ 1</span>
                          <h6 className="fw-bold text-white mb-2">Quản lý Dữ liệu Sản phẩm (CRUD)</h6>
                          <p className="text-muted small mb-3">Thành viên chịu trách nhiệm thiết kế logic: <strong>Người A</strong></p>
                          <p className="text-secondary small mb-3">Thao tác xử lý luồng dữ liệu thô đầu vào bao gồm các thuộc tính cốt lõi của sản phẩm như Khởi tạo ID, Tên sản phẩm, Giá thành cơ bản và Cập nhật trạng thái Sale.</p>
                        </div>
                        <div className="btn-group btn-group-sm w-100 mt-2">
                          <button className="btn btn-success fw-bold" style={{ borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px' }} onClick={() => alert('Chức năng nghiệp vụ Người A: Thêm trường sản phẩm mới vào MySQL')}>+ Thêm Dữ Liệu</button>
                          <button className="btn btn-outline-light fw-bold" style={{ borderTopRightRadius: '6px', borderBottomRightRadius: '6px' }} onClick={() => alert('Chức năng nghiệp vụ Người A: Mở trình điều khiển cập nhật / xóa dữ liệu')}>Hiệu Chỉnh SP</button>
                        </div>
                      </div>
                    </div>

                    {/* Phân việc Admin 2 */}
                    <div className="col-md-6">
                      <div className="p-3 border border-secondary rounded-3 h-100 d-flex flex-column justify-content-between" style={{ background: '#0f172a' }}>
                        <div>
                          <span className="badge bg-purple-subtle text-purple border border-purple-subtle px-2 py-1 mb-2" style={{ fontSize: '0.7rem', borderRadius: '4px', color: '#c084fc', borderColor: '#c084fc' }}>PHÂN HỆ NGHIỆP VỤ 2</span>
                          <h6 className="fw-bold text-white mb-2">Đồng bộ Hệ thống Lọc & Cấu hình Category</h6>
                          <p className="text-muted small mb-3">Thành viên chịu trách nhiệm thiết kế logic: <strong>Người B</strong></p>
                          <p className="text-secondary small mb-3">Thực hiện chuẩn hóa cây dữ liệu đầu ra để phân loại danh mục (Category) và gắn thẻ các hãng thương hiệu công nghệ (Brand Options) đồng bộ ra ngoài Menu chính.</p>
                        </div>
                        <div className="btn-group btn-group-sm w-100 mt-2">
                          <button className="btn btn-outline-info fw-bold" style={{ borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px' }} onClick={() => alert('Chức năng nghiệp vụ Người B: Quản lý thiết lập cây danh mục Category')}>Cấu Hình Loại SP</button>
                          <button className="btn btn-outline-light fw-bold" style={{ borderTopRightRadius: '6px', borderBottomRightRadius: '6px' }} onClick={() => alert('Chức năng nghiệp vụ Người B: Quản lý gán nhãn Brand tương ứng')}>Thiết Lập Hãng</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bảng Dữ Liệu MySQL Mock Đẹp Mắt */}
                  <div className="p-3 border border-secondary rounded-3" style={{ background: '#0f172a' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold m-0 text-white d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                        <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></div>
                        Dữ liệu Sản phẩm mẫu (MySQL Relational Data Stream)
                      </h6>
                      <span className="badge bg-dark text-white-50 border border-secondary px-2 py-1" style={{ fontSize: '0.7rem' }}>Trạng thái: Đọc ghi ổn định</span>
                    </div>
                    
                    <div className="table-responsive" style={{ maxHeight: '220px', overflowY: 'auto', borderRadius: '8px' }}>
                      <table className="table table-dark table-hover table-borderless align-middle small m-0">
                        <thead className="table-active text-info" style={{ position: 'sticky', top: 0, zIndex: 1, background: '#1e293b' }}>
                          <tr>
                            <th className="px-3 py-2">ID</th>
                            <th className="py-2">Tên Thiết Bị / Linh Kiện</th>
                            <th className="py-2">Giá Cơ Bản</th>
                            <th className="py-2">Category</th>
                            <th className="py-2">Brand</th>
                            <th className="py-2 text-center">Giảm giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-bottom border-secondary border-opacity-25">
                            <td className="px-3 py-2.5 fw-bold text-muted">01</td>
                            <td className="fw-semibold text-white-50">PC Gaming Shark i5 13400F | RTX 4060 | 16GB RAM</td>
                            <td className="text-danger fw-bold">18,500,000 đ</td>
                            <td><span className="badge bg-secondary-subtle text-white border border-secondary-subtle px-2 py-0.5" style={{ fontSize: '0.7rem' }}>PC_Gaming</span></td>
                            <td className="text-white-50">Khac</td>
                            <td className="text-center text-danger fw-bold">10%</td>
                          </tr>
                          <tr className="border-bottom border-secondary border-opacity-25">
                            <td className="px-3 py-2.5 fw-bold text-muted">21</td>
                            <td className="fw-semibold text-white-50">Laptop Asus Vivobook 14 X1404ZA Intel Core i5</td>
                            <td className="text-danger fw-bold">14,290,000 đ</td>
                            <td><span className="badge bg-secondary-subtle text-white border border-secondary-subtle px-2 py-0.5" style={{ fontSize: '0.7rem' }}>Laptop</span></td>
                            <td className="text-white-50">Asus</td>
                            <td className="text-center text-danger fw-bold">5%</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2.5 fw-bold text-muted">31</td>
                            <td className="fw-semibold text-white-50">Laptop MacBook Air M2 8GB / 256GB Chính Hãng</td>
                            <td className="text-danger fw-bold">24,990,000 đ</td>
                            <td><span className="badge bg-secondary-subtle text-white border border-secondary-subtle px-2 py-0.5" style={{ fontSize: '0.7rem' }}>Laptop</span></td>
                            <td className="text-white-50">Apple</td>
                            <td className="text-center text-muted">0%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
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