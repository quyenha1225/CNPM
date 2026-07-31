import React, { useEffect, useState } from "react";

// 🛠️ HÀM GHI LOG THỰC TẾ DÙNG CHUNG
// Tự động lấy Tên tài khoản đang đăng nhập từ localStorage
export const addSystemLog = (action, details, status = "SUCCESS") => {
  const existingLogs = JSON.parse(localStorage.getItem("system_logs") || "[]");
  
  // Lấy tên Admin/User thực tế đang đăng nhập
  const currentUser = JSON.parse(localStorage.getItem("admin_user") || "{}")?.name || "Admin (Quản trị viên)";

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0];

  const newLog = {
    id: 101 + existingLogs.length,
    time: `${dateStr} ${timeStr}`,
    user: currentUser, // Tên thực tế của người bấm nút
    action: action,
    details: details,
    status: status // "SUCCESS" | "WARNING" | "DANGER"
  };

  const updatedLogs = [newLog, ...existingLogs]; // Đưa log mới nhất lên đầu
  localStorage.setItem("system_logs", JSON.stringify(updatedLogs));
};

function SystemLogsManager() {
  const [filterType, setFilterType] = useState("ALL");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // 1. Chỉ đọc log thực tế từ localStorage
    let storedLogs = JSON.parse(localStorage.getItem("system_logs") || "[]");

    // 2. Nếu là hệ thống mới (chưa có log), chỉ tạo 1 log Khởi tạo duy nhất từ Admin
    if (storedLogs.length === 0) {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().split(" ")[0];

      const initialLogs = [
        { 
          id: 101, 
          time: `${dateStr} ${timeStr}`, 
          user: "Admin (Quản trị viên)", 
          action: "KHỞI_TẠO_HỆ_THỐNG", 
          details: "Hệ thống nhật ký truy vết hoạt động đã bắt đầu ghi nhận dữ liệu thực tế", 
          status: "SUCCESS" 
        }
      ];
      localStorage.setItem("system_logs", JSON.stringify(initialLogs));
      storedLogs = initialLogs;
    }

    setLogs(storedLogs);
  }, []);

  // Hàm xóa sạch lịch sử
  const handleClearLogs = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử thao tác hệ thống?")) {
      localStorage.setItem("system_logs", JSON.stringify([]));
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter(log => filterType === "ALL" || log.status === filterType);

  return (
    <div className="system-logs-container">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold m-0 text-dark">⏱️ Lịch sử Thao tác & Nhật ký Hệ thống</h4>
          <small className="text-muted">Theo dõi và truy vết tất cả các thao tác thay đổi dữ liệu thực tế</small>
        </div>
        <div className="d-flex gap-2">
          <select 
            className="form-select form-select-sm shadow-sm fw-medium" 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: "170px" }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công (SUCCESS)</option>
            <option value="WARNING">Cảnh báo (WARNING)</option>
            <option value="DANGER">Lỗi (DANGER)</option>
          </select>

          <button 
            className="btn btn-sm btn-outline-danger shadow-sm fw-medium"
            onClick={handleClearLogs}
          >
            🗑️ Xóa Lịch Sử
          </button>
        </div>
      </div>

      {/* BẢNG LỊCH SỬ LOGS */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                <th className="py-3 px-3">Mã Log</th>
                <th className="py-3">Thời gian</th>
                <th className="py-3">Người thực hiện</th>
                <th className="py-3">Hành động</th>
                <th className="py-3" style={{ width: "38%" }}>Nội dung chi tiết</th>
                <th className="py-3 text-center px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="fw-bold text-secondary px-3">#{log.id}</td>
                    <td className="text-muted" style={{ fontSize: "13px" }}>{log.time}</td>
                    <td className="fw-semibold text-dark">{log.user}</td>
                    
                    {/* HÀNH ĐỘNG */}
                    <td>
                      <span 
                        className="badge fw-bold px-2 py-1" 
                        style={{ 
                          fontSize: "11px", 
                          backgroundColor: "#f1f1f9", 
                          color: "#4f46e5", 
                          border: "1px solid #dcdfe6" 
                        }}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="text-dark" style={{ fontSize: "13px" }}>{log.details}</td>
                    
                    {/* TRẠNG THÁI */}
                    <td className="text-center px-3">
                      {log.status === 'SUCCESS' && (
                        <span className="badge fw-bold px-3 py-1" style={{ backgroundColor: "#10b981", color: "#ffffff", fontSize: "11px" }}>
                          Thành công
                        </span>
                      )}
                      {log.status === 'WARNING' && (
                        <span className="badge fw-bold px-3 py-1" style={{ backgroundColor: "#f59e0b", color: "#ffffff", fontSize: "11px" }}>
                          Cảnh báo
                        </span>
                      )}
                      {log.status === 'DANGER' && (
                        <span className="badge fw-bold px-3 py-1" style={{ backgroundColor: "#ef4444", color: "#ffffff", fontSize: "11px" }}>
                          Lỗi hệ thống
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Chưa có nhật ký ghi nhận thao tác nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SystemLogsManager;