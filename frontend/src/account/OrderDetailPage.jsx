import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  cancelMyOrder,
  getMyOrderDetail,
  submitPurchasedReview,
} from "./accountApi";

function formatVnd(value) {
  return `${Number(value || 0).toLocaleString(
    "vi-VN",
  )}đ`;
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const emptyReview = {
  rating: 5,
  title: "",
  content: "",
};

function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reviewingProductId, setReviewingProductId] =
    useState(null);
  const [reviewDraft, setReviewDraft] =
    useState(emptyReview);
  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadDetail({ showLoading = true } = {}) {
    if (showLoading) setLoading(true);
    setError("");

    try {
      const result = await getMyOrderDetail(orderId);
      setData(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function handleCancel() {
    const reason = window.prompt(
      "Nhập lý do hủy đơn (có thể để trống):",
      "",
    );

    if (reason === null) return;

    const confirmed = window.confirm(
      "Bạn chắc chắn muốn hủy đơn hàng này?",
    );

    if (!confirmed) return;

    setCancelling(true);
    setError("");
    setMessage("");

    try {
      const result = await cancelMyOrder(orderId, reason);
      setMessage(result.message || "Hủy đơn thành công.");
      await loadDetail({ showLoading: false });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCancelling(false);
    }
  }

  function openReview(productId) {
    setReviewingProductId(productId);
    setReviewDraft(emptyReview);
    setError("");
    setMessage("");
  }

  function closeReview() {
    setReviewingProductId(null);
    setReviewDraft(emptyReview);
  }

  function updateReviewField(event) {
    const { name, value } = event.target;

    setReviewDraft((current) => ({
      ...current,
      [name]: name === "rating" ? Number(value) : value,
    }));
  }

  async function handleReviewSubmit(event, item) {
    event.preventDefault();
    setReviewSubmitting(true);
    setError("");
    setMessage("");

    try {
      const result = await submitPurchasedReview(
        orderId,
        item.productId,
        reviewDraft,
      );

      setMessage(
        result.message || "Đã gửi đánh giá sản phẩm.",
      );
      closeReview();
      await loadDetail({ showLoading: false });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="gx-account-state">
        Đang tải chi tiết đơn hàng...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="gx-account-state is-error">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => navigate("/account/orders")}
        >
          Quay lại danh sách đơn
        </button>
      </div>
    );
  }

  const order = data?.order || {};
  const items = data?.items || [];
  const history = data?.statusHistory || [];
  const canReviewOrder =
    String(order.statusCode || "").toUpperCase() ===
    "DELIVERED";

  return (
    <div>
      <header className="gx-account-heading gx-account-order-detail-heading">
        <div>
          <span>ORDER DETAIL</span>
          <h1>{order.code}</h1>
          <p>Đặt lúc {formatDate(order.createdAt)}</p>
        </div>

        <div className="gx-account-detail-actions">
          <Link to="/account/orders">
            Quay lại
          </Link>

          {order.canCancel && (
            <button
              type="button"
              className="is-danger"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling
                ? "Đang hủy..."
                : "Hủy đơn hàng"}
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="gx-account-alert is-error">
          {error}
        </div>
      )}

      {message && (
        <div className="gx-account-alert is-success">
          {message}
        </div>
      )}

      <section className="gx-account-detail-summary">
        <article>
          <span>Trạng thái đơn</span>
          <strong>{order.statusName}</strong>
        </article>
        <article>
          <span>Thanh toán</span>
          <strong>
            {order.paymentStatusName || "Chưa có"}
          </strong>
        </article>
        <article>
          <span>Phương thức</span>
          <strong>
            {order.paymentMethodName || "Chưa chọn"}
          </strong>
        </article>
        <article>
          <span>Tổng tiền</span>
          <strong>
            {formatVnd(order.totalAmount)}
          </strong>
        </article>
      </section>

      <section className="gx-account-panel">
        <header>
          <div>
            <span>SẢN PHẨM</span>
            <h2>Chi tiết sản phẩm đã mua</h2>
          </div>
        </header>

        <div className="gx-account-detail-items">
          {items.map((item) => (
            <div
              className="gx-account-detail-item-block"
              key={`${item.productId}-${item.variantId || 0}`}
            >
              <article>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                  />
                ) : (
                  <div className="gx-account-image-placeholder">
                    <FontAwesomeIcon
                      icon={["fas", "image"]}
                    />
                  </div>
                )}

                <div className="gx-account-detail-item-copy">
                  <Link
                    to={`/products/${item.productSlug}`}
                  >
                    {item.productName}
                  </Link>
                  <span>
                    {item.variantName ||
                      "Phiên bản mặc định"}
                  </span>
                  <small>
                    Số lượng: {item.quantity}
                  </small>

                  {canReviewOrder && (
                    <div className="gx-account-review-action">
                      {item.hasReviewed ? (
                        <span className="is-reviewed">
                          <FontAwesomeIcon
                            icon={["fas", "check-circle"]}
                          />
                          Đã gửi đánh giá
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            openReview(item.productId)
                          }
                        >
                          <FontAwesomeIcon
                            icon={["fas", "star"]}
                          />
                          Đánh giá sản phẩm
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="gx-account-detail-item-price">
                  <span>
                    {formatVnd(item.unitPrice)} × {item.quantity}
                  </span>
                  <strong>
                    {formatVnd(item.lineTotal)}
                  </strong>
                </div>
              </article>

              {reviewingProductId === item.productId &&
                !item.hasReviewed && (
                  <form
                    className="gx-account-review-form"
                    onSubmit={(event) =>
                      handleReviewSubmit(event, item)
                    }
                  >
                    <div className="gx-account-review-form__heading">
                      <div>
                        <strong>
                          Đánh giá {item.productName}
                        </strong>
                        <span>
                          Đánh giá sẽ ở trạng thái chờ kiểm duyệt.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={closeReview}
                        aria-label="Đóng biểu mẫu đánh giá"
                      >
                        ×
                      </button>
                    </div>

                    <div className="gx-account-review-form__grid">
                      <label>
                        <span>Số sao</span>
                        <select
                          name="rating"
                          value={reviewDraft.rating}
                          onChange={updateReviewField}
                        >
                          <option value="5">5 sao</option>
                          <option value="4">4 sao</option>
                          <option value="3">3 sao</option>
                          <option value="2">2 sao</option>
                          <option value="1">1 sao</option>
                        </select>
                      </label>

                      <label>
                        <span>Tiêu đề</span>
                        <input
                          name="title"
                          value={reviewDraft.title}
                          onChange={updateReviewField}
                          maxLength="255"
                          placeholder="Ví dụ: Sản phẩm tốt"
                        />
                      </label>
                    </div>

                    <label>
                      <span>Nội dung đánh giá</span>
                      <textarea
                        name="content"
                        value={reviewDraft.content}
                        onChange={updateReviewField}
                        minLength="5"
                        maxLength="2000"
                        rows="4"
                        required
                        placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm..."
                      />
                    </label>

                    <div className="gx-account-review-form__actions">
                      <button
                        type="button"
                        onClick={closeReview}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="is-primary"
                        disabled={reviewSubmitting}
                      >
                        {reviewSubmitting
                          ? "Đang gửi..."
                          : "Gửi đánh giá"}
                      </button>
                    </div>
                  </form>
                )}
            </div>
          ))}
        </div>
      </section>

      <div className="gx-account-detail-grid">
        <section className="gx-account-panel">
          <header>
            <div>
              <span>GIAO HÀNG</span>
              <h2>Địa chỉ nhận hàng</h2>
            </div>
          </header>

          <div className="gx-account-address">
            <strong>{order.receiverName || "—"}</strong>
            <span>{order.receiverPhone || "—"}</span>
            <p>
              {[
                order.street,
                order.ward,
                order.district,
                order.province,
              ]
                .filter(Boolean)
                .join(", ") || "Chưa có địa chỉ"}
            </p>
          </div>
        </section>

        <section className="gx-account-panel">
          <header>
            <div>
              <span>PAYMENT</span>
              <h2>Thông tin thanh toán</h2>
            </div>
          </header>

          <dl className="gx-account-payment-info">
            <div>
              <dt>Mã thanh toán</dt>
              <dd>{order.paymentCode || "—"}</dd>
            </div>
            <div>
              <dt>Mã giao dịch</dt>
              <dd>{order.transactionCode || "—"}</dd>
            </div>
            <div>
              <dt>Ngày thanh toán</dt>
              <dd>{formatDate(order.paidAt)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="gx-account-panel">
        <header>
          <div>
            <span>ORDER TIMELINE</span>
            <h2>Lịch sử trạng thái</h2>
          </div>
        </header>

        {history.length === 0 ? (
          <div className="gx-account-state">
            Chưa có lịch sử trạng thái.
          </div>
        ) : (
          <div className="gx-account-timeline">
            {history.map((entry) => (
              <article key={entry.id}>
                <span />
                <div>
                  <strong>
                    {entry.newStatusName}
                  </strong>
                  <p>
                    {entry.note ||
                      "Cập nhật trạng thái đơn hàng"}
                  </p>
                  <small>
                    {formatDate(entry.changedAt)}
                    {entry.changedBy
                      ? ` · ${entry.changedBy}`
                      : ""}
                  </small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default OrderDetailPage;
