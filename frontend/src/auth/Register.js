import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Import các icon cần thiết cho form
import { faUser, faEnvelope, faPhone, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "../utils/Toast";
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi của trường đó khi người dùng bắt đầu nhập lại
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
        toast.success("✓ Đăng ký thành công!", 2000);
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast.error("Đăng ký thất bại: " + data.message, 3000);
      }
    } catch (error) {
      toast.error("Không thể kết nối Server!", 3000);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-register">
        <div className="auth-header">
          <h2>Tạo Tài Khoản</h2>
        </div>
        <form onSubmit={handleRegister} className="auth-form">
          
          {/* Họ và Tên */}
          <div className="form-group">
            <div className={`input-group ${errors.fullName ? "input-error" : ""}`}>
              <span className="input-icon">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input name="fullName" placeholder="Họ và Tên" value={formData.fullName} onChange={handleChange} className="form-control" />
            </div>
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <div className={`input-group ${errors.email ? "input-error" : ""}`}>
              <span className="input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className="form-control" />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Số điện thoại */}
          <div className="form-group">
            <div className={`input-group ${errors.phone ? "input-error" : ""}`}>
              <span className="input-icon">
                <FontAwesomeIcon icon={faPhone} />
              </span>
              <input name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} className="form-control" />
            </div>
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          {/* Mật khẩu */}
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

          {/* Xác nhận mật khẩu */}
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
    </div>
  );
}

export default Register;