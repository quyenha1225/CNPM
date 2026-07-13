
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ScrollToTopOnMount from "../template/ScrollToTopOnMount";
import { mockProductsFromMySQL } from "../products/ProductList";
import { getProductImage } from "../products/productImages";
import { getCartItems, saveCartItems } from "./cartStorage";

const priceFormatter = new Intl.NumberFormat("vi-VN");

function formatCurrency(value) {
  return `${priceFormatter.format(Math.round(value))} đ`;
}

function getSalePrice(product) {
  return product.percent_off > 0
    ? product.price - (product.percent_off * product.price) / 100
    : product.price;
}

function Cart() {
  const [cartItems, setCartItems] = useState(() => getCartItems());
  const [orderStatus, setOrderStatus] = useState("");

  const productMap = useMemo(() => {
    return new Map(mockProductsFromMySQL.map((product) => [product.id, product]));
  }, []);

  const cartRows = useMemo(() => {
    return cartItems
      .map((item) => {
        const product = productMap.get(item.id);
        if (!product) return null;

        const salePrice = getSalePrice(product);

        return {
          ...item,
          product,
          salePrice,
          lineTotal: salePrice * item.quantity,
          originalTotal: product.price * item.quantity,
        };
      })
      .filter(Boolean);
  }, [cartItems, productMap]);

  const subtotal = cartRows.reduce((total, item) => total + item.lineTotal, 0);
  const originalTotal = cartRows.reduce((total, item) => total + item.originalTotal, 0);
  const savedTotal = Math.max(0, originalTotal - subtotal);

  function syncCart(nextItems) {
    setCartItems(nextItems);
    saveCartItems(nextItems);
  }

  function updateQuantity(productId, quantity) {
    const safeQuantity = Math.max(1, quantity);
    syncCart(
      cartItems.map((item) =>
        item.id === productId ? { ...item, quantity: safeQuantity } : item
      )
    );
  }

  function removeItem(productId) {
    syncCart(cartItems.filter((item) => item.id !== productId));
  }

  function checkout() {
    syncCart([]);
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
                    <img src={getProductImage(product)} alt={product.name} />
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
                    <button type="button" onClick={() => removeItem(product.id)}>
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
