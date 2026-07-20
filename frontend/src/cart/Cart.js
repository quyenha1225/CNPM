import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ScrollToTopOnMount from "../template/ScrollToTopOnMount";
import { useCart } from "../context/CartContext";
import fallbackImage from "../nillkin-case-1.jpg";
import "./cart.css";

const priceFormatter = new Intl.NumberFormat("vi-VN");

function formatCurrency(value) {
  return `${priceFormatter.format(Math.round(value))} đ`;
}

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [orderStatus, setOrderStatus] = useState("");

  const cartRows = useMemo(() => {
    return cartItems
      .map((item) => {
        const salePrice = Number(item.price) || 0;
        const originalPrice = Number(item.originalPrice) || salePrice;
        const product = {
          id: item.id,
          name: item.name || "Sản phẩm",
          brand: item.brand || "",
          category: item.category || "",
          image: item.image || item.image_url || fallbackImage,
        };

        return {
          ...item,
          product,
          salePrice,
          lineTotal: salePrice * item.quantity,
          originalTotal: originalPrice * item.quantity,
        };
      })
      .filter(Boolean);
  }, [cartItems]);

  const subtotal = cartRows.reduce((total, item) => total + item.lineTotal, 0);
  const originalTotal = cartRows.reduce((total, item) => total + item.originalTotal, 0);
  const savedTotal = Math.max(0, originalTotal - subtotal);

  // --- HÀM CHECKOUT LƯU ĐẦY ĐỦ THÔNG TIN SẢN PHẨM VÀO LOCALSTORAGE FOR ADMIN ---
  function checkout() {
    if (cartRows.length === 0) return;

    // 1. Lấy thông tin người dùng đang đăng nhập
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    // 2. Tạo ID ngẫu nhiên (dạng số)
    const newOrderId = Math.floor(10025 + Math.random() * 90000);

    // 3. Đóng gói đơn hàng + chi tiết danh sách sản phẩm (items)
    const newOrder = {
      order_id: newOrderId,
      customer_name: currentUser.name || currentUser.fullName || "Khách hàng mới",
      phone: currentUser.phone || "0987654321",
      total_price: subtotal,
      status: "PENDING", // Chuẩn Enum: PENDING
      created_at: new Date().toISOString().split("T")[0],
      // LƯU CHI TIẾT SẢN PHẨM ĐỂ ADMIN XEM
      items: cartRows.map((r) => ({
        id: r.product.id,
        name: r.product.name,
        price: r.salePrice,
        quantity: r.quantity,
        image: r.product.image
      })),
    };

    // 4. Lấy danh sách đơn hàng Admin hiện tại từ key 'admin_orders_data'
    const existingOrders = JSON.parse(localStorage.getItem("admin_orders_data") || "[]");

    // 5. Thêm đơn hàng mới vào ĐẦU danh sách
    const updatedOrders = [newOrder, ...existingOrders];

    // 6. Ghi đè lại vào LocalStorage với key 'admin_orders_data'
    localStorage.setItem("admin_orders_data", JSON.stringify(updatedOrders));

    // 7. Clear giỏ hàng & báo thành công
    clearCart();
    setOrderStatus("Đã tiếp nhận đơn hàng. Gearxin sẽ liên hệ xác nhận trong ít phút.");
  }

  return (
    <div className="cart-page">
      <ScrollToTopOnMount />

      <div className="container">
        <div className="cart-heading">
          <div>
            <span className="cart-kicker">Giỏ hàng</span>
            <h1>Sản phẩm đã chọn</h1>
            <p>Kiểm tra sản phẩm top bạn vừa chọn trước khi đặt hàng.</p>
          </div>

          <Link to="/products" className="cart-continue-link">
            <FontAwesomeIcon icon={["fas", "arrow-left"]} />
            Tiếp tục mua sắm
          </Link>
        </div>

        {orderStatus && (
          <div className="cart-status" role="status">
            <FontAwesomeIcon icon={["fas", "check-circle"]} />
            <span>{orderStatus}</span>
          </div>
        )}

        {cartRows.length === 0 ? (
          <section className="cart-empty">
            <FontAwesomeIcon icon={["fas", "shopping-cart"]} />
            <h2>Giỏ hàng đang trống</h2>
            <p>Chọn một sản phẩm nổi bật hoặc xem danh sách sản phẩm để thêm vào giỏ.</p>
            <Link to="/" className="cart-primary-link">
              Xem sản phẩm nổi bật
            </Link>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-list" aria-label="Sản phẩm trong giỏ">
              {cartRows.map(({ product, quantity, salePrice, lineTotal }) => (
                <article className="cart-item" key={product.id}>
                  <Link to={`/products/${product.id}`} className="cart-item-media">
                    <img src={product.image} alt={product.name} />
                  </Link>

                  <div className="cart-item-info">
                    <span>{product.brand || product.category}</span>
                    <h2>
                      <Link to={`/products/${product.id}`}>{product.name}</Link>
                    </h2>
                    <strong>{formatCurrency(salePrice)}</strong>
                  </div>

                  <div className="cart-quantity-control" aria-label="Số lượng">
                    <button
                      type="button"
                      aria-label={`Giảm số lượng ${product.name}`}
                      disabled={quantity === 1}
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                    >
                      <FontAwesomeIcon icon={["fas", "minus"]} />
                    </button>
                    <strong>{quantity}</strong>
                    <button
                      type="button"
                      aria-label={`Tăng số lượng ${product.name}`}
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                    >
                      <FontAwesomeIcon icon={["fas", "plus"]} />
                    </button>
                  </div>

                  <div className="cart-item-total">
                    <strong>{formatCurrency(lineTotal)}</strong>
                    <button type="button" onClick={() => removeFromCart(product.id)}>
                      <FontAwesomeIcon icon={["fas", "trash-alt"]} />
                      Xóa
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="cart-summary" aria-label="Tóm tắt đơn hàng">
              <h2>Tóm tắt đơn hàng</h2>
              <div>
                <span>Tạm tính</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div>
                <span>Tiết kiệm</span>
                <strong>{formatCurrency(savedTotal)}</strong>
              </div>
              <div>
                <span>Giao hàng</span>
                <strong>Liên hệ</strong>
              </div>
              <div className="cart-summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <button type="button" className="cart-checkout-btn" onClick={checkout}>
                <FontAwesomeIcon icon={["fas", "shopping-bag"]} />
                Đặt hàng ngay
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;