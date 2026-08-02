import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "../utils/Toast";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(03|05|07|08|09)\d{8}$/;

function normalizePhone(value) {
  return value.replace(/[\s.-]/g, "").replace(/^\+84/, "0");
}

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
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
    const phone = normalizePhone(form.phone);

    if (form.name.trim().length < 2) {
      nextErrors.name = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (!emailRegex.test(email)) {
      nextErrors.email = "Email không đúng định dạng";
    }

    if (!phoneRegex.test(phone)) {
      nextErrors.phone = "Số điện thoại Việt Nam không hợp lệ";
    }

    if (form.password.length < 8) {
      nextErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/[a-z]/.test(form.password)) {
      nextErrors.password = "Mật khẩu phải có chữ thường";
    } else if (!/[A-Z]/.test(form.password)) {
      nextErrors.password = "Mật khẩu phải có chữ hoa";
    } else if (!/\d/.test(form.password)) {
      nextErrors.password = "Mật khẩu phải có chữ số";
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!form.acceptedTerms) {
      nextErrors.acceptedTerms = "Bạn cần đồng ý điều khoản sử dụng";
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
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: normalizePhone(form.phone),
        password: form.password,
      });

      toast.success("Đăng ký thành công", 2000);
      navigate("/", { replace: true });
    } catch (error) {
      setServerError(error.message);
      toast.error(error.message, 3000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--register">
      <section className="auth-shell">
        <aside className="auth-visual-panel">
          <span className="auth-kicker">ElectroShop Member</span>
          <h1>Đăng kí tài khoản để sử dụng dịch vụ </h1>
          <p>
            Thông tin an toàn và dễ dàng sử dụng
          </p>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <span>Bắt đầu với ElectroShop</span>
            <h2>Đăng ký tài khoản</h2>
          </div>

          {serverError && (
            <div className="auth-server-error" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <label className="auth-field">
              <span>Họ và tên</span>
              <div className={`auth-input-wrap ${errors.name ? "is-invalid" : ""}`}>
                <FontAwesomeIcon icon={["fas", "user"]} />
                <input
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.name && <small>{errors.name}</small>}
            </label>

            <label className="auth-field">
              <span>Email</span>
              <div className={`auth-input-wrap ${errors.email ? "is-invalid" : ""}`}>
                <FontAwesomeIcon icon={["fas", "envelope"]} />
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <small>{errors.email}</small>}
            </label>

            <label className="auth-field">
              <span>Số điện thoại</span>
              <div className={`auth-input-wrap ${errors.phone ? "is-invalid" : ""}`}>
                <FontAwesomeIcon icon={["fas", "phone"]} />
                <input
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="09xxxxxxxx"
                />
              </div>
              {errors.phone && <small>{errors.phone}</small>}
            </label>

            <label className="auth-field">
              <span>Mật khẩu</span>
              <div className={`auth-input-wrap ${errors.password ? "is-invalid" : ""}`}>
                <FontAwesomeIcon icon={["fas", "lock"]} />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder="Tối thiểu 8 ký tự"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  <FontAwesomeIcon
                    icon={["fas", showPassword ? "eye-slash" : "eye"]}
                  />
                </button>
              </div>
              {errors.password && <small>{errors.password}</small>}
            </label>

            <label className="auth-field">
              <span>Xác nhận mật khẩu</span>
              <div className={`auth-input-wrap ${errors.confirmPassword ? "is-invalid" : ""}`}>
                <FontAwesomeIcon icon={["fas", "lock"]} />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    updateField("confirmPassword", event.target.value)
                  }
                  placeholder="Nhập lại mật khẩu"
                />
              </div>
              {errors.confirmPassword && (
                <small>{errors.confirmPassword}</small>
              )}
            </label>

            <label className="auth-checkbox auth-checkbox--terms">
              <input
                type="checkbox"
                checked={form.acceptedTerms}
                onChange={(event) =>
                  updateField("acceptedTerms", event.target.checked)
                }
              />
              <span>Tôi đồng ý với điều khoản và chính sách bảo mật.</span>
            </label>
            {errors.acceptedTerms && (
              <div className="auth-checkbox-error">{errors.acceptedTerms}</div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>

          <p className="auth-switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
