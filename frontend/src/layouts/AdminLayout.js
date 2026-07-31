import React, { useState, useEffect } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import "./Admin.css";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    } else {
      setUser({ user_full_name: "Quản trị viên hệ thống", role_code: "ADMIN" });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("products")) return "Sản phẩm";
    if (path.includes("inventory")) return "Kho & nhập xuất";
    if (path.includes("orders")) return "Đơn hàng & trạng thái";
    if (path.includes("users")) return "Quản lý nhân viên";
    if (path.includes("reports")) return "Báo cáo & Phân tích";
    if (path.includes("logs")) return "Lịch sử hệ thống";
    return "Dashboard";
  };

  if (!user) return null;

  return (
    <div className="admin-container d-flex" style={{ backgroundColor: "#f3f4f8", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* SIDEBAR - TÔNG MÀU NAVY TÍM ĐẬM chuẩn UX/UI */}
      <aside 
        className="admin-sidebar p-3 d-flex flex-column justify-content-between" 
        style={{ 
          width: "250px", 
          minWidth: "250px", 
          backgroundColor: "#111625", 
          color: "#a0aec0" 
        }}
      >
        <div>
          {/* LOGO */}
          <div className="d-flex align-items-center gap-2 mb-4 px-2 pt-2">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold fs-5 shadow-sm" 
              style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #635bff, #a259ff)" }}
            >
              ⚡
            </div>
            <div>
              <h5 className="fw-bold m-0 text-white" style={{ letterSpacing: "0.5px", fontSize: "17px" }}>ElectroAdmin</h5>
              <small className="d-block" style={{ fontSize: "9px", letterSpacing: "1.5px", color: "#64748b" }}>CONTROL CENTER</small>
            </div>
          </div>

          {/* SIDEBAR MENU */}
          <div className="sidebar-menu-wrapper">
            <small className="fw-bold d-block mb-2 px-2 text-uppercase" style={{ fontSize: "10px", color: "#475569", letterSpacing: "1px" }}>
              TỔNG QUAN
            </small>
            <ul className="list-unstyled mb-4">
              <li>
                <Link 
                  to="/admin" 
                  className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium"
                  style={{
                    color: location.pathname === '/admin' ? '#ffffff' : '#94a3b8',
                    backgroundColor: location.pathname === '/admin' ? '#5b50e0' : 'transparent',
                    fontSize: "14px",
                    transition: "all 0.2s"
                  }}
                >
                  📊 Dashboard
                </Link>
              </li>
            </ul>

            <small className="fw-bold d-block mb-2 px-2 text-uppercase" style={{ fontSize: "10px", color: "#475569", letterSpacing: "1px" }}>
              QUẢN LÝ CHÍNH
            </small>
            <ul className="list-unstyled mb-4 d-flex flex-column gap-1">
              <li>
                <Link 
                  to="/admin/products" 
                  className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium"
                  style={{
                    color: location.pathname.includes('products') ? '#ffffff' : '#94a3b8',
                    backgroundColor: location.pathname.includes('products') ? '#5b50e0' : 'transparent',
                    fontSize: "14px"
                  }}
                >
                  📦 Sản phẩm
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/inventory" 
                  className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium"
                  style={{
                    color: location.pathname.includes('inventory') ? '#ffffff' : '#94a3b8',
                    backgroundColor: location.pathname.includes('inventory') ? '#5b50e0' : 'transparent',
                    fontSize: "14px"
                  }}
                >
                  🏢 Kho & nhập xuất
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/orders" 
                  className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium"
                  style={{
                    color: location.pathname.includes('orders') ? '#ffffff' : '#94a3b8',
                    backgroundColor: location.pathname.includes('orders') ? '#5b50e0' : 'transparent',
                    fontSize: "14px"
                  }}
                >
                  🛒 Đơn hàng & trạng thái
                </Link>
              </li>
              {user.role_code === 'ADMIN' && (
                <li>
                  <Link 
                    to="/admin/users" 
                    className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium"
                    style={{
                      color: location.pathname.includes('users') ? '#ffffff' : '#94a3b8',
                      backgroundColor: location.pathname.includes('users') ? '#5b50e0' : 'transparent',
                      fontSize: "14px"
                    }}
                  >
                    👥 Nhân viên
                  </Link>
                </li>
              )}
            </ul>

            {/* NHÓM MENU THEO DÕI - Đ̃ KẾT NỐI CHÍNH THỨC TOÀN BỘ ROUTE */}
            <small className="fw-bold d-block mb-2 px-2 text-uppercase" style={{ fontSize: "10px", color: "#475569", letterSpacing: "1px" }}>
              THEO DÕI
            </small>
            <ul className="list-unstyled d-flex flex-column gap-1">
              <li>
                <Link 
                  to="/admin/reports" 
                  className="nav-link px-3 py-2 rounded-3 fw-medium d-flex align-items-center gap-2" 
                  style={{
                    color: location.pathname.includes('reports') ? '#ffffff' : '#94a3b8',
                    backgroundColor: location.pathname.includes('reports') ? '#5b50e0' : 'transparent',
                    fontSize: "14px",
                    textDecoration: "none"
                  }}
                >
                  📊 Báo cáo
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/logs" 
                  className="nav-link px-3 py-2 rounded-3 fw-medium d-flex align-items-center gap-2" 
                  style={{
                    color: location.pathname.includes('logs') ? '#ffffff' : '#94a3b8',
                    backgroundColor: location.pathname.includes('logs') ? '#5b50e0' : 'transparent',
                    fontSize: "14px",
                    textDecoration: "none"
                  }}
                >
                  ⏱️ Lịch sử hệ thống
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* TRẠNG THÁI HỆ THỐNG & ĐĂNG XUẤT */}
        <div>
          <div 
            className="p-2 mb-3 rounded-3 d-flex align-items-center gap-2 border" 
            style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.05)" }}
          >
            <span className="rounded-circle bg-success d-inline-block" style={{ width: "8px", height: "8px", boxShadow: "0 0 8px #22c55e" }}></span>
            <div>
              <small className="d-block text-white fw-semibold" style={{ fontSize: "11px" }}>Hệ thống ổn định</small>
              <small style={{ fontSize: "10px", color: "#64748b" }}>Dữ liệu trực tiếp</small>
            </div>
          </div>
          
          <button 
            className="btn btn-sm w-100 rounded-3 text-start px-3 py-2 border-0 fw-semibold" 
            onClick={handleLogout}
            style={{ color: "#f87171", backgroundColor: "rgba(239, 68, 68, 0.1)" }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* TOPBAR GIỐNG MẪU */}
        <header className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm">
          <div>
            <small className="text-uppercase fw-bold d-block" style={{ fontSize: "10px", color: "#94a3b8", letterSpacing: "0.5px" }}>ELECTROSHOP ADMIN</small>
            <h4 className="fw-bold m-0 text-dark" style={{ fontSize: "22px" }}>{getPageTitle()}</h4>
          </div>

          <div className="d-flex align-items-center gap-3">
            <a href="/" className="btn btn-dark btn-sm rounded-pill px-3 py-1 fw-medium" style={{ fontSize: "12px", backgroundColor: "#0f172a" }}>
              ← Trở lại trang web
            </a>

            <div className="d-flex align-items-center gap-2">
              <div 
                className="text-white fw-bold rounded-3 d-flex align-items-center justify-content-center shadow-sm" 
                style={{ width: "36px", height: "36px", backgroundColor: "#e07a5f" }}
              >
                QT
              </div>
              <div className="text-start">
                <span className="d-block fw-bold text-dark" style={{ fontSize: "12px", lineHeight: "1.2" }}>{user.user_full_name}</span>
                <small className="fw-bold d-block" style={{ fontSize: "10px", color: "#94a3b8" }}>{user.role_code}</small>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;