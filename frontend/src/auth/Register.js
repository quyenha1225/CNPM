import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Số điện thoại phải có 10 chữ số";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    return newErrors;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-register">
        <div className="auth-header">
          <h2 className="text-dark mb-4">Tạo Tài Khoản</h2>
          <p className="text-muted">Tham gia ElectroShop ngay để mua sắm</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          {/* Full Name */}
          <div className="mb-3">
            <label htmlFor="fullName" className="form-label">
              <FontAwesomeIcon icon={["fas", "user"]} /> Họ và Tên
            </label>
            <input
              type="text"
              className={`form-control form-control-lg ${
                errors.fullName ? "is-invalid" : ""
              }`}
              id="fullName"
              name="fullName"
              placeholder="Nhập họ và tên"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <div className="invalid-feedback">{errors.fullName}</div>
            )}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <FontAwesomeIcon icon={["fas", "envelope"]} /> Email
            </label>
            <input
              type="email"
              className={`form-control form-control-lg ${
                errors.email ? "is-invalid" : ""
              }`}
              id="email"
              name="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">
              <FontAwesomeIcon icon={["fas", "phone"]} /> Số Điện Thoại
            </label>
            <input
              type="tel"
              className={`form-control form-control-lg ${
                errors.phone ? "is-invalid" : ""
              }`}
              id="phone"
              name="phone"
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <div className="invalid-feedback">{errors.phone}</div>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              <FontAwesomeIcon icon={["fas", "lock"]} /> Mật Khẩu
            </label>
            <div className="password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control form-control-lg ${
                  errors.password ? "is-invalid" : ""
                }`}
                id="password"
                name="password"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="btn-show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon
                  icon={["fas", showPassword ? "eye-slash" : "eye"]}
                />
              </button>
            </div>
            {errors.password && (
              <div className="invalid-feedback d-block">{errors.password}</div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              <FontAwesomeIcon icon={["fas", "lock"]} /> Xác Nhận Mật Khẩu
            </label>
            <div className="password-input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`form-control form-control-lg ${
                  errors.confirmPassword ? "is-invalid" : ""
                }`}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="btn-show-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <FontAwesomeIcon
                  icon={["fas", showConfirmPassword ? "eye-slash" : "eye"]}
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="invalid-feedback d-block">
                {errors.confirmPassword}
              </div>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="terms"
              required
            />
            <label className="form-check-label" htmlFor="terms">
              Tôi đồng ý với{" "}
              <Link to="/" className="text-primary text-decoration-none">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link to="/" className="text-primary text-decoration-none">
                Chính sách bảo mật
              </Link>
            </label>
          </div>

          {/* Register Button */}
          <button type="submit" className="btn btn-primary btn-lg w-100 mb-3">
            <FontAwesomeIcon icon={["fas", "user-plus"]} /> Tạo Tài Khoản
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>HOẶC</span>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-muted mb-2">Bạn đã có tài khoản?</p>
          <Link to="/login" className="btn btn-outline-primary btn-lg w-100">
            <FontAwesomeIcon icon={["fas", "sign-in-alt"]} /> Đăng Nhập Ngay
          </Link>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link to="/" className="text-muted text-decoration-none">
            <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
