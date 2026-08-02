import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import QRCode from "qrcode";

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
  const canvasRef = useRef(null);
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated, sessionLoading } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("qr");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shipping, setShipping] = useState({
    receiverName: "",
    receiverPhone: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: { from: "/payment" },
      });
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
        current.receiverPhone ||
        getUserValue(user, "phone", "user_phone"),
    }));
  }, [user]);

  const total = getTotalPrice();
  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  useEffect(() => {
    if (!orderData || !canvasRef.current || paymentMethod !== "qr") return;

    const qrContent =
      orderData.qrContent ||
      orderData.qr_content ||
      JSON.stringify({
        orderId: orderData.orderId ?? orderData.order_id,
        amount: total,
        customer: shipping.receiverName,
      });

    QRCode.toCanvas(canvasRef.current, qrContent, {
      errorCorrectionLevel: "H",
      width: 230,
      margin: 1,
      color: {
        dark: "#071426",
        light: "#ffffff",
      },
    }).catch(() => {
      setError("Không thể tạo mã QR thanh toán");
    });
  }, [orderData, paymentMethod, shipping.receiverName, total]);

  function updateShipping(field, value) {
    setShipping((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  }

  function validateCheckout() {
    if (shipping.receiverName.trim().length < 2) {
      return "Vui lòng nhập họ tên người nhận";
    }

    if (!/^(0|\+84)[0-9]{9,10}$/.test(shipping.receiverPhone.trim())) {
      return "Số điện thoại người nhận không hợp lệ";
    }

    if (shipping.address.trim().length < 8) {
      return "Vui lòng nhập địa chỉ nhận hàng đầy đủ";
    }

    if (!cartItems.length) {
      return "Giỏ hàng đang trống";
    }

    return "";
  }

  async function createPayment() {
    const validationMessage = validateCheckout();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/payment`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.id,
            variantId: item.variantId ?? null,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          totalAmount: total,
          paymentMethod,
          shippingAddress: {
            receiverName: shipping.receiverName.trim(),
            receiverPhone: shipping.receiverPhone.trim(),
            address: shipping.address.trim(),
            note: shipping.note.trim(),
          },
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Không thể tạo đơn thanh toán",
        );
      }

      setOrderData(data);
      toast.success("Đã tạo đơn hàng. Vui lòng hoàn tất thanh toán", 2400);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmPayment() {
    const orderId = orderData?.orderId ?? orderData?.order_id;

    if (!orderId) {
      setError("Không tìm thấy mã đơn hàng");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/payment/${orderId}/confirm`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Không thể xác nhận thanh toán",
        );
      }

      clearCart();
      toast.success("Thanh toán thành công", 2500);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadQr() {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = `gearxin-payment-${
      orderData?.orderId ?? orderData?.order_id ?? "qr"
    }.png`;
    link.click();
  }

  if (sessionLoading) {
    return <div className="gx-payment-loading">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!cartItems.length) {
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

  return (
    <main className="gx-payment-page">
      <ScrollToTopOnMount />

      <div className="gx-payment-container">
        <header className="gx-payment-header">
          <div>
            <span>THANH TOÁN AN TOÀN</span>
            <h1>Hoàn tất đơn hàng của bạn</h1>
            <p>Kiểm tra thông tin giao hàng và lựa chọn phương thức thanh toán.</p>
          </div>

          <Link to="/cart">
            <FontAwesomeIcon icon={["fas", "arrow-left"]} />
            Chỉnh sửa giỏ hàng
          </Link>
        </header>

        {error && (
          <div className="gx-payment-error" role="alert">
            <FontAwesomeIcon icon={["fas", "exclamation-circle"]} />
            {error}
          </div>
        )}

        <div className="gx-payment-layout">
          <div className="gx-payment-main">
            <section className="gx-payment-card">
              <div className="gx-payment-card__head">
                <span>01</span>
                <div>
                  <h2>Thông tin nhận hàng</h2>
                  <p>Thông tin này được dùng để giao và xác nhận đơn hàng.</p>
                </div>
              </div>

              <div className="gx-payment-form-grid">
                <label>
                  <span>Họ tên người nhận *</span>
                  <input
                    value={shipping.receiverName}
                    onChange={(event) =>
                      updateShipping("receiverName", event.target.value)
                    }
                    placeholder="Nhập họ tên"
                    maxLength={100}
                  />
                </label>

                <label>
                  <span>Số điện thoại *</span>
                  <input
                    value={shipping.receiverPhone}
                    onChange={(event) =>
                      updateShipping("receiverPhone", event.target.value)
                    }
                    placeholder="Ví dụ: 0912345678"
                    maxLength={12}
                  />
                </label>

                <label className="gx-payment-form-grid__wide">
                  <span>Địa chỉ nhận hàng *</span>
                  <textarea
                    value={shipping.address}
                    onChange={(event) => updateShipping("address", event.target.value)}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    rows={3}
                    maxLength={500}
                  />
                </label>

                <label className="gx-payment-form-grid__wide">
                  <span>Ghi chú</span>
                  <textarea
                    value={shipping.note}
                    onChange={(event) => updateShipping("note", event.target.value)}
                    placeholder="Thời gian giao hàng hoặc lưu ý cho nhân viên"
                    rows={2}
                    maxLength={500}
                  />
                </label>
              </div>
            </section>

            <section className="gx-payment-card">
              <div className="gx-payment-card__head">
                <span>02</span>
                <div>
                  <h2>Phương thức thanh toán</h2>
                  <p>Chọn phương thức phù hợp với bạn.</p>
                </div>
              </div>

              <div className="gx-payment-methods">
                <button
                  type="button"
                  className={paymentMethod === "qr" ? "is-active" : ""}
                  onClick={() => {
                    setPaymentMethod("qr");
                    setOrderData(null);
                  }}
                >
                  <FontAwesomeIcon icon={["fas", "qrcode"]} />
                  <span>
                    <strong>Thanh toán QR</strong>
                    <small>Quét mã bằng ứng dụng ngân hàng</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={paymentMethod === "bank" ? "is-active" : ""}
                  onClick={() => {
                    setPaymentMethod("bank");
                    setOrderData(null);
                  }}
                >
                  <FontAwesomeIcon icon={["fas", "university"]} />
                  <span>
                    <strong>Chuyển khoản ngân hàng</strong>
                    <small>Nhận nội dung chuyển khoản theo đơn</small>
                  </span>
                </button>
              </div>
            </section>

            {orderData && (
              <section className="gx-payment-card gx-payment-confirmation">
                <div className="gx-payment-card__head">
                  <span>03</span>
                  <div>
                    <h2>Hoàn tất thanh toán</h2>
                    <p>
                      Mã đơn hàng: {orderData.orderId ?? orderData.order_id ?? "—"}
                    </p>
                  </div>
                </div>

                {paymentMethod === "qr" ? (
                  <div className="gx-payment-qr">
                    <div>
                      <canvas ref={canvasRef} />
                    </div>
                    <p>Quét mã QR và kiểm tra đúng số tiền trước khi xác nhận.</p>
                    <button type="button" onClick={downloadQr}>
                      Tải mã QR
                    </button>
                  </div>
                ) : (
                  <div className="gx-payment-bank">
                    <p>
                      Nội dung chuyển khoản: <strong>{orderData.transferContent || `GEARXIN-${orderData.orderId ?? orderData.order_id}`}</strong>
                    </p>
                    <p>
                      Số tiền: <strong>{formatCurrency(total)}</strong>
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  className="gx-payment-confirm-button"
                  onClick={confirmPayment}
                  disabled={loading}
                >
                  {loading ? "Đang xác nhận..." : "Tôi đã hoàn tất thanh toán"}
                </button>
              </section>
            )}
          </div>

          <aside className="gx-payment-summary">
            <span>ĐƠN HÀNG CỦA BẠN</span>
            <h2>{totalItems} sản phẩm</h2>

            <div className="gx-payment-products">
              {cartItems.map((item) => (
                <article key={item.lineKey || `${item.id}:${item.variantId || "default"}`}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    {item.variantName && item.variantName !== "Mặc định" && (
                      <small>{item.variantName}</small>
                    )}
                    <span>
                      {item.quantity} × {formatCurrency(item.price)}
                    </span>
                  </div>
                  <b>{formatCurrency(item.price * item.quantity)}</b>
                </article>
              ))}
            </div>

            <div className="gx-payment-summary__row">
              <span>Tạm tính</span>
              <strong>{formatCurrency(total)}</strong>
            </div>

            <div className="gx-payment-summary__row">
              <span>Vận chuyển</span>
              <strong>Miễn phí</strong>
            </div>

            <div className="gx-payment-summary__total">
              <span>Tổng thanh toán</span>
              <strong>{formatCurrency(total)}</strong>
            </div>

            {!orderData && (
              <button type="button" onClick={createPayment} disabled={loading}>
                {loading ? "Đang tạo đơn..." : "Tạo đơn và thanh toán"}
                <FontAwesomeIcon icon={["fas", "arrow-right"]} />
              </button>
            )}

            <p>
              <FontAwesomeIcon icon={["fas", "lock"]} />
              Không xóa giỏ hàng cho đến khi thanh toán được xác nhận thành công.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Payment;
