import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "../utils/Toast";
import "./AuthPatch.css";

const API_URL = String(
  window.__GEARXIN_CONFIG__?.API_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:3001/api",
).replace(/\/+$/, "");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requestJson(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      "Không thể kết nối tới máy chủ. Hãy kiểm tra backend.",
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message ||
        data?.error ||
        "Yêu cầu không thành công";

    throw new Error(message);
  }

  return data;
}

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;

    const timer = window.setInterval(() => {
      setResendSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  function normalizeEmail(value) {
    return value.trim().toLowerCase();
  }

  function validateEmail() {
    const normalized = normalizeEmail(email);

    if (!normalized) {
      setError("Vui lòng nhập email");
      return null;
    }

    if (!emailRegex.test(normalized)) {
      setError("Email không đúng định dạng");
      return null;
    }

    return normalized;
  }

  async function sendOtp(showSuccess = true) {
    const normalized = validateEmail();
    if (!normalized) return false;

    setSubmitting(true);
    setError("");

    try {
      const result = await requestJson(
        "/auth/forgot-password/request-otp",
        {
          method: "POST",
          body: JSON.stringify({ email: normalized }),
        },
      );

      setEmail(normalized);
      setResendSeconds(
        Number(result?.resendAfterSeconds) || 60,
      );

      if (showSuccess) {
        toast.success(
          result?.message ||
            "Mã OTP đã được gửi tới email của bạn",
          2500,
        );
      }

      return true;
    } catch (requestError) {
      const message =
        requestError?.message || "Không thể gửi OTP";

      setError(message);
      toast.error(message, 3000);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendOtp(event) {
    event.preventDefault();

    if (await sendOtp(true)) {
      setOtp("");
      setStep(2);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();

    const cleanOtp = otp.replace(/\D/g, "");

    if (cleanOtp.length !== 6) {
      setError("Mã OTP phải có đúng 6 chữ số");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await requestJson(
        "/auth/forgot-password/verify-otp",
        {
          method: "POST",
          body: JSON.stringify({
            email: normalizeEmail(email),
            otp: cleanOtp,
          }),
        },
      );

      setStep(3);
      toast.success(
        result?.message || "Mã OTP đã được xác thực",
        2000,
      );
    } catch (requestError) {
      const message =
        requestError?.message || "Không thể xác thực OTP";

      setError(message);
      toast.error(message, 3000);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      setError(
        "Mật khẩu phải có chữ hoa, chữ thường và chữ số",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await requestJson(
        "/auth/forgot-password/reset",
        {
          method: "POST",
          body: JSON.stringify({
            email: normalizeEmail(email),
            otp,
            newPassword,
          }),
        },
      );

      toast.success(
        result?.message ||
          "Mật khẩu đã được đặt lại thành công",
        2500,
      );

      navigate("/login", { replace: true });
    } catch (requestError) {
      const message =
        requestError?.message || "Không thể đổi mật khẩu";

      setError(message);
      toast.error(message, 3000);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendOtp() {
    if (submitting || resendSeconds > 0) return;

    if (await sendOtp(false)) {
      setOtp("");
      toast.success("Đã gửi lại mã OTP mới", 2200);
    }
  }

  return (
    <main className="auth-page auth-page--forgot">
      <section className="auth-shell">
        <aside className="auth-visual-panel">
          <span className="auth-kicker">
            Gearxin Account Recovery
          </span>

          <h1>Khôi phục quyền truy cập tài khoản</h1>

          <p>
            Nhận mã OTP qua email, xác minh danh tính và tạo
            mật khẩu mới an toàn.
          </p>

          <div className="auth-security-list">
            <span>
              <FontAwesomeIcon icon={["fas", "shield-alt"]} />
              Mã OTP chỉ có hiệu lực trong thời gian giới hạn
            </span>
            <span>
              <FontAwesomeIcon icon={["fas", "lock"]} />
              Mật khẩu mới được mã hóa bằng bcrypt
            </span>
            <span>
              <FontAwesomeIcon icon={["fas", "envelope"]} />
              Mã xác thực được gửi trực tiếp tới email đăng ký
            </span>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <span>Hỗ trợ tài khoản</span>
            <h2>Quên mật khẩu</h2>
            <p>
              {step === 1 &&
                "Nhập email đã đăng ký để nhận mã xác thực."}
              {step === 2 &&
                `Nhập mã OTP 6 số được gửi tới ${email}.`}
              {step === 3 &&
                "Tạo mật khẩu mới cho tài khoản của bạn."}
            </p>
          </div>

          <div className="auth-recovery-progress">
            {[1, 2, 3].map((number) => (
              <span
                key={number}
                className={step >= number ? "is-active" : ""}
              >
                {number}
              </span>
            ))}
          </div>

          {error && (
            <div className="auth-server-error" role="alert">
              <FontAwesomeIcon
                icon={["fas", "exclamation-triangle"]}
              />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} noValidate>
              <label className="auth-field">
                <span>Email đăng ký</span>
                <div
                  className={`auth-input-wrap ${
                    error ? "is-invalid" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={["fas", "envelope"]} />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    disabled={submitting}
                  />
                </div>
              </label>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={submitting}
              >
                {submitting ? "Đang gửi mã..." : "Nhận mã OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} noValidate>
              <label className="auth-field">
                <span>Mã xác thực OTP</span>
                <div
                  className={`auth-input-wrap ${
                    error ? "is-invalid" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={["fas", "key"]} />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(event) => {
                      setOtp(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6),
                      );
                      setError("");
                    }}
                    placeholder="Nhập 6 chữ số"
                    maxLength={6}
                    disabled={submitting}
                    className="auth-otp-input"
                  />
                </div>
              </label>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={submitting || otp.length !== 6}
              >
                {submitting
                  ? "Đang xác minh..."
                  : "Xác nhận mã OTP"}
              </button>

              <div className="auth-form-options auth-otp-actions">
                <button
                  type="button"
                  className="auth-text-button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                  }}
                  disabled={submitting}
                >
                  <FontAwesomeIcon icon={["fas", "arrow-left"]} />
                  Đổi email
                </button>

                <button
                  type="button"
                  className="auth-text-button"
                  onClick={handleResendOtp}
                  disabled={submitting || resendSeconds > 0}
                >
                  {resendSeconds > 0
                    ? `Gửi lại sau ${resendSeconds}s`
                    : "Gửi lại mã"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} noValidate>
              <label className="auth-field">
                <span>Mật khẩu mới</span>
                <div className="auth-input-wrap">
                  <FontAwesomeIcon icon={["fas", "lock"]} />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Tối thiểu 8 ký tự"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                  >
                    <FontAwesomeIcon
                      icon={[
                        "fas",
                        showPassword ? "eye-slash" : "eye",
                      ]}
                    />
                  </button>
                </div>
              </label>

              <label className="auth-field">
                <span>Xác nhận mật khẩu mới</span>
                <div className="auth-input-wrap">
                  <FontAwesomeIcon icon={["fas", "lock"]} />
                  <input
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Nhập lại mật khẩu"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Ẩn mật khẩu"
                        : "Hiện mật khẩu"
                    }
                  >
                    <FontAwesomeIcon
                      icon={[
                        "fas",
                        showConfirmPassword
                          ? "eye-slash"
                          : "eye",
                      ]}
                    />
                  </button>
                </div>
              </label>

              <div className="auth-password-rules">
                <span>Tối thiểu 8 ký tự</span>
                <span>Có chữ hoa, chữ thường và chữ số</span>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={submitting}
              >
                {submitting
                  ? "Đang cập nhật..."
                  : "Lưu mật khẩu mới"}
              </button>
            </form>
          )}

          <p className="auth-switch">
            Nhớ ra mật khẩu?{" "}
            <Link to="/login">Quay lại đăng nhập</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
