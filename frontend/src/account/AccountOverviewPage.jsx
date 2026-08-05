import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { getAccountOverview } from "./accountApi";

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

function AccountOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getAccountOverview()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="gx-account-state">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  if (error) {
    return (
      <div className="gx-account-state is-error">
        {error}
      </div>
    );
  }

  const statistics = data?.statistics || {};
  const profile = data?.profile || {};
  const recentOrders = data?.recentOrders || [];

  const cards = [
    {
      label: "Tổng đơn hàng",
      value: statistics.totalOrders || 0,
      icon: "receipt",
    },
    {
      label: "Đang xử lý",
      value: statistics.processingOrders || 0,
      icon: "truck-loading",
    },
    {
      label: "Đã giao",
      value: statistics.deliveredOrders || 0,
      icon: "check-circle",
    },
    {
      label: "Tổng đã mua",
      value: formatVnd(statistics.totalSpent),
      icon: "wallet",
    },
  ];

  return (
    <div className="gx-account-overview">
      <header className="gx-account-heading">
        <span>ACCOUNT OVERVIEW</span>
        <h1>Xin chào, {profile.fullName}</h1>
        <p>
          Theo dõi hồ sơ và toàn bộ quá trình mua hàng
          của bạn tại Gearxin.
        </p>
      </header>

      <section className="gx-account-stat-grid">
        {cards.map((card) => (
          <article key={card.label}>
            <FontAwesomeIcon
              icon={["fas", card.icon]}
            />
            <div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="gx-account-panel">
        <header>
          <div>
            <span>ĐƠN HÀNG GẦN ĐÂY</span>
            <h2>Lịch sử mua hàng</h2>
          </div>

          <Link to="/account/orders">
            Xem tất cả
          </Link>
        </header>

        {recentOrders.length === 0 ? (
          <div className="gx-account-empty">
            <FontAwesomeIcon
              icon={["fas", "box-open"]}
            />
            <p>Bạn chưa có đơn hàng nào.</p>
            <Link to="/products">
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="gx-account-order-list compact">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="gx-account-order-row"
              >
                <div>
                  <strong>{order.code}</strong>
                  <span>{formatDate(order.createdAt)}</span>
                </div>

                <div>
                  <span>{order.statusName}</span>
                  <strong>
                    {formatVnd(order.totalAmount)}
                  </strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AccountOverviewPage;
