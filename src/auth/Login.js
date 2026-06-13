import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      alert("Đăng nhập thành công!");
      // Có thể thêm logic đăng nhập thực tế ở đây
      navigate("/");
    } else {
      alert("Vui lòng nhập email và mật khẩu!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="text-dark mb-4">Đăng Nhập</h2>
          <p className="text-muted">Chào mừng quay lại ElectroShop</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {/* Email Field */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <FontAwesomeIcon icon={["fas", "envelope"]} /> Email
            </label>
            <input
              type="email"
              className="form-control form-control-lg"
              id="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              <FontAwesomeIcon icon={["fas", "lock"]} /> Mật khẩu
            </label>
            <div className="password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control form-control-lg"
                id="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="d-flex justify-content-between align-items-center mb-4">
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
              className="text-primary text-decoration-none"
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

        {/* Social Login (Optional) */}
        <div className="social-login mt-4">
          <button className="btn btn-outline-secondary btn-sm w-100 mb-2">
            <FontAwesomeIcon icon={["fab", "google"]} /> Đăng nhập bằng Google
          </button>
          <button className="btn btn-outline-secondary btn-sm w-100">
            <FontAwesomeIcon icon={["fab", "facebook"]} /> Đăng nhập bằng
            Facebook
          </button>
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

export default Login;
