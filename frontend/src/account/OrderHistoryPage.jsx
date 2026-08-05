import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { getMyOrders } from "./accountApi";

const filters = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "CANCELLED", label: "Đã hủy" },
];

function formatVnd(value) {
  return `${Number(value || 0).toLocaleString(
    "vi-VN",
  )}đ`;
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function OrderHistoryPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    orders: [],
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    getMyOrders({ page, limit: 10, status })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, status]);

  function selectStatus(value) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div>
      <header className="gx-account-heading">
        <span>ORDER HISTORY</span>
        <h1>Đơn hàng của tôi</h1>
        <p>
          Theo dõi trạng thái đơn hàng, thanh toán và
          xem lại sản phẩm đã mua.
        </p>
      </header>

      <div className="gx-account-order-filters">
        {filters.map((filter) => (
          <button
            key={filter.value || "all"}
            type="button"
            className={
              status === filter.value
                ? "is-active"
                : ""
            }
            onClick={() =>
              selectStatus(filter.value)
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="gx-account-state is-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="gx-account-state">
          Đang tải đơn hàng...
        </div>
      ) : data.orders.length === 0 ? (
        <div className="gx-account-empty gx-account-panel">
          <FontAwesomeIcon
            icon={["fas", "box-open"]}
          />
          <p>Không có đơn hàng phù hợp.</p>
          <Link to="/products">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="gx-account-order-list">
          {data.orders.map((order) => (
            <article
              key={order.id}
              className="gx-account-order-card"
            >
              <header>
                <div>
                  <span>Mã đơn hàng</span>
                  <strong>{order.code}</strong>
                  <small>
                    {formatDate(order.createdAt)}
                  </small>
                </div>

                <div className="gx-account-order-statuses">
                  <span
                    className={`is-${String(
                      order.statusCode || "pending",
                    ).toLowerCase()}`}
                  >
                    {order.statusName}
                  </span>
                  <small>
                    {order.paymentStatusName ||
                      "Chưa có thanh toán"}
                  </small>
                </div>
              </header>

              <div className="gx-account-order-body">
                <div className="gx-account-order-product">
                  {order.previewImageUrl ? (
                    <img
                      src={order.previewImageUrl}
                      alt={order.previewProductName || "Sản phẩm"}
                    />
                  ) : (
                    <div className="gx-account-image-placeholder">
                      <FontAwesomeIcon
                        icon={["fas", "image"]}
                      />
                    </div>
                  )}

                  <div>
                    <strong>
                      {order.previewProductName ||
                        "Sản phẩm trong đơn"}
                    </strong>
                    <span>
                      {order.itemLineCount} dòng sản phẩm
                    </span>
                  </div>
                </div>

                <div className="gx-account-order-total">
                  <span>Tổng tiền</span>
                  <strong>
                    {formatVnd(order.totalAmount)}
                  </strong>
                  <Link
                    to={`/account/orders/${order.id}`}
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="gx-account-pagination">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() =>
              setPage((value) => value - 1)
            }
          >
            Trang trước
          </button>

          <span>
            Trang {page}/{data.totalPages}
          </span>

          <button
            type="button"
            disabled={
              page >= data.totalPages || loading
            }
            onClick={() =>
              setPage((value) => value + 1)
            }
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;
