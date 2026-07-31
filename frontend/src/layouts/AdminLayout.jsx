import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    // Đăng xuất và điều hướng về trang Login
    navigate('/login'); 
  };

  const currentPath = location.pathname;

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      {/* 1. SIDEBAR NAVIGATION BÊN TRÁI */}
      <aside 
        className="bg-dark text-white p-3 d-flex flex-column justify-content-between" 
        style={{ width: '260px', minWidth: '260px', backgroundColor: '#0f172a' }}
      >
        <div>
          {/* Logo Brand */}
          <div className="mb-4 text-center border-bottom pb-3">
            <h3 className="fw-bold text-primary m-0" style={{ letterSpacing: '1px' }}>
              ELECTRO<span className="text-light">ADMIN</span>
            </h3>
            <small className="text-muted" style={{ fontSize: '10px' }}>CONTROL CENTER</small>
          </div>

          {/* Menu Items */}
          <div className="nav flex-column gap-1">
            <small className="text-uppercase text-secondary fw-bold px-2 mb-1" style={{ fontSize: '11px' }}>
              BẢNG ĐIỀU KHUYỂN
            </small>

            {/* Dashboard */}
            <Link 
              to="/admin" 
              className={`nav-link text-white rounded-3 px-3 py-2 d-flex align-items-center gap-2 ${currentPath === '/admin' ? 'bg-primary' : 'text-opacity-75'}`}
            >
              📊 Tổng quan
            </Link>

            <small className="text-uppercase text-secondary fw-bold px-2 mt-3 mb-1" style={{ fontSize: '11px' }}>
              QUẢN LÝ CHÍNH
            </small>

            {/* Quản lý sản phẩm */}
            <Link 
              to="/admin/products" 
              className={`nav-link text-white rounded-3 px-3 py-2 d-flex align-items-center gap-2 ${currentPath.includes('products') ? 'bg-primary' : 'text-opacity-75'}`}
            >
              📦 Quản lý Sản phẩm
            </Link>

            {/* Kho & Nhập xuất */}
            <Link 
              to="/admin/inventory" 
              className={`nav-link text-white rounded-3 px-3 py-2 d-flex align-items-center gap-2 ${currentPath.includes('inventory') ? 'bg-primary' : 'text-opacity-75'}`}
            >
              🏬 Kho & Nhập xuất
            </Link>

            {/* Quản lý đơn hàng */}
            <Link 
              to="/admin/orders" 
              className={`nav-link text-white rounded-3 px-3 py-2 d-flex align-items-center gap-2 ${currentPath.includes('orders') ? 'bg-primary' : 'text-opacity-75'}`}
            >
              🛒 Quản lý Đơn hàng
            </Link>

            {/* Quản lý người dùng (Chỉ ADMIN) */}
            {user.role_code === 'ADMIN' && (
              <Link 
                to="/admin/users" 
                className={`nav-link text-white rounded-3 px-3 py-2 d-flex align-items-center gap-2 ${currentPath.includes('users') ? 'bg-primary' : 'text-opacity-75'}`}
              >
                👥 Quản lý Người dùng
              </Link>
            )}
          </div>
        </div>

        {/* Footer Sidebar: Trạng thái hệ thống */}
        <div className="border-top pt-3 mt-4">
          <div className="d-flex align-items-center gap-2 mb-3 px-2">
            <span className="spinner-grow spinner-grow-sm text-success" role="status"></span>
            <div>
              <div className="fw-bold" style={{ fontSize: '12px' }}>Hệ thống ổn định</div>
              <small className="text-muted" style={{ fontSize: '10px' }}>Dữ liệu trực tiếp MySQL</small>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. KHU VỰC HEADER VÀ NỘI DUNG CHÍNH (MAIN CONTENT) */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Top Navbar Header */}
        <header className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm">
          <div>
            <span className="text-muted small">TRANG QUẢN TRỊ</span>
            <h5 className="fw-bold mb-0">Hệ Thống Quản Lý Storefront</h5>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Nút quay về trang bán hàng */}
            <Link to="/" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
              🏠 Trở lại trang web
            </Link>

            {/* Thông tin tài khoản & nút Đăng xuất */}
            <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill border">
              <span className="badge bg-primary rounded-circle p-2">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </span>
              <span className="fw-bold small">{user.fullName || 'Admin'}</span>
              <span className="badge bg-secondary text-uppercase" style={{ fontSize: '10px' }}>
                {user.role_code || 'ADMIN'}
              </span>
            </div>

            <button 
              type="button" 
              className="btn btn-danger btn-sm rounded-pill px-3" 
              onClick={handleLogout}
            >
              🚪 Đăng xuất
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}