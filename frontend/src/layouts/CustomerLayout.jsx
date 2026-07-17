import React from 'react';
import { Outlet } from 'react-router-dom'; 
import Header from '../template/Header';

export default function CustomerLayout() {
  return (
    <div className="customer-layout-wrapper">
      {/* Gọi Component Header đã được lập trình giao diện */}
      <Header />
      
      <main>
        {/* Nơi render các trang con (Trang chủ, Giỏ hàng, Liên hệ...) */}
        <Outlet /> 
      </main>
      
      <hr />
      
      <footer>
        <p style={{ textAlign: 'center', padding: '20px 0' }}>
          Bản quyền thuộc về hệ thống ElectroShop
        </p>
      </footer>
    </div>
  );
}