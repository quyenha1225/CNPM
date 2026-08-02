import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";

import ScrollToTopOnMount from "../template/ScrollToTopOnMount";
import { useCart } from "../context/CartContext";
import { toast } from "../utils/Toast";
import fallbackImage from "../nillkin-case-1.jpg";
import "./cart.css";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function formatSelectedOptions(options = {}) {
  const labels = {
    cpu_option: "CPU",
    cpu: "CPU",
    ram_size: "RAM",
    ram: "RAM",
    storage_size: "Ổ cứng",
    storage: "Ổ cứng",
    gpu_option: "GPU",
    gpu: "GPU",
    color: "Màu",
  };

  return Object.entries(options)
    .filter(([, value]) => value)
    .map(([key, value]) => `${labels[key] || key}: ${value}`);
}

function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const rows = useMemo(
    () =>
      cartItems.map((item) => ({
        ...item,
        image: item.image || item.image_url || fallbackImage,
        price: Number(item.price || 0),
        lineTotal: Number(item.price || 0) * item.quantity,
        optionLabels: formatSelectedOptions(item.selectedOptions),
      })),
    [cartItems],
  );

  const subtotal = rows.reduce((total, item) => total + item.lineTotal, 0);
  const totalItems = rows.reduce((total, item) => total + item.quantity, 0);

  function removeItem(item) {
    if (!window.confirm(`Xóa “${item.name}” khỏi giỏ hàng?`)) return;
    removeFromCart(item.lineKey);
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng", 1800);
  }

  function removeAllItems() {
    if (!window.confirm("Xóa toàn bộ sản phẩm trong giỏ hàng?")) return;
    clearCart();
    toast.success("Đã làm trống giỏ hàng", 1800);
  }

  function goToPayment() {
    if (!rows.length) return;
    navigate("/payment");
  }

  return (
    <main className="gx-cart-page">
      <ScrollToTopOnMount />

      <div className="gx-cart-container">
        <header className="gx-cart-header">
          <div>
            <span className="gx-cart-eyebrow">GIỎ HÀNG CỦA BẠN</span>
            <h1>Kiểm tra sản phẩm trước khi thanh toán</h1>
            <p>
              Điều chỉnh số lượng, xóa sản phẩm không cần thiết hoặc quay lại chọn
              thêm sản phẩm.
            </p>
          </div>

          <Link to="/products" className="gx-cart-continue">
            <FontAwesomeIcon icon={["fas", "arrow-left"]} />
            Tiếp tục mua sắm
          </Link>
        </header>

        {!rows.length ? (
          <section className="gx-cart-empty">
            <div className="gx-cart-empty__icon">
              <FontAwesomeIcon icon={["fas", "shopping-cart"]} />
            </div>
            <h2>Giỏ hàng đang trống</h2>
            <p>Hãy chọn sản phẩm phù hợp để bắt đầu đơn hàng của bạn.</p>
            <Link to="/products">Khám phá sản phẩm</Link>
          </section>
        ) : (
          <div className="gx-cart-layout">
            <section className="gx-cart-list" aria-label="Sản phẩm trong giỏ">
              <div className="gx-cart-list__head">
                <div>
                  <strong>{totalItems} sản phẩm</strong>
                  <span>{rows.length} cấu hình trong giỏ</span>
                </div>

                <button type="button" onClick={removeAllItems}>
                  <FontAwesomeIcon icon={["fas", "trash-alt"]} />
                  Xóa toàn bộ
                </button>
              </div>

              {rows.map((item) => (
                <article className="gx-cart-item" key={item.lineKey}>
                  <Link
                    to={`/products/${item.id}`}
                    className="gx-cart-item__media"
                  >
                    <img src={item.image} alt={item.name} />
                  </Link>

                  <div className="gx-cart-item__content">
                    <div className="gx-cart-item__meta">
                      <span>{item.brand || "Gearxin"}</span>
                      {item.stock > 0 && <small>Còn {item.stock} sản phẩm</small>}
                    </div>

                    <h2>
                      <Link to={`/products/${item.id}`}>{item.name}</Link>
                    </h2>

                    {item.variantName && item.variantName !== "Mặc định" && (
                      <p className="gx-cart-item__variant">{item.variantName}</p>
                    )}

                    {item.optionLabels.length > 0 && (
                      <div className="gx-cart-item__options">
                        {item.optionLabels.map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </div>
                    )}

                    <strong className="gx-cart-item__price">
                      {formatCurrency(item.price)}
                    </strong>
                  </div>

                  <div className="gx-cart-item__actions">
                    <div className="gx-cart-quantity" aria-label="Số lượng">
                      <button
                        type="button"
                        aria-label={`Giảm số lượng ${item.name}`}
                        onClick={() =>
                          updateQuantity(item.lineKey, item.quantity - 1)
                        }
                      >
                        <FontAwesomeIcon icon={["fas", "minus"]} />
                      </button>

                      <input
                        type="number"
                        min="1"
                        max={item.stock > 0 ? item.stock : undefined}
                        value={item.quantity}
                        aria-label={`Số lượng ${item.name}`}
                        onChange={(event) =>
                          updateQuantity(item.lineKey, event.target.value)
                        }
                      />

                      <button
                        type="button"
                        aria-label={`Tăng số lượng ${item.name}`}
                        disabled={item.stock > 0 && item.quantity >= item.stock}
                        onClick={() =>
                          updateQuantity(item.lineKey, item.quantity + 1)
                        }
                      >
                        <FontAwesomeIcon icon={["fas", "plus"]} />
                      </button>
                    </div>

                    <div className="gx-cart-item__total">
                      <small>Thành tiền</small>
                      <strong>{formatCurrency(item.lineTotal)}</strong>
                    </div>

                    <button
                      type="button"
                      className="gx-cart-item__remove"
                      onClick={() => removeItem(item)}
                    >
                      <FontAwesomeIcon icon={["fas", "trash-alt"]} />
                      Xóa sản phẩm
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="gx-cart-summary">
              <span className="gx-cart-summary__eyebrow">TÓM TẮT ĐƠN HÀNG</span>
              <h2>Thanh toán an toàn</h2>

              <div className="gx-cart-summary__row">
                <span>Số lượng</span>
                <strong>{totalItems}</strong>
              </div>

              <div className="gx-cart-summary__row">
                <span>Tạm tính</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              <div className="gx-cart-summary__row">
                <span>Phí vận chuyển</span>
                <strong>Miễn phí</strong>
              </div>

              <div className="gx-cart-summary__total">
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              <button type="button" onClick={goToPayment}>
                Tiến hành thanh toán
                <FontAwesomeIcon icon={["fas", "arrow-right"]} />
              </button>

              <p>
                <FontAwesomeIcon icon={["fas", "shield-alt"]} />
                Thông tin thanh toán được bảo vệ và chỉ dùng để xử lý đơn hàng.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
