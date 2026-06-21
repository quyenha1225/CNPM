import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "../nillkin-case-1.jpg";
import "./cart.css";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container cart-container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="empty-cart-container">
              <div className="empty-cart-icon">
                <FontAwesomeIcon icon={["fas", "shopping-cart"]} />
              </div>
              <h2 className="empty-cart-title">Giỏ hàng của bạn trống</h2>
              <p className="empty-cart-text">
                Hãy thêm một số sản phẩm vào giỏ hàng của bạn để bắt đầu mua sắm!
              </p>
              <Link to="/products" className="empty-cart-btn">
                <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const shippingCost = 30000; // Phí vận chuyển cố định
  const finalTotal = totalPrice + shippingCost;

  return (
    <div className="container cart-container">
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="cart-header">
            <FontAwesomeIcon icon={["fas", "shopping-cart"]} style={{ marginRight: "12px", fontSize: "1.5rem", color: "#667eea" }} />
            <h2>Giỏ hàng của bạn</h2>
          </div>

          {/* Bảng sản phẩm */}
          <div className="cart-table-responsive">
            <table className="table cart-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Tổng</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="product-info">
                        <img
                          src={Image}
                          alt={item.name}
                          className="product-image"
                        />
                        <div className="product-details">
                          <h6>{item.name}</h6>
                          <small>ID: {item.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="price-cell">{item.price.toLocaleString()}đ</div>
                    </td>
                    <td>
                      <div className="quantity-input-group">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          type="button"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                        >
                          <FontAwesomeIcon icon={["fas", "minus"]} />
                        </button>
                        <input
                          type="number"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          min="1"
                        />
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          type="button"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                        >
                          <FontAwesomeIcon icon={["fas", "plus"]} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="total-cell">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm remove-btn"
                        onClick={() => handleRemoveItem(item.id)}
                        title="Xóa sản phẩm"
                      >
                        <FontAwesomeIcon icon={["fas", "trash"]} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Nút tiếp tục mua sắm */}
          <div className="continue-shopping">
            <Link to="/products" className="btn btn-outline-primary">
              <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Bản tóm tắt đơn hàng */}
        <div className="col-md-4">
          <div className="order-summary">
            <div className="summary-header">
              <h5>Tóm tắt đơn hàng</h5>
            </div>
            <div className="summary-body">
              {/* Tổng tiền hàng */}
              <div className="summary-row">
                <span className="summary-label">Tổng tiền hàng:</span>
                <span className="summary-value">
                  {totalPrice.toLocaleString()}đ
                </span>
              </div>

              {/* Số lượng sản phẩm */}
              <div className="summary-row">
                <span className="summary-label">Số lượng sản phẩm:</span>
                <span className="summary-value">{cartItems.length} loại</span>
              </div>

              {/* Phí vận chuyển */}
              <div className="summary-row">
                <span className="summary-label">Phí vận chuyển:</span>
                <span className="summary-value">
                  {shippingCost.toLocaleString()}đ
                </span>
              </div>

              {/* Tổng cộng */}
              <div className="summary-row total-row">
                <span className="summary-label">Tổng cộng:</span>
                <span className="summary-value">
                  {finalTotal.toLocaleString()}đ
                </span>
              </div>

              {/* Nút thanh toán */}
              <button className="checkout-btn">
                <FontAwesomeIcon icon={["fas", "credit-card"]} /> Tiến hành thanh toán
              </button>

              {/* Nút tiếp tục mua sắm (mobile) */}
              <Link
                to="/products"
                className="continue-btn-mobile d-md-none"
                replace
              >
                <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Tiếp tục mua sắm
              </Link>

              {/* Thông tin bổ sung */}
              <div className="info-box mt-4">
                <div className="info-item">
                  <FontAwesomeIcon icon={["fas", "check"]} className="info-icon" />
                  <span>Miễn phí vận chuyển cho đơn từ 500.000đ</span>
                </div>
                <div className="info-item">
                  <FontAwesomeIcon icon={["fas", "check"]} className="info-icon" />
                  <span>Hoàn tiền 100% nếu không hài lòng</span>
                </div>
                <div className="info-item">
                  <FontAwesomeIcon icon={["fas", "check"]} className="info-icon" />
                  <span>Giao hàng trong 2-3 ngày</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="card mt-3">
            <div className="card-body">
              <h6 className="card-title text-dark mb-3">
                <FontAwesomeIcon icon={["fas", "info-circle"]} /> Thông tin
              </h6>
              <small className="text-muted d-block mb-2">
                <FontAwesomeIcon icon={["fas", "check"]} className="text-success" /> Miễn
                phí vận chuyển cho đơn từ 500.000đ
              </small>
              <small className="text-muted d-block mb-2">
                <FontAwesomeIcon icon={["fas", "check"]} className="text-success" /> Hoàn
                tiền 100% nếu không hài lòng
              </small>
              <small className="text-muted d-block">
                <FontAwesomeIcon icon={["fas", "check"]} className="text-success" /> Giao
                hàng trong 2-3 ngày
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
