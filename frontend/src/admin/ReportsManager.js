import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx"; // Import thư viện xuất Excel

function ReportsManager() {
  const [timeRange, setTimeRange] = useState("thisMonth");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // Dữ liệu đơn hàng mẫu có phân bổ ngày
  const baseOrders = [
    { id: "#ORD-49691", customer: "Quyền Hà", totalAmount: 34990000, status: "Đã duyệt", date: "2026-07-31" },
    { id: "#ORD-89382", customer: "Quyền Hà", totalAmount: 43600000, status: "Đã duyệt", date: "2026-07-28" },
    { id: "#ORD-10023", customer: "Khánh Đức", totalAmount: 28500000, status: "Đã duyệt", date: "2026-07-15" },
    { id: "#ORD-10024", customer: "Nguyen Van A", totalAmount: 15990000, status: "Đã duyệt", date: "2026-07-05" }
  ];

  const baseProducts = [
    { id: 1, name: "Laptop Gaming ASUS ROG Strix", price: 34990000, stock: 18, category: "Laptop" },
    { id: 2, name: "iPhone 16 Pro Max 256GB", price: 34990000, stock: 12, category: "Điện thoại" },
    { id: 3, name: "Dell XPS 14 9440", price: 28500000, stock: 8, category: "Laptop" },
    { id: 4, name: "Sony WH-1000XM5", price: 15990000, stock: 15, category: "Phụ kiện" }
  ];

  useEffect(() => {
    const localOrders = JSON.parse(localStorage.getItem("orders"));
    const localProducts = JSON.parse(localStorage.getItem("products"));

    if (localOrders && localOrders.length >= 4) {
      setOrders(localOrders);
    } else {
      setOrders(baseOrders);
      localStorage.setItem("orders", JSON.stringify(baseOrders));
    }

    if (localProducts && localProducts.length > 0) {
      setProducts(localProducts);
    } else {
      setProducts(baseProducts);
      localStorage.setItem("products", JSON.stringify(baseProducts));
    }
  }, []);

  // HÀM LỌC ĐƠN HÀNG THEO THỜI GIAN
  const getFilteredOrders = () => {
    const today = new Date("2026-07-31T23:59:59");

    return orders.filter((order) => {
      let orderDate;
      if (order.date) {
        if (order.date.includes("/")) {
          const [d, m, y] = order.date.split("/");
          orderDate = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
        } else {
          orderDate = new Date(order.date);
        }
      } else {
        orderDate = today;
      }

      const diffTime = Math.abs(today - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (timeRange) {
        case "today":
          return diffDays <= 1;
        case "7days":
          return diffDays <= 7;
        case "30days":
          return diffDays <= 30;
        case "thisMonth":
          return (
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear()
          );
        default:
          return true;
      }
    });
  };

  const calculateMetrics = () => {
    const filteredOrders = getFilteredOrders();
    const totalRev = filteredOrders.reduce((sum, ord) => {
      let amt = ord.totalAmount || ord.total || 0;
      if (typeof amt === "string") amt = Number(amt.replace(/\D/g, ""));
      return sum + amt;
    }, 0);

    const formatVND = (val) =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

    return {
      totalRevenueNum: totalRev,
      totalRevenue: formatVND(totalRev),
      completedCount: filteredOrders.length,
      avgOrderValue: formatVND(filteredOrders.length > 0 ? totalRev / filteredOrders.length : 0),
      filteredOrdersList: filteredOrders
    };
  };

  const metrics = calculateMetrics();

  // 📊 HÀM XUẤT FILE EXCEL (.XLSX)
  const handleExportExcel = () => {
    const filteredOrders = metrics.filteredOrdersList;

    // 1. Chuẩn bị dữ liệu bảng đơn hàng lọc
    const excelOrdersData = filteredOrders.map((ord, idx) => ({
      "STT": idx + 1,
      "Mã Đơn Hàng": ord.id,
      "Khách Hàng": ord.customer || "Khách lẻ",
      "Ngày Đặt": ord.date || "31/07/2026",
      "Tổng Tiền (VNĐ)": ord.totalAmount || ord.total || 0,
      "Trạng Thái": ord.status || "Đã duyệt"
    }));

    // 2. Tạo Sheet cho Đơn Hàng
    const worksheetOrders = XLSX.utils.json_to_sheet(excelOrdersData);

    // 3. Chuẩn bị dữ liệu Sheet Tổng Quan Số Liệu
    const excelSummaryData = [
      { "Chỉ số": "Mốc Thời Gian", "Giá trị": timeRange },
      { "Chỉ số": "Tổng Doanh Thu", "Giá trị": metrics.totalRevenue },
      { "Chỉ số": "Số Đơn Thành Công", "Giá trị": metrics.completedCount },
      { "Chỉ số": "Giá Trị TB / Đơn (AOV)", "Giá trị": metrics.avgOrderValue },
      { "Chỉ số": "Tổng Số Sản Phẩm Trong Kho", "Giá trị": products.length }
    ];
    const worksheetSummary = XLSX.utils.json_to_sheet(excelSummaryData);

    // 4. Khởi tạo Workbook và thêm các Sheet vào
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheetSummary, "Tổng Quan Báo Cáo");
    XLSX.utils.book_append_sheet(workbook, worksheetOrders, "Danh Sách Đơn Hàng");

    // 5. Xuất file về máy
    const fileName = `Bao_Cao_Kinh_Doanh_${timeRange}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="reports-container">
      {/* HEADER & LỌC THỜI GIAN */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold m-0 text-dark">📊 Báo cáo & Phân tích Kinh doanh</h4>
          <small className="text-muted">Xuất báo cáo chi tiết ra file Excel tiện lợi</small>
        </div>
        <div className="d-flex gap-2">
          <select 
            className="form-select form-select-sm shadow-sm fw-medium" 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="today">Hôm nay</option>
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="thisMonth">Tháng này</option>
          </select>
          <button 
            onClick={handleExportExcel}
            className="btn btn-success btn-sm rounded-2 fw-semibold px-3 d-flex align-items-center gap-1 shadow-sm"
          >
            📊 Xuất Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 bg-white border-start border-primary border-4 h-100">
            <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>TỔNG DOANH THU</small>
            <h4 className="fw-bold my-1 text-primary">{metrics.totalRevenue}</h4>
            <small className="text-success fw-semibold">Tính theo mốc chọn</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 bg-white border-start border-success border-4 h-100">
            <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>ĐƠN HÀNG THÀNH CÔNG</small>
            <h4 className="fw-bold my-1 text-dark">{metrics.completedCount} đơn</h4>
            <small className="text-muted">Tỷ lệ hủy: 0%</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 bg-white border-start border-info border-4 h-100">
            <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>GIÁ TRỊ TB / ĐƠN (AOV)</small>
            <h4 className="fw-bold my-1 text-dark">{metrics.avgOrderValue}</h4>
            <small className="text-info fw-semibold">Trung bình mỗi đơn</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 bg-white border-start border-warning border-4 h-100">
            <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>TỔNG SẢN PHẨM KHO</small>
            <h4 className="fw-bold my-1 text-dark">42 mặt hàng</h4>
            <small className="text-muted">Đồng bộ Quản lý Sản phẩm</small>
          </div>
        </div>
      </div>

      {/* BẢNG SẢN PHẨM / ĐƠN HÀNG */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white py-3 border-0">
          <h6 className="fw-bold m-0 text-dark">🔥 Danh sách sản phẩm kinh doanh tiêu biểu</h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                <th className="py-3 px-3">STT</th>
                <th className="py-3">Tên sản phẩm</th>
                <th className="py-3">Danh mục</th>
                <th className="py-3">Giá bán</th>
                <th className="py-3 text-end px-3">Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod, index) => (
                <tr key={prod.id || index}>
                  <td className="fw-bold text-muted px-3">#{index + 1}</td>
                  <td className="fw-semibold text-dark">{prod.name || prod.product_name}</td>
                  <td><span className="badge bg-light text-dark border px-2 py-1">{prod.category || "Điện tử"}</span></td>
                  <td className="fw-bold text-primary">
                    {typeof prod.price === 'number' 
                      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price) 
                      : prod.price}
                  </td>
                  <td className="fw-bold text-end px-3">{prod.stock || 0} cái</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportsManager;