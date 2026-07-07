import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';
import ScrollToTopOnMount from '../../template/ScrollToTopOnMount';
import QRCode from 'qrcode';

function Payment() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const history = useHistory();
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef();

  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/login');
    }
  }, [isAuthenticated, history]);

  const generateQRPayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount: getTotalPrice(),
          paymentMethod: paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      setOrderData(data);

      // Generate QR Code on canvas
      const qrData = JSON.stringify({
        orderId: data.orderId,
        amount: getTotalPrice(),
        customer: user?.name,
      });

      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, qrData, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          quality: 0.95,
          margin: 1,
          width: 200,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-${orderData.orderId}.png`;
      link.click();
    }
  };

  const confirmPayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/payment/${orderData.orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'completed',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Confirmation failed');
      }

      clearCart();
      alert('Thanh toán thành công!');
      history.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mt-5 py-4 px-xl-5">
        <ScrollToTopOnMount />
        <div className="alert alert-warning">
          <p>Giỏ hàng của bạn đang trống.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 py-4 px-xl-5">
      <ScrollToTopOnMount />
      <h2 className="mb-4">Thanh toán</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Thông tin đơn hàng</h5>
              <hr />

              <div className="mb-3">
                <p>
                  <strong>Khách hàng:</strong> {user?.name}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
              </div>

              <h6 className="mt-4 mb-2">Chi tiết sản phẩm</h6>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{(item.price || 0).toLocaleString('vi-VN')} đ</td>
                      <td>
                        {(
                          (item.price || 0) * item.quantity
                        ).toLocaleString('vi-VN')}{' '}
                        đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-end">
                <h5 className="text-primary">
                  Tổng cộng: {getTotalPrice().toLocaleString('vi-VN')} đ
                </h5>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Phương thức thanh toán</h5>
              <hr />

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="qrMethod"
                  value="qr"
                  checked={paymentMethod === 'qr'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label className="form-check-label" htmlFor="qrMethod">
                  QR Code
                </label>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="bankMethod"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label className="form-check-label" htmlFor="bankMethod">
                  Chuyển khoản ngân hàng
                </label>
              </div>

              {!orderData && (
                <button
                  className="btn btn-primary w-100"
                  onClick={generateQRPayment}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Tạo mã QR'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {orderData && (
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title mb-3">Mã QR thanh toán</h5>
                <p className="text-muted">Mã đơn hàng: {orderData.orderId}</p>

                <div
                  className="d-flex justify-content-center mb-3"
                  style={{ padding: '10px', backgroundColor: '#f8f9fa' }}
                >
                  <canvas ref={canvasRef}></canvas>
                </div>

                <p className="text-muted">
                  <small>
                    Quét mã QR để hoàn tất thanh toán
                  </small>
                </p>

                <button
                  className="btn btn-secondary btn-sm w-100 mb-2"
                  onClick={downloadQR}
                >
                  Tải mã QR
                </button>

                <button
                  className="btn btn-success w-100"
                  onClick={confirmPayment}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Payment;
