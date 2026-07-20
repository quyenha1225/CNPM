import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash, faTimesCircle, faCheckCircle, faExclamationTriangle, faSignInAlt, faUserPlus, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons";
import "./Auth.css";

function Login({ setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    message: "",
    type: "error",
  });

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setModalConfig({
        show: true,
        title: "Thông tin không hợp lệ",
        message: "Vui lòng kiểm tra lại email và mật khẩu của bạn!",
        type: "warning",
      });
      return;
    }

    setErrors({});

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (setUserRole) {
          setUserRole(data.user.role_code);
        }

        setModalConfig({
          show: true,
          title: "Đăng nhập thành công!",
          message: "Chào mừng bạn đã quay trở lại ElectroShop!",
          type: "success",
        });

      } else {
        setModalConfig({
          show: true,
          title: "Đăng nhập thất bại",
          message: data.message || "Email hoặc mật khẩu không chính xác!",
          type: "error",
        });
      }
    } catch (error) {
      setModalConfig({
        show: true,
        title: "Lỗi kết nối",
        message: "Không thể kết nối đến máy chủ Backend!",
        type: "error",
      });
    }
  };

  const handleCloseModal = () => {
    const isSuccess = modalConfig.type === "success";
    setModalConfig({ ...modalConfig, show: false });
    
    if (isSuccess) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role_code === 'ADMIN' || user.role_code === 'STAFF') {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  };

  const renderModalIcon = () => {
    if (modalConfig.type === 'success') return <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '56px', color: '#2ecc71' }} />;
    if (modalConfig.type === 'warning') return <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: '56px', color: '#f39c12' }} />;
    return <FontAwesomeIcon icon={faTimesCircle} style={{ fontSize: '56px', color: '#e74c3c' }} />;
  };

  return (
    <div className="auth-container">
      {/* CSS Animation hiệu ứng trượt từ dưới lên */}
      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { transform: translateY(60px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .custom-modal-backdrop {
          animation: fadeInBackdrop 0.3s ease forwards;
        }
        .custom-modal-box {
          animation: slideUpModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      <div className="auth-card">
        <div className="auth-header">
          <h2>Đăng Nhập</h2>
          <p>Chào mừng quay lại ElectroShop</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FontAwesomeIcon icon={faEnvelope} /> Email
            </label>
            <input
              type="email"
              className={`form-control form-control-lg ${errors.email ? "is-invalid" : ""}`}
              id="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({...errors, email: ""});
              }}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FontAwesomeIcon icon={faLock} /> Mật khẩu
            </label>
            <div className="password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control form-control-lg ${errors.password ? "is-invalid" : ""}`}
                id="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({...errors, password: ""});
                }}
              />
              <button
                type="button"
                className="btn-show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <div className="auth-options">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="rememberMe" />
              <label className="form-check-label" htmlFor="rememberMe">Nhớ tôi</label>
            </div>
            <Link to="/forgot-password" className="forgot-password-link">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-100 mb-3">
            <FontAwesomeIcon icon={faSignInAlt} /> Đăng Nhập
          </button>
        </form>

        <div className="auth-divider">
          <span>HOẶC</span>
        </div>

        <Link to="/register" className="btn btn-outline-primary btn-lg w-100 mb-3">
          <FontAwesomeIcon icon={faUserPlus} /> Tạo Tài Khoản Mới
        </Link>

        <div className="social-login">
          <button className="btn btn-outline-secondary btn-sm w-100 mb-2" type="button">
            <FontAwesomeIcon icon={faGoogle} /> Đăng nhập bằng Google
          </button>
          <button className="btn btn-outline-secondary btn-sm w-100" type="button">
            <FontAwesomeIcon icon={faFacebook} /> Đăng nhập bằng Facebook
          </button>
        </div>

        <div className="back-to-home">
          <Link to="/">
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại trang chủ
          </Link>
        </div>
      </div>

      {/* FRAME MODAL CHÍNH GIỮA CÓ ANIMATION TRƯỢT TỪ DƯỚI LÊN */}
      {modalConfig.show && (
        <div
          className="custom-modal-backdrop"
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
          }}
        >
          <div
            className="custom-modal-box"
            style={{
              background: '#ffffff', borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ marginBottom: '15px' }}>
              {renderModalIcon()}
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              {modalConfig.title}
            </h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: '25px' }}>
              {modalConfig.message}
            </p>
            <button onClick={handleCloseModal} style={{
              background: modalConfig.type === 'error' ? '#e74c3c' : modalConfig.type === 'warning' ? '#f39c12' : '#2ecc71',
              color: '#fff', border: 'none', padding: '12px 0', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', width: '100%'
            }}>
              Đồng ý
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Login;