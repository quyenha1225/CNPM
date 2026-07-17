import React, { useState, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Admin.css"; // Đảm bảo file Admin.css nằm cùng thư mục src/layouts

function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login"); // Chưa đăng nhập thì đẩy ra Login
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!user) return null; // Đợi load thông tin user từ localStorage

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>ELECTRO<span>ADMIN</span></h2>
        </div>
        <ul className="sidebar-menu">
          <li className="menu-title">BẢNG ĐIỀU KHIỂN</li>
          <li>
            <Link to="/admin">
              <FontAwesomeIcon icon={["fas", "tachometer-alt"]} /> Tổng quan
            </Link>
          </li>
          <li>
            <Link to="/admin/products">
              <FontAwesomeIcon icon={["fas", "box"]} /> Quản lý Sản phẩm
            </Link>
          </li>
          <li>
            <Link to="/admin/orders">
              <FontAwesomeIcon icon={["fas", "shopping-cart"]} /> Quản lý Đơn hàng
            </Link>
          </li>
          {/* Menu Quản lý người dùng chỉ hiển thị cho quyền ADMIN */}
          {user.role_code === 'ADMIN' && (
            <li>
              <Link to="/admin/users">
                <FontAwesomeIcon icon={["fas", "users"]} /> Quản lý Người dùng
              </Link>
            </li>
          )}
        </ul>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="admin-main">
        {/* TOP NAVBAR */}
        <header className="admin-topbar">
          <button className="toggle-btn" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={["fas", "bars"]} />
          </button>
          
          <div className="topbar-right">
            <div className="admin-profile">
              <div className="avatar">
                {user.user_full_name ? user.user_full_name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="info">
                <span className="name">{user.user_full_name}</span>
                <span className="role">{user.role_code}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={["fas", "sign-out-alt"]} /> Đăng xuất
            </button>
          </div>
        </header>

        {/* CONTENT PLACEHOLDER */}
        <main className="admin-content">
          {/* Khối lời chào đầu trang */}
          <div className="dashboard-welcome" style={{ marginBottom: "20px" }}>
            <h1>Chào mừng quay trở lại, {user.user_full_name}! 👋</h1>
            <p>Hôm nay bạn muốn quản lý gì nào?</p>
          </div>
          
          {/* Khung trắng bọc toàn bộ nội dung của các trang con (h3 từ App.js) */}
          <div className="admin-page-inner" style={{ background: "#fff", padding: "25px", borderRadius: "15px", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;