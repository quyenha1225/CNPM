import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { toast } from "../utils/Toast";
import "./AuthPatch.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const API_URL = String(
  window.__GEARXIN_CONFIG__?.API_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:3001/api",
).replace(/\/+$/, "");

function GoogleLogo() {
  return (
    <svg
      className="auth-google-logo"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.509h3.232c1.891-1.741 2.982-4.305 2.982-7.35Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.041.955-3.386.955-2.605 0-4.809-1.759-5.596-4.123H3.064v2.591A9.997 9.997 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.404 13.9A6.012 6.012 0 0 1 6.091 12c0-.659.114-1.3.313-1.9V7.509h-3.34A9.997 9.997 0 0 0 2 12c0 1.614.386 3.141 1.064 4.491L6.404 13.9Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.868-2.868C16.959 2.991 14.695 2 12 2a9.997 9.997 0 0 0-8.936 5.509l3.34 2.591C7.191 7.736 9.395 5.977 12 5.977Z"
      />
    </svg>
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function updateField(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
    setServerError("");
  }

  function validate() {
    const nextErrors = {};
    const email = form.email.trim().toLowerCase();

    if (!email) {
      nextErrors.email = "Email không được để trống";
    } else if (!emailRegex.test(email)) {
      nextErrors.email = "Email không đúng định dạng";
    }

    if (!form.password) {
      nextErrors.password = "Mật khẩu không được để trống";
    } else if (form.password.length < 6) {
      nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    return nextErrors;
  }

  function handleGoogleLogin() {
    setServerError("");
    window.location.assign(`${API_URL}/auth/google`);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      toast.warning("Vui lòng kiểm tra lại thông tin", 2500);
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      const result = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        rememberMe: form.rememberMe,
      });

      toast.success("Đăng nhập thành công", 1800);

      const role = String(result?.user?.role || "").toUpperCase();

      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
        return;
      }

      if (role === "STAFF") {
        navigate("/staff", { replace: true });
        return;
      }

      const requestedRoute = location.state?.from;

      if (requestedRoute) {
        navigate(requestedRoute, { replace: true });
        return;
      }

      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error?.message || "Đăng nhập không thành công";

      setServerError(message);
      toast.error(message, 3000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--login">
      <section className="auth-shell">
        <aside className="auth-visual-panel">
          <span className="auth-kicker">Gearxin Secure Access</span>

          <h1>Đăng nhập để tiếp tục mua sắm và quản lý hệ thống</h1>

          <p>
            Khách hàng cần đăng nhập trước khi thêm vào giỏ hàng
            hoặc mua ngay. Nhân viên và quản trị viên sẽ được
            chuyển tới khu vực nghiệp vụ riêng.
          </p>

          <div className="auth-security-list">
            <span>
              <FontAwesomeIcon icon={["fas", "shield-alt"]} />
              Cookie HTTP-only
            </span>
            <span>
              <FontAwesomeIcon icon={["fas", "user-lock"]} />
              Phân quyền CUSTOMER, STAFF và ADMIN
            </span>
            <span>
              <FontAwesomeIcon icon={["fas", "lock"]} />
              Mật khẩu mã hóa bcrypt
            </span>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <span>Chào mừng quay lại</span>
            <h2>Đăng nhập</h2>
            <p>Dùng tài khoản Gearxin của bạn.</p>
          </div>

          {serverError && (
            <div className="auth-server-error" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <label className="auth-field">
              <span>Email</span>
              <div
                className={`auth-input-wrap ${
                  errors.email ? "is-invalid" : ""
                }`}
              >
                <FontAwesomeIcon icon={["fas", "envelope"]} />
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email && <small>{errors.email}</small>}
            </label>

            <label className="auth-field">
              <span>Mật khẩu</span>
              <div
                className={`auth-input-wrap ${
                  errors.password ? "is-invalid" : ""
                }`}
              >
                <FontAwesomeIcon icon={["fas", "lock"]} />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder="Nhập mật khẩu"
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <FontAwesomeIcon
                    icon={["fas", showPassword ? "eye-slash" : "eye"]}
                  />
                </button>
              </div>
              {errors.password && <small>{errors.password}</small>}
            </label>

            <div className="auth-form-options">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(event) =>
                    updateField("rememberMe", event.target.checked)
                  }
                />
                <span>Ghi nhớ đăng nhập trong 30 ngày</span>
              </label>

              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Đang xác thực..." : "Đăng nhập"}
            </button>

            <div className="auth-divider">
              <span>Hoặc tiếp tục với</span>
            </div>

            <button
              type="button"
              className="auth-google-btn"
              onClick={handleGoogleLogin}
              disabled={submitting}
            >
              <GoogleLogo />
              <span>Đăng nhập bằng Google</span>
            </button>
          </form>

          <p className="auth-switch">
            Chưa có tài khoản?{" "}
            <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
