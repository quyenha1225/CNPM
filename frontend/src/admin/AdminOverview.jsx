import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  apiFetch,
  formatCurrency,
  formatDateTime,
} from "../config/api";

function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/admin/dashboard");
      setData(response || {});
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải dữ liệu tổng quan.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summary = data?.summary || {};

  const statistics = useMemo(
    () => [
      {
        label: "Doanh thu hôm nay",
        value: formatCurrency(summary.todayRevenue),
        icon: "money-bill-wave",
        note: "Đơn đã giao trong ngày",
      },
      {
        label: "Đơn chờ xử lý",
        value: Number(summary.pendingOrders || 0),
        icon: "receipt",
        note: "Chờ xác nhận hoặc đang xử lý",
      },
      {
        label: "Sản phẩm đang bán",
        value: Number(summary.activeProducts || 0),
        icon: "box-open",
        note: "Sản phẩm trạng thái ACTIVE",
      },
      {
        label: "Nhân viên hoạt động",
        value: Number(summary.activeStaff || 0),
        icon: "user-tie",
        note: "Tài khoản STAFF đang hoạt động",
      },
    ],
    [summary],
  );

  const recentOrders = Array.isArray(data?.recentOrders)
    ? data.recentOrders
    : [];
  const lowStock = Array.isArray(data?.lowStock)
    ? data.lowStock
    : [];

  return (
    <div className="gx-admin-overview">
      <section className="gx-admin-welcome">
        <div>
          <span>ADMIN CONTROL CENTER</span>

          <h2>Điều hành toàn bộ hệ thống Gearxin</h2>

          <p>
            Số liệu được tải trực tiếp từ backend quản trị. Khi triển khai cloud,
            frontend sẽ dùng địa chỉ API trong biến môi trường.
          </p>
        </div>

        <button
          type="button"
          className="gx-admin-welcome__status"
          onClick={loadDashboard}
          disabled={loading}
        >
          <span />
          {loading ? "Đang đồng bộ..." : "Hệ thống đang hoạt động"}
        </button>
      </section>

      {error && (
        <div className="gx-admin-overview__error" role="alert">
          <FontAwesomeIcon icon={["fas", "exclamation-triangle"]} />
          <span>{error}</span>
        </div>
      )}

      <section className="gx-admin-stat-grid">
        {statistics.map((item) => (
          <article key={item.label} className="gx-admin-stat-card">
            <div className="gx-admin-stat-card__icon">
              <FontAwesomeIcon icon={["fas", item.icon]} />
            </div>

            <div>
              <span>{item.label}</span>
              <strong>{loading ? "…" : item.value}</strong>
              <small>{item.note}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="gx-admin-overview-grid">
        <article className="gx-admin-panel">
          <header>
            <div>
              <span>ĐƠN HÀNG GẦN ĐÂY</span>
              <h3>Hoạt động bán hàng</h3>
            </div>

            <FontAwesomeIcon icon={["fas", "history"]} />
          </header>

          {recentOrders.length === 0 ? (
            <div className="gx-admin-empty-data">
              <FontAwesomeIcon icon={["fas", "receipt"]} />
              <p>Chưa có đơn hàng để hiển thị.</p>
            </div>
          ) : (
            <div className="gx-admin-overview-list">
              {recentOrders.slice(0, 6).map((order) => (
                <div key={order.id || order.code}>
                  <div>
                    <strong>{order.code}</strong>
                    <small>
                      {order.customerName || "Khách hàng"} · {formatDateTime(order.createdAt)}
                    </small>
                  </div>
                  <div>
                    <strong>{formatCurrency(order.totalAmount)}</strong>
                    <small>{order.statusName || order.statusCode}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="gx-admin-panel">
          <header>
            <div>
              <span>CẢNH BÁO KHO</span>
              <h3>Biến thể sắp hết hàng</h3>
            </div>

            <FontAwesomeIcon icon={["fas", "warehouse"]} />
          </header>

          {lowStock.length === 0 ? (
            <div className="gx-admin-empty-data">
              <FontAwesomeIcon icon={["fas", "check-circle"]} />
              <p>Chưa có biến thể nào ở mức tồn kho thấp.</p>
            </div>
          ) : (
            <div className="gx-admin-overview-list">
              {lowStock.slice(0, 7).map((row) => (
                <div key={row.variantId || `${row.productId}-${row.variantName}`}>
                  <div>
                    <strong>{row.productName}</strong>
                    <small>{row.variantName || "Biến thể mặc định"}</small>
                  </div>
                  <div>
                    <strong>{row.availableQuantity}</strong>
                    <small>Có thể bán</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default AdminOverview;
