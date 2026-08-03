import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";

import ScrollToTopOnMount from "../template/ScrollToTopOnMount";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "../utils/Toast";
import "./Payment.css";

const API_BASE = (
  process.env.REACT_APP_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function getUserValue(user, ...keys) {
  for (const key of keys) {
    if (user?.[key]) return user[key];
  }
  return "";
}

function Payment() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated, sessionLoading } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("qr"); // 'qr' hoặc 'cod'
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showQrModal, setShowQrModal] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);

  const [shipping, setShipping] = useState({
    receiverName: "",
    receiverPhone: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: "/payment" } });
    }
  }, [isAuthenticated, navigate, sessionLoading]);

  useEffect(() => {
    if (!user) return;
    setShipping((current) => ({
      ...current,
      receiverName:
        current.receiverName ||
        getUserValue(user, "name", "user_full_name", "fullName"),
      receiverPhone:
        current.receiverPhone || getUserValue(user, "phone", "user_phone"),
    }));
  }, [user]);

  const total = getTotalPrice();
  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  function updateShipping(field, value) {
    setShipping((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function validateCheckout() {
    if (shipping.receiverName.trim().length < 2)
      return "Vui lòng nhập họ tên người nhận";
    if (!/^(0|\+84)[0-9]{9,10}$/.test(shipping.receiverPhone.trim()))
      return "Số điện thoại người nhận không hợp lệ";
    if (shipping.address.trim().length < 8)
      return "Vui lòng nhập địa chỉ nhận hàng đầy đủ";
    if (!cartItems.length) return "Giỏ hàng đang trống";
    return "";
  }

  async function createPayment() {
    const validationMessage = validateCheckout();
    if (validationMessage) return setError(validationMessage);

    setLoading(true);
    setError("");

    try {
      setFinalTotal(total);

      const response = await fetch(`${API_BASE}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.user_id,
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          totalAmount: total,
          paymentMethod, // Gửi 'qr' hoặc 'cod' lên backend
          shippingAddress: shipping,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Không thể tạo đơn thanh toán");

      setOrderData(data);

      // NẾU LÀ COD: Bỏ qua QR, chuyển thẳng sang màn hình hoàn tất (Chờ xử lý)
      if (paymentMethod === "cod") {
        setIsPaidSuccess(true);
        clearCart();
        toast.success("Đặt hàng thành công! Đơn hàng đang chờ xử lý.", 3000);
      } else {
        // NẾU LÀ QR: Bật popup quét mã
        setShowQrModal(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Polling cho VietQR
  useEffect(() => {
    if (
      !orderData ||
      !orderData.order_code ||
      isPaidSuccess ||
      !showQrModal ||
      paymentMethod !== "qr"
    )
      return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE}/payment/${orderData.order_code}/status`,
        );
        const result = await response.json();

        if (result.paid) {
          clearInterval(interval);
          handlePaymentSuccess();
        }
      } catch (e) {
        console.error("Lỗi khi check trạng thái:", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderData, isPaidSuccess, showQrModal, paymentMethod]);

  async function manualCheckPayment() {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/payment/${orderData.order_code}/status`,
      );
      const result = await response.json();
      if (result.paid) {
        handlePaymentSuccess();
      } else {
        toast.warning(
          "Hệ thống chưa nhận được khoản thanh toán. Vui lòng đợi trong giây lát!",
          3000,
        );
      }
    } catch (e) {
      setError("Có lỗi xảy ra khi kiểm tra");
    } finally {
      setLoading(false);
    }
  }

  function handlePaymentSuccess() {
    setShowQrModal(false);
    setIsPaidSuccess(true);
    clearCart();
    toast.success("Thanh toán thành công!", 3000);
  }

  const vietQrUrl = orderData
    ? `https://img.vietqr.io/image/vietinbank-101886339075-compact2.png?amount=${total}&addInfo=SEVQR ${orderData.order_code}&accountName=GearxinStore`
    : "";

  if (sessionLoading)
    return (
      <div className="gx-payment-loading">Đang kiểm tra phiên đăng nhập...</div>
    );

  if (!cartItems.length && !isPaidSuccess) {
    return (
      <main className="gx-payment-page">
        <ScrollToTopOnMount />
        <div className="gx-payment-empty">
          <h1>Giỏ hàng đang trống</h1>
          <p>Hãy thêm sản phẩm trước khi tiến hành thanh toán.</p>
          <Link to="/products">Quay lại mua sắm</Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // GIAO DIỆN: MÀN HÌNH HOÀN TẤT ĐƠN HÀNG
  // ==========================================
  if (isPaidSuccess) {
    const isCod = paymentMethod === "cod";
    return (
      <main
        className="gx-payment-page"
        style={{ minHeight: "80vh", display: "flex", alignItems: "center" }}
      >
        <ScrollToTopOnMount />
        <div
          style={{
            maxWidth: "650px",
            margin: "0 auto",
            textAlign: "center",
            padding: "3rem 2rem",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "4.5rem",
              color: isCod ? "#ffc107" : "#28a745",
              marginBottom: "1rem",
            }}
          >
            <FontAwesomeIcon icon={["fas", isCod ? "clock" : "check-circle"]} />
          </div>
          <h1
            style={{
              color: isCod ? "#d39e00" : "#28a745",
              fontSize: "2rem",
              marginBottom: "0.5rem",
            }}
          >
            {isCod
              ? "Đặt hàng thành công (Chờ xử lý)!"
              : "Thanh toán thành công!"}
          </h1>
          <p
            style={{ fontSize: "1.1rem", color: "#666", marginBottom: "2rem" }}
          >
            {isCod
              ? "Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý. Bạn sẽ thanh toán khi nhận hàng."
              : "Cảm ơn bạn đã mua sắm tại Gearxin. Đơn hàng của bạn đã được xác nhận và đang chờ giao."}
          </p>

          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "left",
              border: "1px solid #e9ecef",
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                borderBottom: "1px solid #dee2e6",
                paddingBottom: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              Thông tin đơn hàng
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "0.8rem",
                fontSize: "0.95rem",
              }}
            >
              <span style={{ color: "#6c757d" }}>Mã đơn hàng:</span>
              <strong style={{ color: "#0b5b9e" }}>
                {orderData?.order_code}
              </strong>

              <span style={{ color: "#6c757d" }}>Người nhận:</span>
              <strong>
                {shipping.receiverName} - {shipping.receiverPhone}
              </strong>

              <span style={{ color: "#6c757d" }}>Địa chỉ giao:</span>
              <strong>{shipping.address}</strong>

              <span style={{ color: "#6c757d" }}>Phương thức:</span>
              <strong>
                {isCod
                  ? "Thanh toán khi nhận hàng (COD)"
                  : "Chuyển khoản VietQR"}
              </strong>

              <span
                style={{
                  color: "#6c757d",
                  paddingTop: "0.5rem",
                  borderTop: "1px dashed #dee2e6",
                }}
              >
                Tổng tiền:
              </span>
              <strong
                style={{
                  fontSize: "1.2rem",
                  color: "#d32f2f",
                  paddingTop: "0.5rem",
                  borderTop: "1px dashed #dee2e6",
                }}
              >
                {formatCurrency(finalTotal)}
              </strong>
            </div>
          </div>

          <div style={{ marginTop: "2.5rem" }}>
            <Link
              to="/products"
              className="gx3-button gx3-button--primary"
              style={{
                padding: "0.8rem 2.5rem",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // GIAO DIỆN: CHECKOUT & CHỌN PHƯƠNG THỨC
  // ==========================================
  return (
    <main className="gx-payment-page">
      <ScrollToTopOnMount />

      {showQrModal && orderData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "420px",
              position: "relative",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              textAlign: "center",
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <button
              onClick={() => setShowQrModal(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                color: "#888",
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={["fas", "times"]} />
            </button>

            <h2
              style={{ fontSize: "1.5rem", color: "#333", marginBottom: "5px" }}
            >
              Quét mã thanh toán
            </h2>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>
              Đơn hàng:{" "}
              <strong style={{ color: "#0b5b9e" }}>
                {orderData.order_code}
              </strong>
            </p>

            <div
              style={{
                background: "#fff",
                padding: "10px",
                borderRadius: "12px",
                border: "1px solid #eaeaea",
                display: "inline-block",
              }}
            >
              <img
                src={vietQrUrl}
                alt="VietQR"
                style={{ width: "220px", display: "block" }}
              />
            </div>

            <div
              style={{
                background: "#f8f9fa",
                padding: "1rem",
                borderRadius: "12px",
                textAlign: "left",
                fontSize: "0.95rem",
                margin: "1.5rem 0",
                border: "1px solid #e9ecef",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#6c757d" }}>Ngân hàng:</span>
                <strong>VietinBank</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#6c757d" }}>Chủ tài khoản:</span>
                <strong>GEARXINSTORE</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#6c757d" }}>Số tài khoản:</span>
                <strong>101886339075</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#6c757d" }}>Nội dung:</span>
                <strong>SEVQR {orderData.order_code}</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px dashed #dee2e6",
                  paddingTop: "8px",
                  marginTop: "8px",
                }}
              >
                <span style={{ color: "#6c757d" }}>Số tiền:</span>
                <strong style={{ color: "#d32f2f", fontSize: "1.1rem" }}>
                  {formatCurrency(total)}
                </strong>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                color: "#0b5b9e",
                fontWeight: "500",
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
              }}
            >
              <FontAwesomeIcon icon={["fas", "spinner"]} spin />
              <span>Hệ thống đang chờ giao dịch...</span>
            </div>

            <button
              type="button"
              onClick={manualCheckPayment}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.9rem",
                background: "#0b5b9e",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              {loading ? "Đang kiểm tra..." : "Tôi đã chuyển khoản xong"}
            </button>
          </div>
        </div>
      )}

      <div className="gx-payment-container">
        <header className="gx-payment-header">
          <div>
            <span>THANH TOÁN AN TOÀN</span>
            <h1>Thông tin giao hàng</h1>
          </div>
          <Link to="/cart">
            <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Chỉnh sửa giỏ hàng
          </Link>
        </header>

        {error && (
          <div className="gx-payment-error" role="alert">
            <FontAwesomeIcon icon={["fas", "exclamation-circle"]} /> {error}
          </div>
        )}

        <div className="gx-payment-layout">
          <div className="gx-payment-main">
            <section className="gx-payment-card">
              <div className="gx-payment-card__head">
                <span>01</span>
                <div>
                  <h2>Địa chỉ nhận hàng</h2>
                </div>
              </div>
              <div className="gx-payment-form-grid">
                <label>
                  <span>Họ tên *</span>
                  <input
                    value={shipping.receiverName}
                    onChange={(e) =>
                      updateShipping("receiverName", e.target.value)
                    }
                  />
                </label>
                <label>
                  <span>Số điện thoại *</span>
                  <input
                    value={shipping.receiverPhone}
                    onChange={(e) =>
                      updateShipping("receiverPhone", e.target.value)
                    }
                  />
                </label>
                <label className="gx-payment-form-grid__wide">
                  <span>Địa chỉ *</span>
                  <textarea
                    value={shipping.address}
                    onChange={(e) => updateShipping("address", e.target.value)}
                    rows={2}
                  />
                </label>
                <label className="gx-payment-form-grid__wide">
                  <span>Ghi chú</span>
                  <textarea
                    value={shipping.note}
                    onChange={(e) => updateShipping("note", e.target.value)}
                    rows={2}
                  />
                </label>
              </div>
            </section>

            <section className="gx-payment-card">
              <div className="gx-payment-card__head">
                <span>02</span>
                <div>
                  <h2>Phương thức thanh toán</h2>
                </div>
              </div>
              <div
                className="gx-payment-methods"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  className={paymentMethod === "qr" ? "is-active" : ""}
                  onClick={() => setPaymentMethod("qr")}
                  style={{
                    border:
                      paymentMethod === "qr"
                        ? "2px solid #0b5b9e"
                        : "1px solid #ddd",
                    padding: "15px",
                    borderRadius: "8px",
                    background: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <FontAwesomeIcon icon={["fas", "qrcode"]} size="lg" />
                  <span>
                    <strong style={{ display: "block" }}>
                      Thanh toán VietQR
                    </strong>
                    <small style={{ color: "#666" }}>
                      Quét mã xác nhận tự động
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  className={paymentMethod === "cod" ? "is-active" : ""}
                  onClick={() => setPaymentMethod("cod")}
                  style={{
                    border:
                      paymentMethod === "cod"
                        ? "2px solid #0b5b9e"
                        : "1px solid #ddd",
                    padding: "15px",
                    borderRadius: "8px",
                    background: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <FontAwesomeIcon icon={["fas", "truck"]} size="lg" />
                  <span>
                    <strong style={{ display: "block" }}>
                      Thanh toán khi nhận hàng
                    </strong>
                    <small style={{ color: "#666" }}>
                      Thanh toán tiền mặt (COD)
                    </small>
                  </span>
                </button>
              </div>
            </section>
          </div>

          <aside className="gx-payment-summary">
            <span>ĐƠN HÀNG CỦA BẠN</span>
            <h2>{totalItems} sản phẩm</h2>
            <div className="gx-payment-products">
              {cartItems.map((item) => (
                <article key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {item.quantity} × {formatCurrency(item.price)}
                    </span>
                  </div>
                  <b>{formatCurrency(item.price * item.quantity)}</b>
                </article>
              ))}
            </div>

            <div className="gx-payment-summary__total">
              <span>Tổng thanh toán</span>
              <strong>{formatCurrency(total)}</strong>
            </div>

            <button type="button" onClick={createPayment} disabled={loading}>
              {loading
                ? "Đang xử lý..."
                : paymentMethod === "cod"
                  ? "Đặt hàng ngay"
                  : "Xác nhận & Thanh toán"}
              <FontAwesomeIcon
                icon={["fas", "arrow-right"]}
                style={{ marginLeft: "8px" }}
              />
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Payment;
