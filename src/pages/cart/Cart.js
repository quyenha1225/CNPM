import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useHistory, Link } from 'react-router-dom';
import ScrollToTopOnMount from '../../template/ScrollToTopOnMount';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const history = useHistory();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      history.push('/login');
      return;
    }
    history.push('/payment');
  };

  return (
    <div className="container mt-5 py-4 px-xl-5">
      <ScrollToTopOnMount />
      <h2 className="mb-4">Giỏ hàng</h2>

      {cartItems.length === 0 ? (
        <div className="alert alert-info">
          <p>Giỏ hàng của bạn đang trống.</p>
          <Link to="/products" className="btn btn-primary">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="table-responsive">
              <table className="table">
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
                        <div className="d-flex align-items-center">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '50px', marginRight: '10px' }}
                            />
                          )}
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td>{(item.price || 0).toLocaleString('vi-VN')} đ</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          style={{ width: '70px' }}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, parseInt(e.target.value))
                          }
                        />
                      </td>
                      <td>
                        {(
                          (item.price || 0) * item.quantity
                        ).toLocaleString('vi-VN')}{' '}
                        đ
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Tổng cộng</h5>
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>Số lượng sản phẩm:</span>
                  <span>{getTotalQuantity()}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="h5">Tổng tiền:</span>
                  <span className="h5 text-primary">
                    {getTotalPrice().toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <button
                  className="btn btn-primary w-100"
                  onClick={handleCheckout}
                >
                  Thanh toán
                </button>
                <Link to="/products" className="btn btn-secondary w-100 mt-2">
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
