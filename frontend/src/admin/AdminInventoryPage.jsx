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
import "./AdminInventoryPage.css";

const PAGE_SIZE = 12;

const emptyTransaction = {
  inventoryKey: "",
  typeCode: "IN",
  quantity: "1",
  unitCost: "",
  note: "",
};

function AdminInventoryPage() {
  const [activeTab, setActiveTab] = useState("stock");
  const [rows, setRows] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: PAGE_SIZE,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyTransaction);
  const [saving, setSaving] = useState(false);

  const loadStock = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        `/admin/inventory${buildQuery({
          page,
          limit: PAGE_SIZE,
          search,
          status,
        })}`,
      );
      const items = Array.isArray(response?.items) ? response.items : [];
      setRows(items);
      setPagination(normalizePagination(response, items.length));
    } catch (requestError) {
      setRows([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải dữ liệu kho.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, refreshKey, search, status]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        `/admin/inventory/transactions${buildQuery({
          page,
          limit: PAGE_SIZE,
        })}`,
      );
      const items = Array.isArray(response?.items) ? response.items : [];
      setTransactions(items);
      setPagination(normalizePagination(response, items.length));
    } catch (requestError) {
      setTransactions([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải lịch sử kho.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, refreshKey]);

  useEffect(() => {
    if (activeTab === "stock") {
      loadStock();
    } else {
      loadTransactions();
    }
  }, [activeTab, loadStock, loadTransactions]);

  const stats = useMemo(() => {
    const stock = rows.reduce(
      (sum, item) => sum + Number(item.stockQuantity || 0),
      0,
    );
    const reserved = rows.reduce(
      (sum, item) => sum + Number(item.reservedQuantity || 0),
      0,
    );
    const available = rows.reduce(
      (sum, item) => sum + Number(item.availableQuantity || 0),
      0,
    );
    const low = rows.filter(
      (item) => Number(item.availableQuantity || 0) <= 5,
    ).length;

    return [
      { label: "Tổng biến thể", value: pagination.total, icon: "boxes" },
      { label: "Tồn thực tế trong trang", value: stock, icon: "warehouse" },
      { label: "Đang giữ chỗ", value: reserved, icon: "lock" },
      { label: "Sắp hết hàng", value: low, icon: "exclamation-triangle", note: available },
    ];
  }, [pagination.total, rows]);

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  function openTransaction(row) {
    setForm({
      ...emptyTransaction,
      inventoryKey: row
        ? `${row.productId}:${row.variantId}`
        : rows[0]
          ? `${rows[0].productId}:${rows[0].variantId}`
          : "",
    });
    setModalOpen(true);
  }

  async function submitTransaction(event) {
    event.preventDefault();
    const [productId, variantId] = form.inventoryKey
      .split(":")
      .map(Number);

    if (!productId || !variantId) {
      setError("Vui lòng chọn biến thể cần cập nhật kho.");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity === 0) {
      setError("Số lượng phải là số nguyên khác 0.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await apiFetch("/admin/inventory/transactions", {
        method: "POST",
        body: JSON.stringify({
          productId,
          variantId,
          typeCode: form.typeCode,
          quantity,
          unitCost: form.unitCost ? Number(form.unitCost) : undefined,
          note: form.note.trim() || undefined,
        }),
      });
      showNotice(response?.message || "Đã cập nhật kho.");
      setModalOpen(false);
      setForm(emptyTransaction);
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message || "Không thể cập nhật kho.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="gx-admin-resource gx-admin-inventory">
      <header className="gx-admin-resource__hero">
        <div className="gx-admin-resource__hero-copy">
          <span>INVENTORY MANAGEMENT</span>
          <h2>Quản lý kho</h2>
          <p>
            Theo dõi tồn thực tế, số lượng đang giữ chỗ, lượng có thể bán và tạo
            giao dịch nhập, xuất hoặc điều chỉnh kho theo từng biến thể.
          </p>
        </div>

        <div className="gx-admin-resource__actions">
          <button
            type="button"
            className="gx-admin-resource__button"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            <FontAwesomeIcon icon={["fas", "sync-alt"]} />
            Tải lại
          </button>
          <button
            type="button"
            className="gx-admin-resource__button is-primary"
            onClick={() => openTransaction(null)}
            disabled={rows.length === 0}
          >
            <FontAwesomeIcon icon={["fas", "exchange-alt"]} />
            Tạo giao dịch kho
          </button>
        </div>
      </header>

      <section className="gx-admin-resource__stats">
        {stats.map((item) => (
          <article key={item.label} className="gx-admin-resource__stat">
            <div className="gx-admin-resource__stat-icon">
              <FontAwesomeIcon icon={["fas", item.icon]} />
            </div>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              {item.note !== undefined && (
                <small className="gx-admin-resource__muted">
                  {item.note} sản phẩm có thể bán trong trang
                </small>
              )}
            </div>
          </article>
        ))}
      </section>

      <div className="gx-admin-inventory__tabs">
        <button
          type="button"
          className={activeTab === "stock" ? "is-active" : ""}
          onClick={() => {
            setActiveTab("stock");
            setPage(1);
          }}
        >
          Tồn kho hiện tại
        </button>
        <button
          type="button"
          className={activeTab === "history" ? "is-active" : ""}
          onClick={() => {
            setActiveTab("history");
            setPage(1);
          }}
        >
          Lịch sử giao dịch
        </button>
      </div>

      {activeTab === "stock" && (
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
              placeholder="Tên sản phẩm, biến thể hoặc SKU..."
            />
          </label>
          <label>
            <span>Trạng thái biến thể</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>
          <div className="gx-admin-resource__filter-actions">
            <button type="submit" className="gx-admin-resource__button is-primary">
              Tìm kiếm
            </button>
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
      )}

      {notice && (
        <div className="gx-admin-resource__notice">
          <FontAwesomeIcon icon={["fas", "check-circle"]} />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="gx-admin-resource__notice is-error" role="alert">
          <FontAwesomeIcon icon={["fas", "exclamation-triangle"]} />
          <span>{error}</span>
        </div>
      )}

      <section className="gx-admin-resource__card">
        <div className="gx-admin-resource__card-header">
          <div>
            <strong>
              {activeTab === "stock" ? "Danh sách tồn kho" : "Lịch sử giao dịch kho"}
            </strong>
            <span>{pagination.total} bản ghi trong hệ thống</span>
          </div>
          <span>
            Trang {page}/{pagination.totalPages}
          </span>
        </div>

        <div className="gx-admin-resource__table-wrap">
          {activeTab === "stock" ? (
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm / biến thể</th>
                  <th>SKU</th>
                  <th>Tồn kho</th>
                  <th>Giữ chỗ</th>
                  <th>Có thể bán</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="gx-admin-resource__empty">
                      Đang tải tồn kho...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="gx-admin-resource__empty">
                      Không tìm thấy biến thể phù hợp.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.variantId}>
                      <td>
                        <div className="gx-admin-inventory__identity">
                          <strong>{row.productName}</strong>
                          <small>{row.variantName || "Mặc định"}</small>
                        </div>
                      </td>
                      <td>{row.sku || "—"}</td>
                      <td>{row.stockQuantity}</td>
                      <td>{row.reservedQuantity}</td>
                      <td>
                        <span
                          className={`gx-admin-resource__badge ${
                            Number(row.availableQuantity) <= 5
                              ? "is-inactive"
                              : "is-active"
                          }`}
                        >
                          {row.availableQuantity}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`gx-admin-resource__badge is-${String(
                            row.status,
                          ).toLowerCase()}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="gx-admin-resource__button is-primary"
                          onClick={() => openTransaction(row)}
                        >
                          Cập nhật kho
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Loại</th>
                  <th>Số lượng</th>
                  <th>Giá vốn</th>
                  <th>Nhân viên</th>
                  <th>Ghi chú</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="gx-admin-resource__empty">
                      Đang tải lịch sử...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="gx-admin-resource__empty">
                      Chưa có giao dịch kho.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <div className="gx-admin-inventory__identity">
                          <strong>{transaction.productName}</strong>
                          <small>{transaction.variantName || "Mặc định"}</small>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`gx-admin-resource__badge is-${String(
                            transaction.typeCode,
                          ).toLowerCase()}`}
                        >
                          {transaction.typeName || transaction.typeCode}
                        </span>
                      </td>
                      <td>{transaction.quantity}</td>
                      <td>
                        {transaction.unitCost === null
                          ? "—"
                          : formatCurrency(transaction.unitCost)}
                      </td>
                      <td>{transaction.staffName || "—"}</td>
                      <td>{transaction.note || "—"}</td>
                      <td>{formatDateTime(transaction.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <footer className="gx-admin-resource__pagination">
          <span>
            Hiển thị {activeTab === "stock" ? rows.length : transactions.length} / {pagination.total}
          </span>
          <div>
            <button
              type="button"
              className="gx-admin-resource__button"
              disabled={loading || page <= 1}
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
            >
              Trang trước
            </button>
            <button
              type="button"
              className="gx-admin-resource__button"
              disabled={loading || page >= pagination.totalPages}
              onClick={() =>
                setPage((value) => Math.min(value + 1, pagination.totalPages))
              }
            >
              Trang sau
            </button>
          </div>
        </footer>
      </section>

      {modalOpen && (
        <div
          className="gx-admin-resource__modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <form
            className="gx-admin-resource__dialog"
            role="dialog"
            aria-modal="true"
            onSubmit={submitTransaction}
          >
            <header className="gx-admin-resource__dialog-header">
              <div>
                <span className="gx-admin-resource__eyebrow">INVENTORY TRANSACTION</span>
                <h3>Nhập, xuất hoặc điều chỉnh kho</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Đóng"
              >
                <FontAwesomeIcon icon={["fas", "times"]} />
              </button>
            </header>

            <div className="gx-admin-resource__dialog-body">
              <div className="gx-admin-resource__form-grid">
                <label className="gx-admin-resource__field is-full">
                  <span>Sản phẩm / biến thể *</span>
                  <select
                    value={form.inventoryKey}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        inventoryKey: event.target.value,
                      }))
                    }
                  >
                    <option value="">Chọn biến thể</option>
                    {rows.map((row) => (
                      <option
                        key={row.variantId}
                        value={`${row.productId}:${row.variantId}`}
                      >
                        {row.productName} — {row.variantName || "Mặc định"} (còn {row.availableQuantity})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="gx-admin-resource__field">
                  <span>Loại giao dịch</span>
                  <select
                    value={form.typeCode}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        typeCode: event.target.value,
                      }))
                    }
                  >
                    <option value="IN">Nhập kho</option>
                    <option value="OUT">Xuất kho</option>
                    <option value="ADJUST">Điều chỉnh</option>
                  </select>
                </label>

                <label className="gx-admin-resource__field">
                  <span>Số lượng *</span>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        quantity: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="gx-admin-resource__field">
                  <span>Giá vốn</span>
                  <input
                    type="number"
                    min="0"
                    value={form.unitCost}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        unitCost: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="gx-admin-resource__field is-full">
                  <span>Ghi chú</span>
                  <textarea
                    value={form.note}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        note: event.target.value,
                      }))
                    }
                    placeholder="Ví dụ: nhập hàng từ nhà cung cấp..."
                  />
                </label>
              </div>
            </div>

            <footer className="gx-admin-resource__dialog-footer">
              <button
                type="button"
                className="gx-admin-resource__button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="gx-admin-resource__button is-primary"
                disabled={saving}
              >
                {saving ? "Đang cập nhật..." : "Xác nhận giao dịch"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </section>
  );
}

export default AdminInventoryPage;
