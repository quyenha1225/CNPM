import React, { useEffect, useState } from 'react';

// Dữ liệu mẫu ban đầu kèm sản phẩm mẫu
const initialMockOrders = [
  {
    order_id: 10023,
    customer_name: 'Khánh Đức',
    phone: '0987654321',
    total_price: 28500000,
    status: 'APPROVED',
    created_at: '2026-07-20',
    items: [
      { id: 1, name: 'iPhone 15 Pro Max 256GB', price: 28500000, quantity: 1, image: 'https://via.placeholder.com/60' }
    ]
  },
  {
    order_id: 10024,
    customer_name: 'Nguyen Van A',
    phone: '0901234567',
    total_price: 15990000,
    status: 'APPROVED',
    created_at: '2026-07-19',
    items: [
      { id: 2, name: 'iPad Air 5 M1 64GB', price: 15990000, quantity: 1, image: 'https://via.placeholder.com/60' }
    ]
  }
];

function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Popup xem chi tiết sản phẩm đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/orders', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Đang dùng lưu trữ LocalStorage cho Đơn hàng');
    }

    const savedOrders = localStorage.getItem('admin_orders_data');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      setOrders(initialMockOrders);
      localStorage.setItem('admin_orders_data', JSON.stringify(initialMockOrders));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const handleStorageChange = () => fetchOrders();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    const updatedOrders = orders.map((ord) =>
      (ord.order_id || ord.id) === orderId ? { ...ord, status: newStatus } : ord
    );

    setOrders(updatedOrders);
    localStorage.setItem('admin_orders_data', JSON.stringify(updatedOrders));

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.log('Chưa kết nối API Backend, đã lưu tạm vào LocalStorage');
    }
  };

  const renderStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Đang chờ duyệt', bg: '#fff3cd', color: '#856404' },
      APPROVED: { label: 'Đã duyệt', bg: '#d4edda', color: '#155724' },
      COMPLETED: { label: 'Hoàn thành', bg: '#cce5ff', color: '#004085' },
      CANCELLED: { label: 'Đã hủy', bg: '#f8d7da', color: '#721c24' },
    };

    const style = statusMap[status] || { label: status, bg: '#e2e3e5', color: '#383d41' };

    return (
      <span style={{ background: style.bg, color: style.color, padding: '4px 8px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
        {style.label}
      </span>
    );
  };

  return (
    <div>
      {/* CSS Animation hiệu ứng Modal */}
      <style>{`
        @keyframes fadeInBackdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpModal { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-backdrop { animation: fadeInBackdrop 0.3s ease forwards; }
        .modal-box { animation: slideUpModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      <h2 style={{ marginBottom: '20px' }}>
        🛒 Quản lý & Duyệt Đơn hàng ({orders.length})
      </h2>

      {loading ? (
        <p>Đang tải danh sách đơn hàng...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <thead>
            <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Mã đơn</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Khách hàng</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Tổng tiền</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Trạng thái</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Ngày đặt</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const id = order.order_id || order.id;
              const total = Number(order.total_amount || order.total_price || 0);
              const customerName = order.user?.full_name || order.customer_name || 'Khách hàng';
              const customerPhone = order.user?.phone || order.phone || 'N/A';
              const createdDate = order.created_at
                ? new Date(order.created_at).toLocaleDateString('vi-VN')
                : 'N/A';

              return (
                <tr key={id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                    #ORD-{id}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <strong>{customerName}</strong>
                    <br />
                    <small style={{ color: '#777' }}>{customerPhone}</small>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee', color: '#27ae60', fontWeight: 'bold' }}>
                    {total.toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {renderStatusBadge(order.status)}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {createdDate}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {/* Nút Xem Chi Tiết Đơn Hàng */}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{ background: '#3498db', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '5px' }}
                    >
                      👁️ Chi tiết
                    </button>

                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(id, 'APPROVED')}
                          style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '5px' }}
                        >
                          Duyệt đơn
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(id, 'CANCELLED')}
                          style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Hủy
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* --- POPUP FRAME XEM CHI TIẾT SẢN PHẨM TRONG ĐƠN HÀNG --- */}
      {selectedOrder && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-box" style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '550px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', pb: '10px', mb: '15px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>
                📦 Chi tiết đơn hàng #ORD-{selectedOrder.order_id || selectedOrder.id}
              </h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>

            <div style={{ marginBottom: '15px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
              <div><strong>Khách hàng:</strong> {selectedOrder.user?.full_name || selectedOrder.customer_name}</div>
              <div><strong>Số điện thoại:</strong> {selectedOrder.user?.phone || selectedOrder.phone}</div>
              <div><strong>Trạng thái:</strong> {renderStatusBadge(selectedOrder.status)}</div>
            </div>

            <h4 style={{ margin: '10px 0', fontSize: '15px', color: '#555' }}>Danh sách sản phẩm:</h4>
            
            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: index < selectedOrder.items.length - 1 ? '1px solid #eee' : 'none' }}>
                    {item.image && (
                      <img src={item.image} alt={item.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', marginRight: '12px' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.name}</div>
                      <small style={{ color: '#666' }}>Đơn giá: {Number(item.price).toLocaleString('vi-VN')} đ</small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: '#eef2f7', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>x{item.quantity}</span>
                      <div style={{ fontWeight: 'bold', color: '#27ae60', marginTop: '4px', fontSize: '13px' }}>
                        {(Number(item.price) * Number(item.quantity)).toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ padding: '15px', textAlign: 'center', color: '#888', margin: 0 }}>
                  Không tìm thấy chi tiết sản phẩm cho đơn hàng mẫu cũ này.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #eee' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Tổng cộng:</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e74c3c' }}>
                {Number(selectedOrder.total_amount || selectedOrder.total_price || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              style={{ width: '100%', background: '#2c3e50', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', marginTop: '15px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default OrderManager;