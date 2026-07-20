import React, { useState, useEffect } from 'react';

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    product_name: '',
    category_id: 1,
    base_price: '',
    product_slug: '',
    image_url: '',
    description: ''
  });

  // Tự động tạo slug khi gõ tên sản phẩm
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'product_name') {
      setFormData({
        ...formData,
        product_name: value,
        product_slug: generateSlug(value)
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Fetch danh sách sản phẩm (kết hợp API + LocalStorage Sync)
  const fetchProducts = async () => {
    setLoading(true);
    let apiProducts = [];

    try {
      const response = await fetch('http://localhost:3001/api/products');
      if (response.ok) {
        const data = await response.json();
        apiProducts = Array.isArray(data) ? data : data.products || data.data || [];
      }
    } catch (error) {
      console.warn("Lỗi gọi API NestJS, sử dụng lưu trữ nội bộ LocalStorage");
    }

    // Đọc danh sách bổ sung từ LocalStorage nếu có
    const localSaved = JSON.parse(localStorage.getItem('global_products') || '[]');

    let combined = [];
    if (apiProducts.length > 0) {
      combined = [...apiProducts, ...localSaved];
    } else if (localSaved.length > 0) {
      combined = [...localSaved];
    }

    // Lọc bỏ sản phẩm trùng lặp ID và sắp xếp tăng dần theo ID
    const uniqueMap = new Map();
    combined.forEach(item => {
      const id = Number(item.product_id || item.id);
      if (id && !uniqueMap.has(id)) {
        uniqueMap.set(id, item);
      }
    });

    const sortedProducts = Array.from(uniqueMap.values()).sort((a, b) => {
      const idA = Number(a.product_id || a.id || 0);
      const idB = Number(b.product_id || b.id || 0);
      return idA - idB;
    });

    setProducts(sortedProducts);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    // Lắng nghe sự kiện đồng bộ toàn hệ thống
    const handleSync = () => fetchProducts();
    window.addEventListener('storage', handleSync);
    window.addEventListener('products_updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('products_updated', handleSync);
    };
  }, []);

  // Hàm Thêm sản phẩm mới (Xếp nối tiếp vào CUỐI danh sách)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tìm ID lớn nhất hiện tại trong danh sách để tự tăng
    const maxId = products.reduce((max, item) => {
      const currentId = Number(item.product_id || item.id || 0);
      return currentId > max ? currentId : max;
    }, 0);
    const newId = maxId > 0 ? maxId + 1 : products.length + 1;

    const newProduct = {
      product_id: newId,
      id: newId,
      product_name: formData.product_name,
      name: formData.product_name,
      category_id: formData.category_id,
      base_price: Number(formData.base_price),
      price: Number(formData.base_price),
      product_slug: formData.product_slug,
      slug: formData.product_slug,
      image_url: formData.image_url || 'https://via.placeholder.com/150',
      image: formData.image_url || 'https://via.placeholder.com/150',
      description: formData.description,
      product_status: 'ACTIVE'
    };

    // 1. Thử gửi POST API tới Backend NestJS
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
    } catch (err) {
      console.log('Chưa kết nối API POST, đồng bộ qua LocalStorage');
    }

    // 2. Đồng bộ LocalStorage (Đưa sản phẩm mới xuống CUỐI mảng)
    const localSaved = JSON.parse(localStorage.getItem('global_products') || '[]');
    const updatedLocal = [...localSaved, newProduct];
    localStorage.setItem('global_products', JSON.stringify(updatedLocal));

    // Cập nhật State & phát tín hiệu đồng bộ
    const updatedState = [...products, newProduct];
    setProducts(updatedState);
    window.dispatchEvent(new Event('products_updated'));

    // Reset Form
    setFormData({
      product_name: '',
      category_id: 1,
      base_price: '',
      product_slug: '',
      image_url: '',
      description: ''
    });
    setShowForm(false);
    alert(`🎉 Thêm sản phẩm thành công với ID #${newId}!`);
  };

  // Hàm Xóa sản phẩm
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    // 1. Gửi API DELETE tới NestJS
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.log('Chưa kết nối API DELETE');
    }

    // 2. Cập nhật LocalStorage
    const localSaved = JSON.parse(localStorage.getItem('global_products') || '[]');
    const filteredLocal = localSaved.filter(p => Number(p.product_id || p.id) !== Number(id));
    localStorage.setItem('global_products', JSON.stringify(filteredLocal));

    // 3. Cập nhật State và Phát tín hiệu đồng bộ
    const filteredState = products.filter(p => Number(p.product_id || p.id) !== Number(id));
    setProducts(filteredState);
    window.dispatchEvent(new Event('products_updated'));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📦 Quản lý Sản phẩm (Tổng: {products.length})</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ background: showForm ? '#e74c3c' : '#27ae60', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {showForm ? "Hủy bỏ" : "+ Thêm sản phẩm mới"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '25px' }}>
          <h4 style={{ marginTop: 0, color: '#2c3e50' }}>Thêm sản phẩm mới vào Hệ thống</h4>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Tên sản phẩm *</label>
              <input type="text" name="product_name" placeholder="Ví dụ: Laptop ASUS ROG Strix" value={formData.product_name} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Danh mục *</label>
              <select name="category_id" value={formData.category_id} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                <option value="1">Laptop</option>
                <option value="2">Điện thoại</option>
                <option value="3">Phụ kiện</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Giá niêm yết (VNĐ) *</label>
              <input type="number" name="base_price" placeholder="Ví dụ: 25000000" value={formData.base_price} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Slug (Tự động tạo)</label>
              <input type="text" name="product_slug" placeholder="vd: laptop-asus-rog" value={formData.product_slug} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', background: '#eef2f7' }} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Link hình ảnh sản phẩm (URL)</label>
              <input type="url" name="image_url" placeholder="https://example.com/hinh-anh.jpg" value={formData.image_url} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Mô tả sản phẩm</label>
              <textarea name="description" rows="3" placeholder="Nhập mô tả chi tiết về cấu hình, tính năng sản phẩm..." value={formData.description} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}></textarea>
            </div>

            <button type="submit" style={{ gridColumn: 'span 2', background: '#2980b9', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
              💾 Lưu sản phẩm & Đồng bộ hệ thống
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ padding: '20px', fontWeight: 'bold' }}>⏳ Đang tải dữ liệu sản phẩm từ hệ thống...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <thead>
            <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>ID</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Hình ảnh</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Tên sản phẩm</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Slug</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Giá niêm yết</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Trạng thái</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((item) => {
                const id = item.product_id || item.id;
                const name = item.product_name || item.name;
                const slug = item.product_slug || item.slug;
                const price = item.base_price || item.price || 0;
                const image = item.image_url || item.image || 'https://via.placeholder.com/50';

                return (
                  <tr key={id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{id}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                      <img src={image} alt={name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                      {name}
                      {item.description && (
                        <div style={{ fontSize: '12px', color: '#777', fontWeight: 'normal', marginTop: '3px' }}>
                          {item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', color: '#666', fontSize: '13px' }}>
                      {slug}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', color: '#e74c3c', fontWeight: 'bold' }}>
                      {Number(price).toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                      <span style={{ background: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        {item.product_status || 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                      <button style={{ marginRight: '8px', background: '#f39c12', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(id)}
                        style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu sản phẩm trong Hệ thống!</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductManager;