import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ScrollToTopOnMount from "../template/ScrollToTopOnMount";
import { getProductImage } from "../products/productImages";
import "./cart.css";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [orderStatus, setOrderStatus] = useState("");

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  // Logic thanh toán từ nhánh HEAD
  const handleCheckout = () => {
    clearCart();
    setOrderStatus("Đã tiếp nhận đơn hàng. Gearxin sẽ liên hệ xác nhận trong ít phút.");
  };

  if (cartItems.length === 0) {
    return (
      <div className="container cart-container mt-5 mb-5">
        <ScrollToTopOnMount />
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            {/* Hiển thị thông báo khi thanh toán thành công */}
            {orderStatus && (
              <div className="alert alert-success mb-4" role="alert">
                <FontAwesomeIcon icon={["fas", "check-circle"]} className="me-2" />
                {orderStatus}
              </div>
            )}
            <div className="empty-cart-container p-5 border rounded bg-light">
              <div className="empty-cart-icon mb-3">
                <FontAwesomeIcon icon={["fas", "shopping-cart"]} size="3x" className="text-muted" />
              </div>
              <h2 className="empty-cart-title h4">Giỏ hàng của bạn trống</h2>
              <p className="empty-cart-text text-muted mb-4">
                Hãy thêm một số sản phẩm vào giỏ hàng của bạn để bắt đầu mua sắm!
              </p>
              <Link to="/products" className="btn btn-primary empty-cart-btn">
                <FontAwesomeIcon icon={["fas", "arrow-left"]} className="me-2" /> Tiếp tục mua sắm
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
    <div className="container cart-container mt-4 mb-5">
      <ScrollToTopOnMount />
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="cart-header d-flex align-items-center mb-4">
            <FontAwesomeIcon icon={["fas", "shopping-cart"]} style={{ marginRight: "12px", fontSize: "1.5rem", color: "#667eea" }} />
            <h2 className="m-0">Giỏ hàng của bạn</h2>
          </div>

          {/* Bảng sản phẩm */}
          <div className="cart-table-responsive">
            <table className="table cart-table align-middle">
              <thead className="table-light">
                <tr>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th className="text-center">Số lượng</th>
                  <th>Tổng</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          // Dùng hàm lấy ảnh thật thay vì ảnh fix cứng
                          src={getProductImage(item)}
                          alt={item.name}
                          className="img-fluid rounded"
                          style={{ width: "80px", height: "80px", objectFit: "cover", marginRight: "15px" }}
                        />
                        <div>
                          <h6 className="mb-0">
                            <Link to={`/products/${item.id}`} className="text-decoration-none text-dark">
                              {item.name}
                            </Link>
                          </h6>
                          <small className="text-muted">{item.brand || item.category || `ID: ${item.id}`}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="price-cell fw-semibold">
                        {item.price.toLocaleString("vi-VN")}đ
                      </div>
                    </td>
                    <td>
                      <div className="input-group input-group-sm mx-auto" style={{ width: "110px" }}>
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          disabled={item.quantity === 1}
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <FontAwesomeIcon icon={["fas", "minus"]} />
                        </button>
                        <input
                          type="number"
                          className="form-control text-center"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                          }
                          min="1"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <FontAwesomeIcon icon={["fas", "plus"]} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="total-cell fw-bold text-primary">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </div>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
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
          <div className="mt-4 d-none d-md-block">
            <Link to="/products" className="btn btn-outline-primary">
              <FontAwesomeIcon icon={["fas", "arrow-left"]} className="me-2" /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Bản tóm tắt đơn hàng */}
        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">Tóm tắt đơn hàng</h5>
              
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Tổng tiền hàng:</span>
                <span className="fw-semibold">{totalPrice.toLocaleString("vi-VN")}đ</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Số lượng sản phẩm:</span>
                <span className="fw-semibold">{cartItems.length} loại</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                <span className="text-muted">Phí vận chuyển:</span>
                <span className="fw-semibold">{shippingCost.toLocaleString("vi-VN")}đ</span>
              </div>
              
              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Tổng cộng:</span>
                <span className="fw-bold fs-5 text-primary">{finalTotal.toLocaleString("vi-VN")}đ</span>
              </div>
              
              <button className="btn btn-primary w-100 py-2 mb-3" onClick={handleCheckout}>
                <FontAwesomeIcon icon={["fas", "credit-card"]} className="me-2" /> Tiến hành thanh toán
              </button>

              <Link to="/products" className="btn btn-outline-secondary w-100 py-2 mb-3 d-md-none">
                 <FontAwesomeIcon icon={["fas", "arrow-left"]} className="me-2"/> Tiếp tục mua sắm
              </Link>

              {/* Thông tin bổ sung */}
              <div className="small text-muted mt-4">
                <div className="mb-2">
                  <FontAwesomeIcon icon={["fas", "check"]} className="text-success me-2" />
                  Miễn phí vận chuyển cho đơn từ 500.000đ
                </div>
                <div className="mb-2">
                  <FontAwesomeIcon icon={["fas", "check"]} className="text-success me-2" />
                  Hoàn tiền 100% nếu không hài lòng
                </div>
                <div>
                  <FontAwesomeIcon icon={["fas", "check"]} className="text-success me-2" />
                  Giao hàng trong 2-3 ngày
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;