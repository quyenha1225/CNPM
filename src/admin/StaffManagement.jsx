import { useEffect, useMemo, useState } from "react";
import "./staff-management.css";

const roles = ["Admin", "Sales Staff", "Technical Staff", "Warehouse Staff"];
const emptyStaff = { full_name: "", email: "", phone: "", role: "Sales Staff", status: "active", avatar: "" };

// Dữ liệu này giúp giao diện có thể xem trước ngay cả khi API chưa được khởi động.
const demoStaffs = [
  { id: "1", full_name: "Nguyễn Minh Anh", email: "minh.anh@techzone.vn", phone: "0901 234 567", role: "Admin", status: "active", avatar: "https://i.pravatar.cc/120?img=47", created_at: "2026-06-28T08:30:00Z" },
  { id: "2", full_name: "Trần Quốc Bảo", email: "quoc.bao@techzone.vn", phone: "0934 567 890", role: "Sales Staff", status: "active", avatar: "https://i.pravatar.cc/120?img=12", created_at: "2026-06-25T09:15:00Z" },
  { id: "3", full_name: "Lê Hoàng Phúc", email: "hoang.phuc@techzone.vn", phone: "0987 654 321", role: "Technical Staff", status: "inactive", avatar: "https://i.pravatar.cc/120?img=13", created_at: "2026-06-22T14:45:00Z" },
  { id: "4", full_name: "Vũ Thu Hà", email: "thu.ha@techzone.vn", phone: "0912 345 678", role: "Warehouse Staff", status: "active", avatar: "https://i.pravatar.cc/120?img=32", created_at: "2026-06-18T03:20:00Z" },
  { id: "5", full_name: "Phạm Gia Huy", email: "gia.huy@techzone.vn", phone: "0968 112 233", role: "Sales Staff", status: "active", avatar: "https://i.pravatar.cc/120?img=68", created_at: "2026-06-15T11:05:00Z" },
  { id: "6", full_name: "Đỗ Khánh Linh", email: "khanh.linh@techzone.vn", phone: "0908 987 654", role: "Technical Staff", status: "inactive", avatar: "https://i.pravatar.cc/120?img=45", created_at: "2026-06-10T06:40:00Z" },
];

const initials = (name = "") => name.split(" ").filter(Boolean).slice(-2).map((word) => word[0]).join("").toUpperCase();
const dateFormat = (date) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));

function StaffModal({ staff, onClose, onSave }) {
  const [form, setForm] = useState(staff || emptyStaff);
  const [errors, setErrors] = useState({});
  const editMode = Boolean(staff);

  const validate = () => {
    const next = {};
    if (!form.full_name.trim()) next.full_name = "Vui lòng nhập họ và tên.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Email chưa đúng định dạng.";
    if (!/^(0|\+84)\d{9,10}$/.test(form.phone.replace(/[.\s-]/g, ""))) next.phone = "Số điện thoại chưa hợp lệ.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();
    if (validate()) onSave({ ...form, full_name: form.full_name.trim(), email: form.email.trim().toLowerCase() });
  };

  return <div className="staff-overlay" role="dialog" aria-modal="true">
    <form className="staff-modal" onSubmit={submit}>
      <div className="modal-heading"><div><p>{editMode ? "Cập nhật thông tin" : "Tạo tài khoản mới"}</p><h2>{editMode ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Đóng">×</button></div>
      <div className="form-grid">
        <label>Họ và tên *<input autoFocus value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Ví dụ: Nguyễn Văn A" />{errors.full_name && <small>{errors.full_name}</small>}</label>
        <label>Email *<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" />{errors.email && <small>{errors.email}</small>}</label>
        <label>Số điện thoại *<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0901 234 567" />{errors.phone && <small>{errors.phone}</small>}</label>
        <label>Chức vụ *<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
        <label className="form-full">URL ảnh đại diện <input value={form.avatar || ""} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." /></label>
      </div>
      <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Hủy</button><button className="button button-primary">{editMode ? "Lưu thay đổi" : "Thêm nhân viên"}</button></div>
    </form>
  </div>;
}

function ConfirmModal({ staff, onClose, onConfirm }) {
  return <div className="staff-overlay" role="dialog" aria-modal="true"><div className="confirm-modal"><div className="warning-icon">!</div><h2>Xóa nhân viên?</h2><p>Bạn có chắc muốn xóa <strong>{staff.full_name}</strong>? Thao tác này không thể hoàn tác.</p><div className="modal-actions"><button className="button button-secondary" onClick={onClose}>Hủy</button><button className="button button-danger" onClick={() => onConfirm(staff.id)}>Xóa nhân viên</button></div></div></div>;
}

export default function StaffManagement() {
  const [staffs, setStaffs] = useState(demoStaffs);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [modalStaff, setModalStaff] = useState(undefined);
  const [deleteStaff, setDeleteStaff] = useState(null);
  const [notice, setNotice] = useState("");
  const pageSize = 5;

  // Khi Express API khả dụng, thay dữ liệu demo bằng dữ liệu thực từ /api/staffs.
  useEffect(() => { (async () => { try { const response = await fetch("/api/staffs?limit=100"); if (response.ok) { const body = await response.json(); if (body.data?.length) setStaffs(body.data); } } catch (_) {} })(); }, []);
  const filtered = useMemo(() => staffs.filter((staff) => {
    const keyword = search.toLowerCase();
    return (!keyword || [staff.full_name, staff.email, staff.phone].some((value) => value.toLowerCase().includes(keyword))) && (role === "all" || staff.role === role) && (status === "all" || staff.status === status);
  }), [staffs, search, role, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [search, role, status]);

  const persist = async (method, url, payload) => { try { const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: payload ? JSON.stringify(payload) : undefined }); return response.ok ? await response.json() : null; } catch (_) { return null; } };
  const saveStaff = async (form) => {
    if (modalStaff?.id) { const result = await persist("PUT", `/api/staffs/${modalStaff.id}`, form); setStaffs((items) => items.map((item) => item.id === modalStaff.id ? (result?.data || { ...item, ...form }) : item)); setNotice("Đã cập nhật nhân viên."); }
    else { const result = await persist("POST", "/api/staffs", form); setStaffs((items) => [{ id: result?.data?.id || String(Date.now()), ...form, created_at: new Date().toISOString() }, ...items]); setNotice("Đã thêm nhân viên mới."); }
    setModalStaff(undefined);
  };
  const toggleStatus = async (staff) => { const next = staff.status === "active" ? "inactive" : "active"; const result = await persist("PATCH", `/api/staffs/${staff.id}/status`, { status: next }); setStaffs((items) => items.map((item) => item.id === staff.id ? (result?.data || { ...item, status: next }) : item)); setNotice(`Tài khoản đã ${next === "active" ? "được kích hoạt" : "bị khóa"}.`); };
  const removeStaff = async (id) => { await persist("DELETE", `/api/staffs/${id}`); setStaffs((items) => items.filter((item) => item.id !== id)); setDeleteStaff(null); setNotice("Đã xóa nhân viên."); };

  return <main className="staff-dashboard">
    <aside className="dashboard-sidebar"><a className="brand" href="/"><span>⌁</span> TechZone</a><p className="nav-label">QUẢN TRỊ HỆ THỐNG</p><a href="/admin/staff" className="sidebar-link active">♙ <span>Nhân viên</span></a><a href="/products" className="sidebar-link">▦ <span>Sản phẩm</span></a><a href="/" className="sidebar-link">◈ <span>Trang cửa hàng</span></a><div className="sidebar-user"><div className="avatar avatar-sm">AD</div><div><b>Administrator</b><small>admin@techzone.vn</small></div></div></aside>
    <section className="staff-content">
      <header className="dashboard-header"><div><p className="eyebrow">QUẢN TRỊ HỆ THỐNG</p><h1>Quản lý nhân viên</h1><span>Quản lý tài khoản và phân quyền cho đội ngũ TechZone.</span></div><button className="button button-primary" onClick={() => setModalStaff(null)}><b>＋</b> Thêm nhân viên</button></header>
      {notice && <div className="notice">✓ {notice}<button onClick={() => setNotice("")}>×</button></div>}
      <div className="staff-card filters"><div className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên, email hoặc số điện thoại..." /></div><select value={role} onChange={(e) => setRole(e.target.value)}><option value="all">Tất cả chức vụ</option>{roles.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Đã khóa</option></select></div>
      <div className="staff-card table-card"><div className="table-title"><div><h2>Danh sách nhân viên</h2><p>{filtered.length} nhân viên phù hợp</p></div><span className="count-pill">{staffs.filter((staff) => staff.status === "active").length} đang hoạt động</span></div><div className="table-scroll"><table><thead><tr><th>NHÂN VIÊN</th><th>LIÊN HỆ</th><th>CHỨC VỤ</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead><tbody>{visible.map((staff) => <tr key={staff.id}><td><div className="person"><div className="avatar">{staff.avatar ? <img src={staff.avatar} alt="" /> : initials(staff.full_name)}</div><b>{staff.full_name}</b></div></td><td><div className="contact"><span>{staff.email}</span><small>{staff.phone}</small></div></td><td><span className={`role-badge ${staff.role.toLowerCase().replaceAll(" ", "-")}`}>{staff.role}</span></td><td><button className={`status-toggle ${staff.status}`} onClick={() => toggleStatus(staff)} aria-label="Đổi trạng thái"><span></span></button><em className={staff.status}>{staff.status === "active" ? "Hoạt động" : "Đã khóa"}</em></td><td>{dateFormat(staff.created_at)}</td><td><div className="row-actions"><button onClick={() => setModalStaff(staff)} title="Chỉnh sửa">✎</button><button onClick={() => setDeleteStaff(staff)} className="delete" title="Xóa">⌫</button></div></td></tr>)}{!visible.length && <tr><td colSpan="6" className="empty">Không tìm thấy nhân viên phù hợp.</td></tr>}</tbody></table></div><footer className="pagination"><span>Hiển thị <b>{visible.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)}</b> trong <b>{filtered.length}</b> nhân viên</span><div><button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>{Array.from({ length: pages }, (_, index) => <button key={index} className={page === index + 1 ? "selected" : ""} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button disabled={page === pages} onClick={() => setPage(page + 1)}>›</button></div></footer></div>
    </section>
    {modalStaff !== undefined && <StaffModal staff={modalStaff} onClose={() => setModalStaff(undefined)} onSave={saveStaff} />}{deleteStaff && <ConfirmModal staff={deleteStaff} onClose={() => setDeleteStaff(null)} onConfirm={removeStaff} />}
  </main>;
}
