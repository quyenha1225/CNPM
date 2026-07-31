import React, { useState, useEffect } from 'react';
import { addSystemLog } from './SystemLogsManager'; // Import hàm ghi log hệ thống

function InventoryManager() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]); // State lưu Lịch sử phiếu kho động
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // State quản lý Modal điều chỉnh tồn kho
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionType, setActionType] = useState('IMPORT'); // 'IMPORT' (Nhập) | 'EXPORT' (Xuất)
  const [inputQty, setInputQty] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Mock Data cho Nhà cung cấp & Thương hiệu (Tab 3 & 4)
  const [suppliers] = useState([
    { id: 'NCC-01', name: 'Công ty TNHH ASUS Việt Nam', phone: '028 3811 1234', email: 'contact@asus.com.vn', address: 'Q.1, TP.HCM' },
    { id: 'NCC-02', name: 'Nhà phân phối Synnex FPT', phone: '024 7300 6666', email: 'sales@synnexfpt.com', address: 'Q. Cầu Giấy, Hà Nội' },
    { id: 'NCC-03', name: 'Apple Vietnam LLC', phone: '1800 1127', email: 'support@apple.com', address: 'Q.1, TP.HCM' }
  ]);

  const [brands] = useState([
    { id: 'TH-01', name: 'ASUS', category: 'Laptop, Linh kiện', status: 'Đang hợp tác' },
    { id: 'TH-02', name: 'Apple', category: 'Smartphone, Tablet, Laptop', status: 'Đang hợp tác' },
    { id: 'TH-03', name: 'Dell', category: 'Laptop, Màn hình', status: 'Đang hợp tác' },
    { id: 'TH-04', name: 'Lenovo', category: 'Laptop, PC ThinkPad', status: 'Đang hợp tác' }
  ]);

  // 1. TẢI DỮ LIỆU ĐỒNG BỘ TỪ LOCALSTORAGE & API
  const fetchInventory = async () => {
    setLoading(true);
    let apiData = [];
    try {
      const res = await fetch("http://localhost:3001/api/products");
      if (res.ok) {
        apiData = await res.json();
      }
    } catch (err) {
      console.warn("Dùng dữ liệu từ LocalStorage fallback");
    }

    const localSaved = JSON.parse(localStorage.getItem('global_products') || '[]');
    const uniqueMap = new Map();

    // Nạp API trước
    apiData.forEach(item => {
      const id = Number(item.product_id || item.id);
      if (id) {
        const stock = item.stock_quantity !== undefined ? item.stock_quantity : (item.stock || 10);
        uniqueMap.set(id, {
          id: id,
          name: item.product_name || item.name || 'Sản phẩm',
          price: item.product_price || item.price || 0,
          stock: stock,
          sold: item.sold_quantity || item.sold || 0,
          brand: item.brand || 'Khác'
        });
      }
    });

    // Nạp LocalStorage sau để GHI ĐÈ (Giữ lại con số tồn kho đã chỉnh sửa)
    localSaved.forEach(item => {
      const id = Number(item.product_id || item.id);
      if (id) {
        const existing = uniqueMap.get(id) || {};
        const updatedStock = item.stock_quantity !== undefined ? item.stock_quantity : (item.stock !== undefined ? item.stock : existing.stock || 10);
        
        uniqueMap.set(id, {
          ...existing,
          ...item,
          id: id,
          name: item.product_name || item.name || existing.name || 'Sản phẩm',
          price: item.product_price || item.price || existing.price || 0,
          stock: updatedStock,
          sold: item.sold_quantity || item.sold || existing.sold || 0,
        });
      }
    });

    const finalData = Array.from(uniqueMap.values()).map(item => {
      let status = 'NORMAL';
      if (item.stock === 0) status = 'OUT_OF_STOCK';
      else if (item.stock <= 5) status = 'LOW_STOCK';
      return { ...item, status };
    });

    localStorage.setItem('global_products', JSON.stringify(finalData));
    setInventory(finalData.sort((a, b) => a.id - b.id));

    // Nạp Lịch sử Nhập/Xuất kho từ localStorage
    const savedHistory = JSON.parse(localStorage.getItem('inventory_history') || '[]');
    setInventoryHistory(savedHistory);

    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenModal = (prod) => {
    setSelectedProduct(prod);
    setActionType('IMPORT');
    setInputQty('');
  };

  // 🛠️ 2. XỬ LÝ LƯU CẬP NHẬT TỒN KHO & TỰ ĐỘNG SINH PHIẾU KHO
  const handleSaveStock = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = parseInt(inputQty, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ (lớn hơn 0)!");
      return;
    }

    const currentStock = selectedProduct.stock;
    let newStock = currentStock;

    if (actionType === 'IMPORT') {
      newStock = currentStock + qty;
    } else {
      if (qty > currentStock) {
        alert(`Số lượng xuất (${qty}) vượt quá tồn kho hiện tại (${currentStock})!`);
        return;
      }
      newStock = currentStock - qty;
    }

    let newStatus = 'NORMAL';
    if (newStock === 0) newStatus = 'OUT_OF_STOCK';
    else if (newStock <= 5) newStatus = 'LOW_STOCK';

    // A. Cập nhật State Kho Hàng
    const updatedInventory = inventory.map(item => {
      if (item.id === selectedProduct.id) {
        return { ...item, stock: newStock, status: newStatus };
      }
      return item;
    });

    setInventory(updatedInventory);
    setSelectedProduct({ ...selectedProduct, stock: newStock, status: newStatus });

    // B. Lưu vĩnh viễn vào LocalStorage sản phẩm
    const localSaved = JSON.parse(localStorage.getItem('global_products') || '[]');
    const existIndex = localSaved.findIndex(p => Number(p.id || p.product_id) === selectedProduct.id);

    if (existIndex !== -1) {
      localSaved[existIndex].stock_quantity = newStock;
      localSaved[existIndex].stock = newStock;
    } else {
      localSaved.push({ ...selectedProduct, stock_quantity: newStock, stock: newStock });
    }
    localStorage.setItem('global_products', JSON.stringify(localSaved));
    window.dispatchEvent(new Event('products_updated'));

    // 🌟 C. THÊM PHIẾU VÀO NHẬT KÝ NHẬP XUẤT KHO (TAB 2)
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timeStr = now.toTimeString().split(' ')[0];
    const fullDateStr = `${day}/${month}/${now.getFullYear()} ${timeStr}`;

    const newTicket = {
      code: actionType === 'IMPORT' ? `NK-${101 + inventoryHistory.length}` : `XK-${101 + inventoryHistory.length}`,
      type: actionType === 'IMPORT' ? 'NHẬP KHO' : 'XUẤT KHO',
      productName: selectedProduct.name,
      qty: actionType === 'IMPORT' ? `+${qty}` : `-${qty}`,
      date: fullDateStr
    };

    const updatedHistory = [newTicket, ...inventoryHistory];
    setInventoryHistory(updatedHistory);
    localStorage.setItem('inventory_history', JSON.stringify(updatedHistory));

    // D. Ghi Log Hệ thống
    const actionLog = actionType === 'IMPORT' ? 'NHẬP_KHO' : 'XUẤT_KHO';
    const detailLog = actionType === 'IMPORT' 
      ? `Nhập thêm +${qty} '${selectedProduct.name}' (Tồn kho: ${currentStock} -> ${newStock})`
      : `Xuất kho -${qty} '${selectedProduct.name}' (Tồn kho: ${currentStock} -> ${newStock})`;

    addSystemLog(actionLog, detailLog, 'SUCCESS');

    // Hiển thị Toast
    const alertText = actionType === 'IMPORT' 
      ? `🎉 Nhập kho thành công +${qty} ${selectedProduct.name}!` 
      : `🚚 Xuất kho thành công -${qty} ${selectedProduct.name}!`;

    setToastMsg(alertText);
    setTimeout(() => setToastMsg(''), 3000);
    setInputQty('');
  };

  // Xuất CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Ten San Pham,Ton Kho,Da Ban,Trang Thai\n";
    inventory.forEach(item => {
      csvContent += `${item.id},"${item.name}",${item.stock},${item.sold},${item.status}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bao_cao_kho_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm)
  );

  return (
    <div className="p-2 position-relative">

      {/* TOAST THÔNG BÁO THÀNH CÔNG */}
      {toastMsg && (
        <div 
          style={{ 
            position: 'fixed', top: '20px', right: '20px', zIndex: 9999, 
            background: '#10b981', color: '#fff', padding: '12px 24px', 
            borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', 
            fontWeight: 'bold', fontSize: '14px' 
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="mb-3">
        <small className="text-uppercase text-muted fw-bold">TRANG QUẢN TRỊ</small>
        <h2 className="fw-bold mb-1">Kho & Nhập xuất</h2>
        <p className="text-muted">Quản lý sản phẩm, tồn kho, đơn hàng và báo cáo tập trung.</p>
      </div>

      {/* Nav Tabs */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <button 
            className={`btn ${activeTab === 'inventory' ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'}`}
            onClick={() => setActiveTab('inventory')}
          >
            📦 Kho hàng
          </button>
          <button 
            className={`btn ${activeTab === 'history' ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'}`}
            onClick={() => setActiveTab('history')}
          >
            🔄 Nhập xuất kho
          </button>
          <button 
            className={`btn ${activeTab === 'suppliers' ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'}`}
            onClick={() => setActiveTab('suppliers')}
          >
            🏭 Nhà cung cấp
          </button>
          <button 
            className={`btn ${activeTab === 'brands' ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'}`}
            onClick={() => setActiveTab('brands')}
          >
            🏷️ Thương hiệu
          </button>
        </div>

        {activeTab === 'inventory' && (
          <button className="btn btn-outline-success rounded-pill px-3" onClick={handleExportCSV}>
            📥 Xuất Báo Cáo CSV
          </button>
        )}
      </div>

      {/* TAB 1: KHO HÀNG */}
      {activeTab === 'inventory' && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="text-uppercase text-muted fw-bold small">QUẢN LÝ KHO HÀNG</span>
              <h4 className="fw-bold m-0">Kho hàng</h4>
              <small className="text-muted">{filteredInventory.length} bản ghi</small>
            </div>

            <div className="position-relative" style={{ width: '280px' }}>
              <input
                type="text"
                className="form-control rounded-pill ps-3 bg-light border-0"
                placeholder="🔍 Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Đang tải dữ liệu kho...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '80px' }}>MÃ</th>
                    <th>SẢN PHẨM</th>
                    <th className="text-center">TỒN HIỆN TẠI</th>
                    <th className="text-center">ĐÃ BÁN</th>
                    <th className="text-center">CẢNH BÁO</th>
                    <th className="text-center">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-bold text-muted">#{item.id}</td>
                      <td className="fw-semibold">{item.name}</td>
                      <td className="text-center fw-bold fs-6 text-dark">{item.stock}</td>
                      <td className="text-center text-muted">{item.sold}</td>
                      <td className="text-center">
                        {item.status === 'OUT_OF_STOCK' && <span className="badge bg-danger">HẾT HÀNG</span>}
                        {item.status === 'LOW_STOCK' && <span className="badge bg-warning text-dark">SẮP HẾT</span>}
                        {item.status === 'NORMAL' && <span className="badge bg-light text-secondary border">NORMAL</span>}
                      </td>
                      <td className="text-center">
                        <button 
                          className="btn btn-sm btn-light border rounded-circle" 
                          title="Xem & Cập nhật kho"
                          onClick={() => handleOpenModal(item)}
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL CẬP NHẬT TỒN KHO LINH HOẠT TỪ BÀN PHÍM */}
      {selectedProduct && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold"> Chi Tiết & Nhập/Xuất Kho</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedProduct(null)}></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <span className="badge bg-secondary mb-1">Mã SP: #{selectedProduct.id}</span>
                  <h4 className="fw-bold text-primary m-0">{selectedProduct.name}</h4>
                  <small className="text-muted">
                    Đơn giá: {Number(selectedProduct.price).toLocaleString('vi-VN')} đ
                  </small>
                </div>

                <div className="row g-2 text-center my-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <small className="text-muted d-block fw-bold" style={{ fontSize: '11px' }}>TỒN KHO HIỆN TẠI</small>
                      <span className="fs-3 fw-bold text-success">{selectedProduct.stock}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <small className="text-muted d-block fw-bold" style={{ fontSize: '11px' }}>ĐÃ BÁN</small>
                      <span className="fs-3 fw-bold text-secondary">{selectedProduct.sold}</span>
                    </div>
                  </div>
                </div>

                {/* FORM NẠP SỐ LƯỢNG TỪ BÀN PHÍM */}
                <form onSubmit={handleSaveStock}>
                  <div className="p-3 border rounded-3 bg-light">
                    <label className="fw-bold mb-2 small text-uppercase text-muted d-block">
                      Thao tác điều chỉnh tồn kho:
                    </label>

                    <div className="d-flex gap-2 mb-3">
                      <button
                        type="button"
                        className={`btn btn-sm flex-fill fw-bold ${actionType === 'IMPORT' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setActionType('IMPORT')}
                      >
                        ➕ Nhập kho (Thêm)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm flex-fill fw-bold ${actionType === 'EXPORT' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => setActionType('EXPORT')}
                      >
                        ➖ Xuất kho (Giảm)
                      </button>
                    </div>

                    <div className="mb-3">
                      <input 
                        type="number"
                        min="1"
                        className="form-control form-control-lg text-center fw-bold bg-white"
                        placeholder="Nhập số lượng từ bàn phím..."
                        value={inputQty}
                        onChange={(e) => setInputQty(e.target.value)}
                        autoFocus
                      />
                    </div>

                    {inputQty && parseInt(inputQty) > 0 && (
                      <div className="text-center text-muted mb-2 small">
                        Tồn kho sau khi thay đổi: {' '}
                        <strong className="text-dark">
                          {actionType === 'IMPORT' 
                            ? (selectedProduct.stock + parseInt(inputQty)) 
                            : Math.max(0, selectedProduct.stock - parseInt(inputQty))}
                        </strong>
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2 shadow-sm">
                      💾 Lưu Cập Nhật Kho
                    </button>
                  </div>
                </form>

              </div>

              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary rounded-pill px-4 w-100" onClick={() => setSelectedProduct(null)}>
                  Đóng
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 🌟 TAB 2: NHẬT KÝ NHẬP / XUẤT KHO THỰC TẾ (TỰ ĐỘNG CẬP NHẬT) */}
      {activeTab === 'history' && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold m-0">Nhật ký Nhập / Xuất Kho</h4>
            {inventoryHistory.length > 0 && (
              <button 
                className="btn btn-sm btn-outline-danger fw-bold"
                onClick={() => {
                  if(window.confirm('Xóa toàn bộ lịch sử phiếu kho?')) {
                    localStorage.removeItem('inventory_history');
                    setInventoryHistory([]);
                  }
                }}
              >
                🗑️ Xóa Lịch Sử Kho
              </button>
            )}
          </div>

          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr className="text-uppercase" style={{ fontSize: '12px' }}>
                  <th>MÃ PHIẾU</th>
                  <th>LOẠI PHIẾU</th>
                  <th>SẢN PHẨM</th>
                  <th className="text-center">SỐ LƯỢNG</th>
                  <th>NGÀY THỰC HIỆN</th>
                </tr>
              </thead>
              <tbody>
                {inventoryHistory.length > 0 ? (
                  inventoryHistory.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-bold text-secondary">#{item.code}</td>
                      <td>
                        <span className={`badge fw-bold px-2 py-1 ${item.type === 'NHẬP KHO' ? 'bg-success' : 'bg-danger'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="fw-semibold text-dark">{item.productName}</td>
                      <td className={`text-center fw-bold fs-6 ${item.type === 'NHẬP KHO' ? 'text-success' : 'text-danger'}`}>
                        {item.qty}
                      </td>
                      <td className="text-muted small">{item.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      Chưa có phiếu nhập/xuất kho nào. Hãy vào Tab "Kho hàng" bấm con mắt 👁️ để thực hiện nhập/xuất kho!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🌟 TAB 3: DANH SÁCH NHÀ CUNG CẤP */}
      {activeTab === 'suppliers' && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="fw-bold m-0">Danh sách Nhà Cung Cấp</h4>
              <small className="text-muted">Quản lý thông tin địa chỉ và liên hệ các nhà cung cấp linh kiện.</small>
            </div>
            <button className="btn btn-sm btn-primary fw-bold" onClick={() => alert('Tính năng thêm nhà cung cấp mới!')}>
              ➕ Thêm Nhà Cung Cấp
            </button>
          </div>

          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr className="text-uppercase" style={{ fontSize: '12px' }}>
                  <th>MÃ NCC</th>
                  <th>TÊN NHÀ CUNG CẤP</th>
                  <th>SỐ ĐIỆN THOẠI</th>
                  <th>EMAIL</th>
                  <th>ĐỊA CHỈ</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup) => (
                  <tr key={sup.id}>
                    <td className="fw-bold text-secondary">{sup.id}</td>
                    <td className="fw-bold text-dark">{sup.name}</td>
                    <td className="text-primary fw-semibold">{sup.phone}</td>
                    <td className="text-muted">{sup.email}</td>
                    <td className="text-dark">{sup.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🌟 TAB 4: THƯƠNG HIỆU */}
      {activeTab === 'brands' && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="fw-bold m-0">Thương Hiệu</h4>
              <small className="text-muted">Danh sách các nhãn hàng đối tác phân phối chính hãng.</small>
            </div>
            <button className="btn btn-sm btn-primary fw-bold" onClick={() => alert('Tính năng thêm thương hiệu mới!')}>
              ➕ Thêm Thương Hiệu
            </button>
          </div>

          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr className="text-uppercase" style={{ fontSize: '12px' }}>
                  <th>MÃ TH</th>
                  <th>TÊN THƯƠNG HIỆU</th>
                  <th>DANH MỤC CUNG CẤP</th>
                  <th className="text-center">TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-bold text-secondary">{b.id}</td>
                    <td className="fw-bold text-dark fs-6">{b.name}</td>
                    <td className="text-muted">{b.category}</td>
                    <td className="text-center">
                      <span className="badge bg-success fw-bold px-3 py-1">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default InventoryManager;