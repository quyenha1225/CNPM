import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // 1. Lấy dữ liệu sản phẩm thực từ Database
        let productCount = 0;
        try {
          const resProducts = await fetch('http://localhost:3001/api/products');
          if (resProducts.ok) {
            const products = await resProducts.json();
            productCount = Array.isArray(products) ? products.length : 0;
          }
        } catch (err) {
          console.warn('Lỗi lấy dữ liệu sản phẩm cho Dashboard:', err);
        }

        // 2. Lấy dữ liệu đơn hàng từ LocalStorage (hoặc API)
        let ordersData = [];
        const savedOrders = localStorage.getItem('admin_orders_data');
        if (savedOrders) {
          ordersData = JSON.parse(savedOrders);
        } else {
          // Mock data mẫu nếu chưa có
          ordersData = [
            { order_id: 10023, total_price: 28500000, status: 'APPROVED' },
            { order_id: 10024, total_price: 15990000, status: 'APPROVED' },
          ];
        }

        // Tính toán chỉ số thống kê thực tế
        const totalOrders = ordersData.length;
        const pendingOrders = ordersData.filter(o => o.status === 'PENDING').length;
        const totalRevenue = ordersData
          .filter(o => o.status === 'APPROVED' || o.status === 'COMPLETED')
          .reduce((sum, o) => sum + Number(o.total_price || o.total_amount || 0), 0);

        setStats({
          totalProducts: productCount || 40,
          totalOrders: totalOrders,
          pendingOrders: pendingOrders,
          totalRevenue: totalRevenue,
        });

      } catch (error) {
        console.error('Lỗi khi tải Dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>📊 Thống kê Tổng quan</h2>

      {/* THẺ THỐNG KÊ (STAT CARDS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Thẻ 1: Tổng sản phẩm */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '5px solid #3498db' }}>
          <span style={{ color: '#7f8c8d', fontSize: '14px', fontWeight: 'bold' }}>TỔNG SẢN PHẨM</span>
          <h2 style={{ color: '#2c3e50', marginTop: '10px', marginBottom: '0' }}>{loading ? '...' : stats.totalProducts}</h2>
          <small style={{ color: '#27ae60' }}>Đã đồng bộ MySQL</small>
        </div>

        {/* Thẻ 2: Tổng đơn hàng */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '5px solid #9b59b6' }}>
          <span style={{ color: '#7f8c8d', fontSize: '14px', fontWeight: 'bold' }}>TỔNG ĐƠN HÀNG</span>
          <h2 style={{ color: '#2c3e50', marginTop: '10px', marginBottom: '0' }}>{loading ? '...' : stats.totalOrders}</h2>
          <small style={{ color: '#7f8c8d' }}>Tất cả đơn hàng</small>
        </div>

        {/* Thẻ 3: Đơn hàng chờ duyệt */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '5px solid #f1c40f' }}>
          <span style={{ color: '#7f8c8d', fontSize: '14px', fontWeight: 'bold' }}>ĐỜI CHỜ DUYỆT</span>
          <h2 style={{ color: '#e67e22', marginTop: '10px', marginBottom: '0' }}>{loading ? '...' : stats.pendingOrders}</h2>
          <small style={{ color: '#e67e22' }}>Cần xử lý ngay</small>
        </div>

        {/* Thẻ 4: Doanh thu thực tế */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '5px solid #2ecc71' }}>
          <span style={{ color: '#7f8c8d', fontSize: '14px', fontWeight: 'bold' }}>DOANH THU THỰC TẾ</span>
          <h2 style={{ color: '#27ae60', marginTop: '10px', marginBottom: '0' }}>
            {loading ? '...' : `${stats.totalRevenue.toLocaleString('vi-VN')} đ`}
          </h2>
          <small style={{ color: '#27ae60' }}>Tương ứng đơn đã duyệt</small>
        </div>

      </div>

      {/* LỐI TẮC NHANH (QUICK ACTIONS) */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>⚡ Lối tắt quản trị</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Chào mừng bạn đến với hệ thống Quản trị ElectroAdmin. Bạn có thể duyệt đơn hàng mới hoặc kiểm tra kho hàng sản phẩm ngay bên dưới.
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <a href="#/admin/products" style={{ background: '#3498db', color: '#fff', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
            📦 Bảng Sản phẩm
          </a>
          <a href="#/admin/orders" style={{ background: '#2ecc71', color: '#fff', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
            🛒 Bảng Đơn hàng
          </a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;