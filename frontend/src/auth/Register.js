import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faPhone, faLock, faEye, faEyeSlash, faTimesCircle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import "./Auth.css";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    message: "",
    type: "error",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mật khẩu không khớp";
    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setModalConfig({
          show: true,
          title: "Đăng ký thành công!",
          message: "Tài khoản của bạn đã được tạo thành công. Bạn có thể đăng nhập ngay.",
          type: "success",
        });
      } else {
        setModalConfig({
          show: true,
          title: "Đăng ký thất bại",
          message: data.message || "Email này đã được sử dụng!",
          type: "error",
        });
      }
    } catch (error) {
      setModalConfig({
        show: true,
        title: "Lỗi kết nối",
        message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại!",
        type: "error",
      });
    }
  };

  const handleCloseModal = () => {
    const isSuccess = modalConfig.type === "success";
    setModalConfig({ ...modalConfig, show: false });
    if (isSuccess) {
      navigate("/login");
    }
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

      <div className="auth-card auth-card-register">
        <div className="auth-header">
          <h2>Tạo Tài Khoản</h2>
        </div>
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <div className={`input-group ${errors.fullName ? "input-error" : ""}`}>
              <span className="input-icon">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input name="fullName" placeholder="Họ và Tên" value={formData.fullName} onChange={handleChange} className="form-control" />
            </div>
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <div className={`input-group ${errors.email ? "input-error" : ""}`}>
              <span className="input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className="form-control" />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <div className={`input-group ${errors.phone ? "input-error" : ""}`}>
              <span className="input-icon">
                <FontAwesomeIcon icon={faPhone} />
              </span>
              <input name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} className="form-control" />
            </div>
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <div className={`input-group ${errors.password ? "input-error" : ""}`}>
              <span className="input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input name="password" type={showPassword ? "text" : "password"} placeholder="Mật khẩu" value={formData.password} onChange={handleChange} className="form-control" />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <div className={`input-group ${errors.confirmPassword ? "input-error" : ""}`}>
              <span className="input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Xác nhận mật khẩu" value={formData.confirmPassword} onChange={handleChange} className="form-control" />
              <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary w-100">Tạo Tài Khoản</button>
        </form>
      </div>

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
              <FontAwesomeIcon 
                icon={modalConfig.type === 'error' ? faTimesCircle : faCheckCircle} 
                style={{ fontSize: '56px', color: modalConfig.type === 'error' ? '#e74c3c' : '#2ecc71' }}
              />
            </div>

            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              {modalConfig.title}
            </h3>

            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: '25px' }}>
              {modalConfig.message}
            </p>

            <button
              onClick={handleCloseModal}
              style={{
                background: modalConfig.type === 'error' ? '#e74c3c' : '#2ecc71',
                color: '#fff', border: 'none', padding: '12px 0', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', width: '100%'
              }}
            >
              Đồng ý
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Register;