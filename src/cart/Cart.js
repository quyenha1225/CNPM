import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "../nillkin-case-1.jpg";

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
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center py-5">
              <FontAwesomeIcon
                icon={["fas", "shopping-cart"]}
                size="4x"
                className="text-muted mb-4"
              />
              <h2 className="text-dark mb-3">Giỏ hàng của bạn trống</h2>
              <p className="text-muted mb-4">
                Hãy thêm một số sản phẩm vào giỏ hàng của bạn để bắt đầu mua sắm!
              </p>
              <Link to="/products" className="btn btn-primary btn-lg">
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
    <div className="container mt-5 pt-5">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2 className="text-dark mb-4">
            <FontAwesomeIcon icon={["fas", "shopping-cart"]} /> Giỏ hàng của bạn
          </h2>

          {/* Bảng sản phẩm */}
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
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
                  <tr key={item.id} className="align-middle">
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={Image}
                          alt={item.name}
                          className="rounded"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            marginRight: "15px",
                          }}
                        />
                        <div>
                          <h6 className="mb-0 text-dark">{item.name}</h6>
                          <small className="text-muted">ID: {item.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{item.price.toLocaleString()}đ</strong>
                    </td>
                    <td>
                      <div className="input-group" style={{ width: "120px" }}>
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
                          className="form-control text-center"
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
                      <strong>
                        {(item.price * item.quantity).toLocaleString()}đ
                      </strong>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
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
          <div className="mt-4">
            <Link to="/products" className="btn btn-outline-primary">
              <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Bản tóm tắt đơn hàng */}
        <div className="col-md-4">
          <div className="card shadow-sm sticky-top" style={{ top: "100px" }}>
            <div className="card-header bg-light border-bottom">
              <h5 className="mb-0 text-dark">Tóm tắt đơn hàng</h5>
            </div>
            <div className="card-body">
              {/* Tổng tiền hàng */}
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Tổng tiền hàng:</span>
                <strong className="text-dark">
                  {totalPrice.toLocaleString()}đ
                </strong>
              </div>

              {/* Số lượng sản phẩm */}
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Số lượng sản phẩm:</span>
                <strong className="text-dark">{cartItems.length} loại</strong>
              </div>

              {/* Phí vận chuyển */}
              <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                <span className="text-muted">Phí vận chuyển:</span>
                <strong className="text-dark">
                  {shippingCost.toLocaleString()}đ
                </strong>
              </div>

              {/* Tổng cộng */}
              <div className="d-flex justify-content-between mb-4">
                <span className="h6 text-dark">Tổng cộng:</span>
                <h5 className="text-danger m-0">
                  {finalTotal.toLocaleString()}đ
                </h5>
              </div>

              {/* Nút thanh toán */}
              <button className="btn btn-danger w-100 mb-2">
                <FontAwesomeIcon icon={["fas", "credit-card"]} /> Tiến hành thanh
                toán
              </button>

              {/* Nút tiếp tục mua sắm (mobile) */}
              <Link
                to="/products"
                className="btn btn-outline-primary w-100 d-md-none"
              >
                <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Tiếp tục mua sắm
              </Link>
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
