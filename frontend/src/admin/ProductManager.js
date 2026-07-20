import React, { useState, useEffect } from 'react';

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    product_name: '',
    category_id: 1,
    base_price: '',
    product_slug: ''
  });

  // 1. Gọi API NestJS đang chạy ở cổng 3001
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const data = await response.json();
      // Nếu API trả về mảng trực tiếp hoặc nằm trong object
      setProducts(Array.isArray(data) ? data : data.products || data.data || []);
    } catch (error) {
      console.error("Lỗi gọi API products từ NestJS:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📦 Quản lý Sản phẩm (Tổng: {products.length})</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {showForm ? "Hủy bỏ" : "+ Thêm sản phẩm mới"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '25px' }}>
          <h4 style={{ marginTop: 0 }}>Thêm sản phẩm vào MySQL Database</h4>
          <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input type="text" name="product_name" placeholder="Tên sản phẩm" value={formData.product_name} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} required />
            <select name="category_id" value={formData.category_id} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="1">Laptop</option>
              <option value="2">Điện thoại</option>
              <option value="3">Phụ kiện</option>
            </select>
            <input type="number" name="base_price" placeholder="Giá niêm yết (VNĐ)" value={formData.base_price} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} required />
            <input type="text" name="product_slug" placeholder="Slug (vd: laptop-asus-rog)" value={formData.product_slug} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ gridColumn: 'span 2', background: '#2980b9', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Lưu vào Database
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ padding: '20px', fontWeight: 'bold' }}>⏳ Đang lấy 40 sản phẩm từ MySQL Database...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <thead>
            <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>ID</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Tên sản phẩm</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Slug</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Giá niêm yết</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Trạng thái</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((item) => (
                <tr key={item.product_id || item.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.product_id || item.id}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                    {item.product_name || item.name}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee', color: '#666' }}>
                    {item.product_slug || item.slug}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee', color: '#e74c3c', fontWeight: 'bold' }}>
                    {Number(item.base_price || item.price || 0).toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <span style={{ background: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      {item.product_status || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <button style={{ marginRight: '8px', background: '#f39c12', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Sửa</button>
                    <button style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu sản phẩm trong Database!</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductManager;