import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  apiFetch,
  buildQuery,
  formatCurrency,
  formatDateTime,
  normalizePagination,
} from "../config/api";

import "./AdminResource.css";

const PAGE_SIZE = 10;

function Notice({ error, notice }) {
  if (!error && !notice) return null;

  return (
    <div
      className={`gx-admin-resource__notice ${error ? "is-error" : ""}`}
      role={error ? "alert" : "status"}
    >
      <FontAwesomeIcon
        icon={["fas", error ? "exclamation-triangle" : "check-circle"]}
      />
      <span>{error || notice}</span>
    </div>
  );
}

function Pagination({ page, pagination, loading, onPage }) {
  return (
    <footer className="gx-admin-resource__pagination">
      <span>
        Trang {page}/{pagination.totalPages} · {pagination.total} bản ghi
      </span>
      <div>
        <button
          type="button"
          className="gx-admin-resource__button"
          disabled={loading || page <= 1}
          onClick={() => onPage(Math.max(page - 1, 1))}
        >
          Trang trước
        </button>
        <button
          type="button"
          className="gx-admin-resource__button"
          disabled={loading || page >= pagination.totalPages}
          onClick={() => onPage(Math.min(page + 1, pagination.totalPages))}
        >
          Trang sau
        </button>
      </div>
    </footer>
  );
}

function ResourceHero({ eyebrow, title, description, children }) {
  return (
    <header className="gx-admin-resource__hero">
      <div className="gx-admin-resource__hero-copy">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="gx-admin-resource__actions">{children}</div>
    </header>
  );
}

function Modal({ title, eyebrow, open, onClose, children, footer, wide }) {
  if (!open) return null;

  return (
    <div
      className="gx-admin-resource__modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`gx-admin-resource__dialog ${wide ? "is-wide" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <header className="gx-admin-resource__dialog-header">
          <div>
            <span className="gx-admin-resource__eyebrow">{eyebrow}</span>
            <h3>{title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <FontAwesomeIcon icon={["fas", "times"]} />
          </button>
        </header>
        <div className="gx-admin-resource__dialog-body">{children}</div>
        {footer && <footer className="gx-admin-resource__dialog-footer">{footer}</footer>}
      </div>
    </div>
  );
}

function statusBadge(status) {
  return `gx-admin-resource__badge is-${String(status || "").toLowerCase()}`;
}

export function AdminStaffPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "ACTIVE",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch(
        `/admin/users${buildQuery({
          page,
          limit: PAGE_SIZE,
          search,
          status,
          role: "STAFF",
        })}`,
      );
      const rows = Array.isArray(response?.items) ? response.items : [];
      setItems(rows);
      setPagination(normalizePagination(response, rows.length));
    } catch (requestError) {
      setItems([]);
      setError(requestError.message || "Không thể tải danh sách nhân viên.");
    } finally {
      setLoading(false);
    }
  }, [page, refreshKey, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  async function createStaff(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await apiFetch("/admin/staff", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
        }),
      });
      showNotice(response?.message || "Đã tạo nhân viên.");
      setModalOpen(false);
      setForm({ name: "", email: "", phone: "", password: "", status: "ACTIVE" });
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message || "Không thể tạo nhân viên.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(item) {
    setError("");
    try {
      const nextStatus = item.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
      const response = await apiFetch(`/admin/users/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      showNotice(response?.message || "Đã cập nhật nhân viên.");
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message || "Không thể cập nhật nhân viên.");
    }
  }

  return (
    <section className="gx-admin-resource">
      <ResourceHero
        eyebrow="STAFF MANAGEMENT"
        title="Quản lý nhân viên"
        description="Chỉ quản trị viên được tạo tài khoản STAFF, khóa hoặc mở khóa quyền truy cập nghiệp vụ."
      >
        <button
          type="button"
          className="gx-admin-resource__button"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Tải lại
        </button>
        <button
          type="button"
          className="gx-admin-resource__button is-primary"
          onClick={() => setModalOpen(true)}
        >
          <FontAwesomeIcon icon={["fas", "user-plus"]} />
          Tạo nhân viên
        </button>
      </ResourceHero>

      <section className="gx-admin-resource__stats">
        <article className="gx-admin-resource__stat">
          <div className="gx-admin-resource__stat-icon">
            <FontAwesomeIcon icon={["fas", "users"]} />
          </div>
          <div><span>Tổng nhân viên</span><strong>{pagination.total}</strong></div>
        </article>
        <article className="gx-admin-resource__stat">
          <div className="gx-admin-resource__stat-icon">
            <FontAwesomeIcon icon={["fas", "user-check"]} />
          </div>
          <div><span>Đang hoạt động trong trang</span><strong>{items.filter((item) => item.status === "ACTIVE").length}</strong></div>
        </article>
        <article className="gx-admin-resource__stat">
          <div className="gx-admin-resource__stat-icon">
            <FontAwesomeIcon icon={["fas", "user-lock"]} />
          </div>
          <div><span>Đã khóa trong trang</span><strong>{items.filter((item) => item.status !== "ACTIVE").length}</strong></div>
        </article>
        <article className="gx-admin-resource__stat">
          <div className="gx-admin-resource__stat-icon">
            <FontAwesomeIcon icon={["fas", "file-alt"]} />
          </div>
          <div><span>Trang hiện tại</span><strong>{page}/{pagination.totalPages}</strong></div>
        </article>
      </section>

      <form
        className="gx-admin-resource__filters is-two"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
      >
        <label>
          <span>Tìm kiếm</span>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tên, email hoặc số điện thoại..."
          />
        </label>
        <label>
          <span>Trạng thái</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="LOCKED">LOCKED</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>
        <div className="gx-admin-resource__filter-actions">
          <button type="submit" className="gx-admin-resource__button is-primary">Tìm kiếm</button>
          <button
            type="button"
            className="gx-admin-resource__button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setStatus("");
              setPage(1);
            }}
          >
            Xóa lọc
          </button>
        </div>
      </form>

      <Notice error={error} notice={notice} />

      <section className="gx-admin-resource__card">
        <div className="gx-admin-resource__card-header">
          <div><strong>Danh sách nhân viên</strong><span>{pagination.total} tài khoản STAFF</span></div>
        </div>
        <div className="gx-admin-resource__table-wrap">
          <table>
            <thead><tr><th>Nhân viên</th><th>Liên hệ</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="gx-admin-resource__empty">Đang tải nhân viên...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="gx-admin-resource__empty">Không tìm thấy nhân viên.</td></tr>
              ) : items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong><div className="gx-admin-resource__muted">ID #{item.id}</div></td>
                  <td><strong>{item.email}</strong><div className="gx-admin-resource__muted">{item.phone || "Chưa có SĐT"}</div></td>
                  <td><span className={statusBadge(item.status)}>{item.status}</span></td>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td><button type="button" className={`gx-admin-resource__button ${item.status === "ACTIVE" ? "is-danger" : "is-success"}`} onClick={() => toggleStatus(item)}>{item.status === "ACTIVE" ? "Khóa" : "Mở khóa"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pagination={pagination} loading={loading} onPage={setPage} />
      </section>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        eyebrow="CREATE STAFF"
        title="Tạo tài khoản nhân viên"
        footer={(
          <>
            <button type="button" className="gx-admin-resource__button" onClick={() => setModalOpen(false)} disabled={saving}>Hủy</button>
            <button type="submit" form="gx-create-staff-form" className="gx-admin-resource__button is-primary" disabled={saving}>{saving ? "Đang tạo..." : "Tạo nhân viên"}</button>
          </>
        )}
      >
        <form id="gx-create-staff-form" onSubmit={createStaff}>
          <div className="gx-admin-resource__form-grid">
            <label className="gx-admin-resource__field is-full"><span>Họ và tên *</span><input value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} minLength="2" required /></label>
            <label className="gx-admin-resource__field"><span>Email *</span><input type="email" value={form.email} onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))} required /></label>
            <label className="gx-admin-resource__field"><span>Số điện thoại *</span><input value={form.phone} onChange={(event) => setForm((previous) => ({ ...previous, phone: event.target.value }))} placeholder="09xxxxxxxx" required /></label>
            <label className="gx-admin-resource__field"><span>Mật khẩu *</span><input type="password" value={form.password} onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))} minLength="8" required /></label>
            <label className="gx-admin-resource__field"><span>Trạng thái</span><select value={form.status} onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value }))}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></label>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export function AdminOrdersPage() {
  const [items, setItems] = useState([]);
  const [lookups, setLookups] = useState({ orderStatuses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [refreshKey, setRefreshKey] = useState(0);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    apiFetch("/admin/lookups")
      .then((data) => setLookups({ orderStatuses: data?.orderStatuses || [] }))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch(`/admin/orders${buildQuery({ page, limit: PAGE_SIZE, search, status })}`);
      const rows = Array.isArray(response?.items) ? response.items : [];
      setItems(rows);
      setPagination(normalizePagination(response, rows.length));
    } catch (requestError) {
      setItems([]);
      setError(requestError.message || "Không thể tải đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [page, refreshKey, search, status]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(orderId, statusCode) {
    setError("");
    try {
      const response = await apiFetch(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ statusCode }),
      });
      setNotice(response?.message || "Đã cập nhật đơn hàng.");
      window.setTimeout(() => setNotice(""), 2500);
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message || "Không thể cập nhật đơn hàng.");
    }
  }

  async function openDetail(orderId) {
    setError("");
    try {
      setDetail(await apiFetch(`/admin/orders/${orderId}`));
    } catch (requestError) {
      setError(requestError.message || "Không thể tải chi tiết đơn hàng.");
    }
  }

  return (
    <section className="gx-admin-resource">
      <ResourceHero eyebrow="ORDER MANAGEMENT" title="Đơn hàng và xử lý bán hàng" description="Theo dõi khách hàng, tổng tiền, thanh toán và chuyển trạng thái đơn hàng theo quy trình vận hành.">
        <button type="button" className="gx-admin-resource__button" onClick={() => setRefreshKey((value) => value + 1)}>Tải lại</button>
      </ResourceHero>

      <form className="gx-admin-resource__filters is-two" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}>
        <label><span>Tìm kiếm</span><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Mã đơn, tên hoặc email khách hàng..." /></label>
        <label><span>Trạng thái</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Tất cả</option>{lookups.orderStatuses.map((item) => <option key={item.id} value={item.code}>{item.name}</option>)}</select></label>
        <div className="gx-admin-resource__filter-actions"><button type="submit" className="gx-admin-resource__button is-primary">Tìm kiếm</button><button type="button" className="gx-admin-resource__button" onClick={() => { setSearchInput(""); setSearch(""); setStatus(""); setPage(1); }}>Xóa lọc</button></div>
      </form>

      <Notice error={error} notice={notice} />

      <section className="gx-admin-resource__card">
        <div className="gx-admin-resource__card-header"><div><strong>Danh sách đơn hàng</strong><span>{pagination.total} đơn hàng</span></div></div>
        <div className="gx-admin-resource__table-wrap">
          <table>
            <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7" className="gx-admin-resource__empty">Đang tải đơn hàng...</td></tr> : items.length === 0 ? <tr><td colSpan="7" className="gx-admin-resource__empty">Chưa có đơn hàng phù hợp.</td></tr> : items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.code}</strong><div className="gx-admin-resource__muted">ID #{item.id}</div></td>
                  <td><strong>{item.customerName}</strong><div className="gx-admin-resource__muted">{item.customerEmail}</div></td>
                  <td><strong>{formatCurrency(item.totalAmount)}</strong></td>
                  <td><span className={statusBadge(item.paymentStatusCode || "PENDING")}>{item.paymentStatusCode || "Chưa tạo"}</span></td>
                  <td><select value={item.statusCode} onChange={(event) => updateStatus(item.id, event.target.value)}>{lookups.orderStatuses.map((statusItem) => <option key={statusItem.id} value={statusItem.code}>{statusItem.name}</option>)}</select></td>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td><button type="button" className="gx-admin-resource__button" onClick={() => openDetail(item.id)}>Chi tiết</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pagination={pagination} loading={loading} onPage={setPage} />
      </section>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} eyebrow="ORDER DETAIL" title={detail?.order_code || "Chi tiết đơn hàng"} wide>
        {detail && (
          <div className="gx-admin-resource__split">
            <section className="gx-admin-resource__mini-card"><h4>Thông tin khách hàng</h4><p><strong>{detail.user_full_name}</strong></p><p>{detail.user_email}</p><p>{detail.user_phone}</p><p>{[detail.shipping_street, detail.shipping_ward, detail.shipping_district, detail.shipping_province].filter(Boolean).join(", ") || "Chưa có địa chỉ"}</p></section>
            <section className="gx-admin-resource__mini-card"><h4>Tổng quan đơn</h4><p>Trạng thái: <strong>{detail.order_status_name}</strong></p><p>Tổng tiền: <strong>{formatCurrency(detail.total_amount)}</strong></p><p>Ngày tạo: {formatDateTime(detail.order_created_at)}</p></section>
            <section className="gx-admin-resource__mini-card is-full" style={{ gridColumn: "1 / -1" }}><h4>Sản phẩm</h4><ul className="gx-admin-resource__list">{detail.items?.map((row, index) => <li key={`${row.productId}-${index}`}><div><strong>{row.productName}</strong><small>{row.variantName || "Mặc định"} · SL {row.quantity}</small></div><strong>{formatCurrency(row.lineTotal)}</strong></li>)}</ul></section>
          </div>
        )}
      </Modal>
    </section>
  );
}

export function AdminReviewsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [refreshKey, setRefreshKey] = useState(0);
  const [replyState, setReplyState] = useState({ review: null, content: "" });

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await apiFetch(`/admin/reviews${buildQuery({ page, limit: PAGE_SIZE, search, status })}`);
      const rows = Array.isArray(response?.items) ? response.items : [];
      setItems(rows); setPagination(normalizePagination(response, rows.length));
    } catch (requestError) { setItems([]); setError(requestError.message || "Không thể tải đánh giá."); }
    finally { setLoading(false); }
  }, [page, refreshKey, search, status]);
  useEffect(() => { load(); }, [load]);

  async function moderate(id, nextStatus) {
    try {
      const response = await apiFetch(`/admin/reviews/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      setNotice(response?.message || "Đã cập nhật đánh giá."); window.setTimeout(() => setNotice(""), 2500); setRefreshKey((value) => value + 1);
    } catch (requestError) { setError(requestError.message || "Không thể cập nhật đánh giá."); }
  }

  async function submitReply(event) {
    event.preventDefault();
    try {
      const response = await apiFetch(`/admin/reviews/${replyState.review.id}/replies`, { method: "POST", body: JSON.stringify({ content: replyState.content.trim() }) });
      setNotice(response?.message || "Đã phản hồi đánh giá."); setReplyState({ review: null, content: "" }); setRefreshKey((value) => value + 1);
    } catch (requestError) { setError(requestError.message || "Không thể gửi phản hồi."); }
  }

  return (
    <section className="gx-admin-resource">
      <ResourceHero eyebrow="REVIEW MODERATION" title="Kiểm duyệt đánh giá" description="Duyệt, từ chối hoặc phản hồi đánh giá của khách hàng để bảo đảm nội dung hiển thị phù hợp."><button type="button" className="gx-admin-resource__button" onClick={() => setRefreshKey((value) => value + 1)}>Tải lại</button></ResourceHero>
      <form className="gx-admin-resource__filters is-two" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}><label><span>Tìm kiếm</span><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Sản phẩm, khách hàng hoặc tiêu đề..." /></label><label><span>Trạng thái</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Tất cả</option><option value="PENDING">PENDING</option><option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option></select></label><div className="gx-admin-resource__filter-actions"><button type="submit" className="gx-admin-resource__button is-primary">Tìm kiếm</button><button type="button" className="gx-admin-resource__button" onClick={() => { setSearchInput(""); setSearch(""); setStatus(""); }}>Xóa lọc</button></div></form>
      <Notice error={error} notice={notice} />
      <section className="gx-admin-resource__card"><div className="gx-admin-resource__card-header"><div><strong>Danh sách đánh giá</strong><span>{pagination.total} đánh giá</span></div></div><div className="gx-admin-resource__table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Khách hàng</th><th>Đánh giá</th><th>Nội dung</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="gx-admin-resource__empty">Đang tải...</td></tr> : items.length === 0 ? <tr><td colSpan="6" className="gx-admin-resource__empty">Chưa có đánh giá.</td></tr> : items.map((item) => <tr key={item.id}><td><strong>{item.productName}</strong></td><td><strong>{item.userName}</strong><div className="gx-admin-resource__muted">{item.userEmail}</div></td><td>{"★".repeat(Math.max(0, Math.min(5, item.rating)))}</td><td><strong>{item.title || "Không có tiêu đề"}</strong><div className="gx-admin-resource__muted">{item.content || "—"}</div></td><td><span className={statusBadge(item.status)}>{item.status}</span></td><td><div className="gx-admin-resource__row-actions"><button type="button" className="gx-admin-resource__button is-success" onClick={() => moderate(item.id, "APPROVED")}>Duyệt</button><button type="button" className="gx-admin-resource__button is-danger" onClick={() => moderate(item.id, "REJECTED")}>Từ chối</button><button type="button" className="gx-admin-resource__button" onClick={() => setReplyState({ review: item, content: "" })}>Phản hồi</button></div></td></tr>)}</tbody></table></div><Pagination page={page} pagination={pagination} loading={loading} onPage={setPage} /></section>
      <Modal open={Boolean(replyState.review)} onClose={() => setReplyState({ review: null, content: "" })} eyebrow="REPLY REVIEW" title={`Phản hồi ${replyState.review?.userName || "khách hàng"}`} footer={<><button type="button" className="gx-admin-resource__button" onClick={() => setReplyState({ review: null, content: "" })}>Hủy</button><button type="submit" form="gx-review-reply-form" className="gx-admin-resource__button is-primary">Gửi phản hồi</button></>}><form id="gx-review-reply-form" onSubmit={submitReply}><label className="gx-admin-resource__field"><span>Nội dung phản hồi *</span><textarea value={replyState.content} onChange={(event) => setReplyState((previous) => ({ ...previous, content: event.target.value }))} required minLength="2" /></label></form></Modal>
    </section>
  );
}

export function AdminPromotionsPage() {
  const emptyForm = { code: "", name: "", description: "", discountType: "PERCENT", discountValue: "10", minOrderValue: "0", maxDiscountValue: "", startAt: "", endAt: "", usageLimit: "", status: "DRAFT" };
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [searchInput, setSearchInput] = useState(""); const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [page, setPage] = useState(1); const [pagination, setPagination] = useState({ total: 0, totalPages: 1 }); const [refreshKey, setRefreshKey] = useState(0); const [modal, setModal] = useState({ open: false, item: null }); const [form, setForm] = useState(emptyForm); const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(""); try { const response = await apiFetch(`/admin/promotions${buildQuery({ page, limit: PAGE_SIZE, search, status })}`); const rows = Array.isArray(response?.items) ? response.items : []; setItems(rows); setPagination(normalizePagination(response, rows.length)); } catch (requestError) { setItems([]); setError(requestError.message || "Không thể tải khuyến mãi."); } finally { setLoading(false); } }, [page, refreshKey, search, status]);
  useEffect(() => { load(); }, [load]);
  function openForm(item = null) { setModal({ open: true, item }); setForm(item ? { code: item.promotion_code || "", name: item.promotion_name || "", description: item.promotion_description || "", discountType: item.discount_type || "PERCENT", discountValue: String(item.discount_value ?? 0), minOrderValue: String(item.min_order_value ?? 0), maxDiscountValue: item.max_discount_value == null ? "" : String(item.max_discount_value), startAt: item.start_at ? new Date(item.start_at).toISOString().slice(0, 16) : "", endAt: item.end_at ? new Date(item.end_at).toISOString().slice(0, 16) : "", usageLimit: item.usage_limit == null ? "" : String(item.usage_limit), status: item.promotion_status || "DRAFT" } : emptyForm); }
  async function save(event) { event.preventDefault(); setSaving(true); setError(""); const payload = { code: form.code.trim().toUpperCase(), name: form.name.trim(), description: form.description.trim() || undefined, discountType: form.discountType, discountValue: Number(form.discountValue), minOrderValue: Number(form.minOrderValue || 0), maxDiscountValue: form.maxDiscountValue ? Number(form.maxDiscountValue) : undefined, startAt: new Date(form.startAt).toISOString(), endAt: new Date(form.endAt).toISOString(), usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined, status: form.status }; try { const response = await apiFetch(modal.item ? `/admin/promotions/${modal.item.promotion_id}` : "/admin/promotions", { method: modal.item ? "PATCH" : "POST", body: JSON.stringify(payload) }); setNotice(response?.message || "Đã lưu khuyến mãi."); setModal({ open: false, item: null }); setRefreshKey((value) => value + 1); } catch (requestError) { setError(requestError.message || "Không thể lưu khuyến mãi."); } finally { setSaving(false); } }
  async function deactivate(id) { try { const response = await apiFetch(`/admin/promotions/${id}`, { method: "DELETE" }); setNotice(response?.message || "Đã tắt khuyến mãi."); setRefreshKey((value) => value + 1); } catch (requestError) { setError(requestError.message || "Không thể tắt khuyến mãi."); } }
  return <section className="gx-admin-resource"><ResourceHero eyebrow="PROMOTION MANAGEMENT" title="Khuyến mãi và mã ưu đãi" description="Tạo chương trình giảm phần trăm hoặc số tiền cố định, giới hạn thời gian và số lượt sử dụng."><button type="button" className="gx-admin-resource__button is-primary" onClick={() => openForm()}>Tạo khuyến mãi</button></ResourceHero><form className="gx-admin-resource__filters is-two" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}><label><span>Tìm kiếm</span><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Mã hoặc tên khuyến mãi..." /></label><label><span>Trạng thái</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Tất cả</option><option value="DRAFT">DRAFT</option><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></label><div className="gx-admin-resource__filter-actions"><button type="submit" className="gx-admin-resource__button is-primary">Tìm kiếm</button></div></form><Notice error={error} notice={notice} /><section className="gx-admin-resource__card"><div className="gx-admin-resource__card-header"><div><strong>Danh sách khuyến mãi</strong><span>{pagination.total} chương trình</span></div></div><div className="gx-admin-resource__table-wrap"><table><thead><tr><th>Mã</th><th>Tên</th><th>Mức giảm</th><th>Thời gian</th><th>Sử dụng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{loading ? <tr><td colSpan="7" className="gx-admin-resource__empty">Đang tải...</td></tr> : items.length === 0 ? <tr><td colSpan="7" className="gx-admin-resource__empty">Chưa có khuyến mãi.</td></tr> : items.map((item) => <tr key={item.promotion_id}><td><strong>{item.promotion_code}</strong></td><td>{item.promotion_name}</td><td>{item.discount_type === "PERCENT" ? `${item.discount_value}%` : formatCurrency(item.discount_value)}</td><td><div>{formatDateTime(item.start_at)}</div><div className="gx-admin-resource__muted">đến {formatDateTime(item.end_at)}</div></td><td>{item.used_count}/{item.usage_limit ?? "∞"}</td><td><span className={statusBadge(item.promotion_status)}>{item.promotion_status}</span></td><td><div className="gx-admin-resource__row-actions"><button type="button" className="gx-admin-resource__button" onClick={() => openForm(item)}>Sửa</button><button type="button" className="gx-admin-resource__button is-danger" onClick={() => deactivate(item.promotion_id)}>Tắt</button></div></td></tr>)}</tbody></table></div><Pagination page={page} pagination={pagination} loading={loading} onPage={setPage} /></section><Modal open={modal.open} onClose={() => !saving && setModal({ open: false, item: null })} eyebrow="PROMOTION FORM" title={modal.item ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi"} footer={<><button type="button" className="gx-admin-resource__button" onClick={() => setModal({ open: false, item: null })}>Hủy</button><button type="submit" form="gx-promotion-form" className="gx-admin-resource__button is-primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu khuyến mãi"}</button></>}><form id="gx-promotion-form" onSubmit={save}><div className="gx-admin-resource__form-grid"><label className="gx-admin-resource__field"><span>Mã *</span><input value={form.code} onChange={(event) => setForm((previous) => ({ ...previous, code: event.target.value }))} required /></label><label className="gx-admin-resource__field"><span>Tên *</span><input value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} required /></label><label className="gx-admin-resource__field"><span>Loại giảm</span><select value={form.discountType} onChange={(event) => setForm((previous) => ({ ...previous, discountType: event.target.value }))}><option value="PERCENT">Phần trăm</option><option value="FIXED">Số tiền</option></select></label><label className="gx-admin-resource__field"><span>Giá trị giảm *</span><input type="number" min="0" value={form.discountValue} onChange={(event) => setForm((previous) => ({ ...previous, discountValue: event.target.value }))} required /></label><label className="gx-admin-resource__field"><span>Đơn tối thiểu</span><input type="number" min="0" value={form.minOrderValue} onChange={(event) => setForm((previous) => ({ ...previous, minOrderValue: event.target.value }))} /></label><label className="gx-admin-resource__field"><span>Giảm tối đa</span><input type="number" min="0" value={form.maxDiscountValue} onChange={(event) => setForm((previous) => ({ ...previous, maxDiscountValue: event.target.value }))} /></label><label className="gx-admin-resource__field"><span>Bắt đầu *</span><input type="datetime-local" value={form.startAt} onChange={(event) => setForm((previous) => ({ ...previous, startAt: event.target.value }))} required /></label><label className="gx-admin-resource__field"><span>Kết thúc *</span><input type="datetime-local" value={form.endAt} onChange={(event) => setForm((previous) => ({ ...previous, endAt: event.target.value }))} required /></label><label className="gx-admin-resource__field"><span>Giới hạn lượt</span><input type="number" min="1" value={form.usageLimit} onChange={(event) => setForm((previous) => ({ ...previous, usageLimit: event.target.value }))} /></label><label className="gx-admin-resource__field"><span>Trạng thái</span><select value={form.status} onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value }))}><option value="DRAFT">DRAFT</option><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></label><label className="gx-admin-resource__field is-full"><span>Mô tả</span><textarea value={form.description} onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))} /></label></div></form></Modal></section>;
}

export function AdminAiConfigPage() {
  const [settings, setSettings] = useState([]); const [logs, setLogs] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [page, setPage] = useState(1); const [pagination, setPagination] = useState({ total: 0, totalPages: 1 }); const [tab, setTab] = useState("settings");
  const load = useCallback(async () => { setLoading(true); setError(""); try { if (tab === "settings") { const response = await apiFetch("/admin/settings?group=AI"); setSettings(Array.isArray(response) ? response : []); } else { const response = await apiFetch(`/admin/ai/search-logs${buildQuery({ page, limit: PAGE_SIZE })}`); const rows = Array.isArray(response?.items) ? response.items : []; setLogs(rows); setPagination(normalizePagination(response, rows.length)); } } catch (requestError) { setError(requestError.message || "Không thể tải cấu hình AI."); } finally { setLoading(false); } }, [page, tab]);
  useEffect(() => { load(); }, [load]);
  async function saveSetting(setting) { try { const response = await apiFetch("/admin/settings", { method: "PUT", body: JSON.stringify({ key: setting.key, group: setting.group || "AI", value: String(setting.value), valueType: setting.valueType || "STRING", description: setting.description || undefined }) }); setNotice(response?.message || "Đã lưu cấu hình."); window.setTimeout(() => setNotice(""), 2500); } catch (requestError) { setError(requestError.message || "Không thể lưu cấu hình."); } }
  return <section className="gx-admin-resource"><ResourceHero eyebrow="AI CONFIGURATION" title="Cấu hình AI Search" description="Điều chỉnh provider, model, trạng thái hoạt động và giới hạn kết quả; đồng thời xem lịch sử truy vấn AI."><button type="button" className="gx-admin-resource__button" onClick={load}>Tải lại</button></ResourceHero><div className="gx-admin-inventory__tabs"><button type="button" className={tab === "settings" ? "is-active" : ""} onClick={() => { setTab("settings"); setPage(1); }}>Cấu hình</button><button type="button" className={tab === "logs" ? "is-active" : ""} onClick={() => { setTab("logs"); setPage(1); }}>Lịch sử tìm kiếm</button></div><Notice error={error} notice={notice} />{tab === "settings" ? <section className="gx-admin-resource__card"><div className="gx-admin-resource__card-header"><div><strong>Cấu hình AI</strong><span>{settings.length} biến cấu hình</span></div></div><div className="gx-admin-resource__dialog-body">{loading ? <p>Đang tải...</p> : <div className="gx-admin-resource__form-grid">{settings.map((setting, index) => <label key={setting.key} className="gx-admin-resource__field"><span>{setting.key}</span><input value={setting.value} onChange={(event) => setSettings((previous) => previous.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} /><small className="gx-admin-resource__muted">{setting.description}</small><button type="button" className="gx-admin-resource__button is-primary" onClick={() => saveSetting(setting)}>Lưu</button></label>)}</div>}</div></section> : <section className="gx-admin-resource__card"><div className="gx-admin-resource__card-header"><div><strong>Lịch sử AI Search</strong><span>{pagination.total} truy vấn</span></div></div><div className="gx-admin-resource__table-wrap"><table><thead><tr><th>Người dùng</th><th>Truy vấn</th><th>Intent</th><th>Khoảng giá</th><th>Kết quả</th><th>Trạng thái</th><th>Thời gian</th></tr></thead><tbody>{loading ? <tr><td colSpan="7" className="gx-admin-resource__empty">Đang tải...</td></tr> : logs.length === 0 ? <tr><td colSpan="7" className="gx-admin-resource__empty">Chưa có lịch sử.</td></tr> : logs.map((item) => <tr key={item.id}><td>{item.customerName || "Khách"}</td><td>{item.queryText}</td><td>{item.purpose || item.categoryName || "—"}</td><td>{item.minPrice || item.maxPrice ? `${formatCurrency(item.minPrice)} - ${formatCurrency(item.maxPrice)}` : "—"}</td><td>{item.resultCount}</td><td><span className={statusBadge("SUCCESS")}>{"SUCCESS"}</span></td><td>{formatDateTime(item.searchedAt)}</td></tr>)}</tbody></table></div><Pagination page={page} pagination={pagination} loading={loading} onPage={setPage} /></section>}</section>;
}

export function AdminReportsPage() {
  const today = new Date(); const firstDay = new Date(today.getFullYear(), today.getMonth(), 1); const toInput = (date) => date.toISOString().slice(0, 10);
  const [from, setFrom] = useState(toInput(firstDay)); const [to, setTo] = useState(toInput(today)); const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { setData(await apiFetch(`/admin/reports${buildQuery({ from, to })}`)); } catch (requestError) { setError(requestError.message || "Không thể tải báo cáo."); } finally { setLoading(false); } }, [from, to]);
  useEffect(() => { load(); }, [load]);
  const daily = Array.isArray(data?.dailyRevenue) ? data.dailyRevenue : []; const maximum = Math.max(...daily.map((item) => Number(item.revenue || 0)), 1); const summary = data?.summary || {};
  return <section className="gx-admin-resource"><ResourceHero eyebrow="BUSINESS REPORT" title="Báo cáo doanh thu" description="Tổng hợp đơn hàng, doanh thu, giá trị đơn trung bình và sản phẩm bán chạy theo khoảng thời gian."><button type="button" className="gx-admin-resource__button is-primary" onClick={load}>Làm mới báo cáo</button></ResourceHero><div className="gx-admin-resource__filters is-two"><label><span>Từ ngày</span><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label><span>Đến ngày</span><input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label><div className="gx-admin-resource__filter-actions"><button type="button" className="gx-admin-resource__button is-primary" onClick={load}>Xem báo cáo</button></div></div><Notice error={error} /><section className="gx-admin-resource__stats"><article className="gx-admin-resource__stat"><div className="gx-admin-resource__stat-icon"><FontAwesomeIcon icon={["fas", "receipt"]} /></div><div><span>Tổng đơn hàng</span><strong>{loading ? "…" : Number(summary.totalOrders || 0)}</strong></div></article><article className="gx-admin-resource__stat"><div className="gx-admin-resource__stat-icon"><FontAwesomeIcon icon={["fas", "money-bill-wave"]} /></div><div><span>Doanh thu</span><strong>{loading ? "…" : formatCurrency(summary.revenue)}</strong></div></article><article className="gx-admin-resource__stat"><div className="gx-admin-resource__stat-icon"><FontAwesomeIcon icon={["fas", "chart-line"]} /></div><div><span>Giá trị đơn trung bình</span><strong>{loading ? "…" : formatCurrency(summary.averageOrderValue)}</strong></div></article><article className="gx-admin-resource__stat"><div className="gx-admin-resource__stat-icon"><FontAwesomeIcon icon={["fas", "users"]} /></div><div><span>Khách mua hàng</span><strong>{loading ? "…" : Number(summary.purchasingCustomers || 0)}</strong></div></article></section><div className="gx-admin-resource__split"><section className="gx-admin-resource__card"><div className="gx-admin-resource__card-header"><div><strong>Doanh thu theo ngày</strong><span>{daily.length} ngày có dữ liệu</span></div></div><div className="gx-admin-resource__dialog-body"><div className="gx-admin-resource__chart">{daily.length === 0 ? <p className="gx-admin-resource__muted">Chưa có dữ liệu doanh thu.</p> : daily.map((item) => <div key={item.reportDate} className="gx-admin-resource__chart-row"><span>{String(item.reportDate || "").slice(0, 10)}</span><div className="gx-admin-resource__bar"><span style={{ width: `${Math.max((Number(item.revenue || 0) / maximum) * 100, 2)}%` }} /></div><strong>{formatCurrency(item.revenue)}</strong></div>)}</div></div></section><section className="gx-admin-resource__card"><div className="gx-admin-resource__card-header"><div><strong>Sản phẩm bán chạy</strong><span>Trong khoảng đã chọn</span></div></div><div className="gx-admin-resource__table-wrap"><table><thead><tr><th>Sản phẩm</th><th>SL bán</th><th>Doanh thu</th></tr></thead><tbody>{data?.topProducts?.length ? data.topProducts.map((item) => <tr key={item.productId}><td><strong>{item.productName}</strong></td><td>{item.quantitySold}</td><td>{formatCurrency(item.revenue)}</td></tr>) : <tr><td colSpan="3" className="gx-admin-resource__empty">Chưa có dữ liệu.</td></tr>}</tbody></table></div></section></div></section>;
}

export function AdminAuditLogsPage() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [searchInput, setSearchInput] = useState(""); const [search, setSearch] = useState(""); const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [page, setPage] = useState(1); const [pagination, setPagination] = useState({ total: 0, totalPages: 1 }); const [refreshKey, setRefreshKey] = useState(0);
  const load = useCallback(async () => { setLoading(true); setError(""); try { const response = await apiFetch(`/admin/audit-logs${buildQuery({ page, limit: PAGE_SIZE, search, from, to })}`); const rows = Array.isArray(response?.items) ? response.items : []; setItems(rows); setPagination(normalizePagination(response, rows.length)); } catch (requestError) { setItems([]); setError(requestError.message || "Không thể tải nhật ký."); } finally { setLoading(false); } }, [from, page, refreshKey, search, to]);
  useEffect(() => { load(); }, [load]);
  return <section className="gx-admin-resource"><ResourceHero eyebrow="AUDIT LOGS" title="Nhật ký hệ thống" description="Theo dõi ai đã thực hiện thao tác gì, trên bảng dữ liệu nào và vào thời điểm nào."><button type="button" className="gx-admin-resource__button" onClick={() => setRefreshKey((value) => value + 1)}>Tải lại</button></ResourceHero><form className="gx-admin-resource__filters" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}><label><span>Tìm kiếm</span><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Hành động, bảng hoặc người thực hiện..." /></label><label><span>Từ ngày</span><input type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} /></label><label><span>Đến ngày</span><input type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} /></label><div className="gx-admin-resource__filter-actions"><button type="submit" className="gx-admin-resource__button is-primary">Tìm kiếm</button></div></form><Notice error={error} /><section className="gx-admin-resource__card"><div className="gx-admin-resource__card-header"><div><strong>Nhật ký quản trị</strong><span>{pagination.total} bản ghi</span></div></div><div className="gx-admin-resource__table-wrap"><table><thead><tr><th>Người thực hiện</th><th>Hành động</th><th>Bảng</th><th>Record ID</th><th>Mô tả</th><th>Thời gian</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="gx-admin-resource__empty">Đang tải...</td></tr> : items.length === 0 ? <tr><td colSpan="6" className="gx-admin-resource__empty">Chưa có nhật ký.</td></tr> : items.map((item) => <tr key={item.id}><td><strong>{item.actorName || "Hệ thống"}</strong><div className="gx-admin-resource__muted">{item.actorEmail || "—"}</div></td><td><span className="gx-admin-resource__badge">{item.actionName}</span></td><td>{item.tableName}</td><td>{item.recordId ?? "—"}</td><td>{item.description}</td><td>{formatDateTime(item.createdAt)}</td></tr>)}</tbody></table></div><Pagination page={page} pagination={pagination} loading={loading} onPage={setPage} /></section></section>;
}
