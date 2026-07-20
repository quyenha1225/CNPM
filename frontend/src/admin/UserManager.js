import React, { useState } from 'react';

function UserManager() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h3>👥 Quản lý & Phân quyền Người dùng</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}
        >
          {showAddForm ? "Hủy bỏ" : "+ Tạo tài khoản Staff"}
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: '#f8f9fa', padding: '20px', marginTop: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h4>Tạo tài khoản Nhân viên (STAFF) mới</h4>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
            <input type="text" placeholder="Họ tên nhân viên" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} required />
            <input type="email" placeholder="Email làm việc" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} required />
            <input type="password" placeholder="Mật khẩu khởi tạo" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} required />
            
            {/* KHÓA CỨNG QUYỀN STAFF - KHÔNG CHO CHỌN */}
            <input type="text" value="Quyền: Nhân viên (STAFF)" disabled style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: '#e9ecef', cursor: 'not-allowed', color: '#555', fontWeight: 'bold' }} />
            
            <button type="submit" style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Xác nhận tạo tài khoản STAFF
            </button>
          </form>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <p><i>*Bảng danh sách người dùng từ Database sẽ được gọi API và hiển thị ở đây*</i></p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#eee', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tên</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Vai trò</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>1</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Admin Root</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>admin@electro.com</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}><span style={{background: '#e74c3c', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '12px'}}>ADMIN</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManager;