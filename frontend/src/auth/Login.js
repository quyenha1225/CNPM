import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "../utils/Toast";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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

  const handleLogin = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.warning("⚠ Vui lòng kiểm tra lại thông tin", 3000);
      return;
    }
    
    setErrors({});
    toast.success("✓ Đăng nhập thành công! Chào mừng quay lại!", 2000);
    
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Đăng Nhập</h2>
          <p>Chào mừng quay lại ElectroShop</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FontAwesomeIcon icon={["fas", "envelope"]} /> Email
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

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FontAwesomeIcon icon={["fas", "lock"]} /> Mật khẩu
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
                <FontAwesomeIcon
                  icon={["fas", showPassword ? "eye-slash" : "eye"]}
                />
              </button>
            </div>
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="auth-options">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Nhớ tôi
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="forgot-password-link"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Login Button */}
          <button type="submit" className="btn btn-primary btn-lg w-100 mb-3">
            <FontAwesomeIcon icon={["fas", "sign-in-alt"]} /> Đăng Nhập
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>HOẶC</span>
        </div>

        {/* Register Button */}
        <Link
          to="/register"
          className="btn btn-outline-primary btn-lg w-100 mb-3"
        >
          <FontAwesomeIcon icon={["fas", "user-plus"]} /> Tạo Tài Khoản Mới
        </Link>

        {/* Social Login */}
        <div className="social-login">
          <button className="btn btn-outline-secondary btn-sm w-100 mb-2" type="button">
            <FontAwesomeIcon icon={["fab", "google"]} /> Đăng nhập bằng Google
          </button>
          <button className="btn btn-outline-secondary btn-sm w-100" type="button">
            <FontAwesomeIcon icon={["fab", "facebook"]} /> Đăng nhập bằng Facebook
          </button>
        </div>

        {/* Back to Home */}
        <div className="back-to-home">
          <Link to="/">
            <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
