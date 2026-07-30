import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "../utils/Toast";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
    setServerError("");
  }

  function validate() {
    const nextErrors = {};
    const email = form.email.trim();

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
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        rememberMe: form.rememberMe,
      });

      toast.success("Đăng nhập thành công", 2000);

      const redirectTo = location.state?.from || "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(error.message);
      toast.error(error.message, 3000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--login">
      <section className="auth-shell">
        <aside className="auth-visual-panel">
          <span className="auth-kicker">ElectroShop Secure Access</span>
          <h1>Đăng nhập để tiếp tục hành trình mua sắm công nghệ</h1>
          <p>
            Phiên đăng nhập được lưu bằng cookie HTTP-only. JavaScript phía
            trình duyệt không đọc trực tiếp được cookie xác thực.
          </p>

          <div className="auth-security-list">
            <span>
              <FontAwesomeIcon icon={["fas", "shield-alt"]} />
              Xác thực cả frontend và backend
            </span>
            <span>
              <FontAwesomeIcon icon={["fas", "cookie-bite"]} />
              Cookie HTTP-only, SameSite=Lax
            </span>
            <span>
              <FontAwesomeIcon icon={["fas", "lock"]} />
              Mật khẩu được kiểm tra bằng bcrypt
            </span>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <span>Chào mừng quay lại</span>
            <h2>Đăng nhập</h2>
            <p>Dùng tài khoản ElectroShop của bạn.</p>
          </div>

          {serverError && (
            <div className="auth-server-error" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <label className="auth-field">
              <span>Email</span>
              <div className={`auth-input-wrap ${errors.email ? "is-invalid" : ""}`}>
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
              <div className={`auth-input-wrap ${errors.password ? "is-invalid" : ""}`}>
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
          </form>

          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
