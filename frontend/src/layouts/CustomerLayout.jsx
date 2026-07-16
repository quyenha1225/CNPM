import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom'; // Import thêm Link

export default function CustomerLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    // Đổi thành '/login' nếu App.js của bạn cấu hình trang đăng nhập là /login
    navigate('/login'); 
  };

  return (
    <div>
      <header>
        <h1>ElectroShop</h1>
        <nav>
          <ul>
            {/* Sử dụng Link thay cho thẻ a */}
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/cart">Giỏ hàng</Link></li>
            <li><Link to="/contact">Liên hệ</Link></li>
          </ul>
        </nav>
        <button type="button" onClick={handleLogout}>Đăng xuất</button>
      </header>
      
      <hr />
      
      <main>
        <Outlet />
      </main>
      
      <hr />
      
      <footer>
        <p>Bản quyền thuộc về hệ thống ElectroShop</p>
      </footer>
    </div>
  );
}