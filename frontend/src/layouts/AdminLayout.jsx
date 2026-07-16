import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    // Đảm bảo '/auth' hoặc '/login' khớp với cấu hình trong App.js của bạn
    navigate('/auth'); 
  };

  return (
    <div>
      <header>
        <h2>Trang Quản Trị Hệ Thống</h2>
        {/* Hiển thị tên và quyền hạn */}
        <p>Xin chào: {user.fullName} ({user.role_code})</p>
        <button type="button" onClick={handleLogout}>Đăng xuất</button>
      </header>
      
      <hr />
      
      <aside>
        <h3>Bảng điều khiển</h3>
        <ul>
          {/* Thay thẻ a bằng thẻ Link */}
          <li><Link to="/admin/products">Quản lý Sản phẩm</Link></li>
          <li><Link to="/admin/orders">Quản lý Đơn hàng</Link></li>
          
          {/* Chỉ render chức năng này nếu là ADMIN */}
          {user.role_code === 'ADMIN' && (
            <li><Link to="/admin/users">Quản lý Người dùng</Link></li>
          )}
        </ul>
      </aside>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
}