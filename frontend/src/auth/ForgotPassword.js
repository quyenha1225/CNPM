import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "../utils/Toast";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email không hợp lệ");
      return;
    }
    setError("");
    setSubmitting(true);
    
    // Giả lập gửi OTP
    setTimeout(() => {
      setStep(2);
      setSubmitting(false);
      toast.success("OTP đã được gửi đến email của bạn", 2500);
    }, 1000);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Vui lòng nhập mã OTP");
      return;
    }
    if (otp.length !== 6) {
      setError("OTP phải có 6 chữ số");
      return;
    }
    setError("");
    setStep(3);
    toast.success("Mã OTP xác thực thành công", 2000);
  };

  // Step 3: Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError("");
    toast.success("Mật khẩu đã được đặt lại thành công!", 2500);
    navigate("/login");
  };

  return (
    <main className="auth-page auth-page--forgot">
      <section className="auth-shell">
        {/* Panel bên trái (Đồng bộ với Login/Register) */}
        <aside className="auth-visual-panel">
          <span className="auth-kicker">ElectroShop Recovery</span>
          <h1>Khôi phục quyền truy cập tài khoản</h1>
          <p>
            Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại mật khẩu một cách an toàn và nhanh chóng.
          </p>
          <div className="auth-security-list">
            <span>
              <FontAwesomeIcon icon={["fas", "shield-alt"]} />
              Mã OTP xác thực bảo mật 2 lớp
            </span>
            <span>
              <FontAwesomeIcon icon={["fas", "lock"]} />
              Mã hóa đầu cuối dữ liệu mới
            </span>
          </div>
        </aside>

        {/* Panel Form bên phải */}
        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <span>Hỗ trợ tài khoản</span>
            <h2>Quên Mật Khẩu</h2>
            <p>
              {step === 1 && "Nhập email của bạn để nhận mã xác thực."}
              {step === 2 && `Nhập mã OTP 6 số được gửi tới ${email}`}
              {step === 3 && "Tạo mật khẩu mới cho tài khoản của bạn."}
            </p>
          </div>

          {error && (
            <div className="auth-server-error" role="alert">
              <FontAwesomeIcon icon={["fas", "exclamation-triangle"]} /> {error}
            </div>
          )}

          {/* Form Bước 1: Nhập Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} noValidate>
              <label className="auth-field">
                <span>Email đăng ký</span>
                <div className={`auth-input-wrap ${error ? "is-invalid" : ""}`}>
                  <FontAwesomeIcon icon={["fas", "envelope"]} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                  />
                </div>
              </label>

              <button type="submit" className="auth-submit-btn" disabled={submitting}>
                {submitting ? "Đang gửi..." : "Nhận mã OTP"}
              </button>
            </form>
          )}

          {/* Form Bước 2: Nhập OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} noValidate>
              <label className="auth-field">
                <span>Mã xác thực OTP</span>
                <div className={`auth-input-wrap ${error ? "is-invalid" : ""}`}>
                  <FontAwesomeIcon icon={["fas", "key"]} />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    placeholder="Nhập 6 chữ số"
                    maxLength="6"
                    style={{ letterSpacing: "4px", fontWeight: "bold" }}
                  />
                </div>
              </label>

              <button type="submit" className="auth-submit-btn">
                Xác nhận mã OTP
              </button>
              
              <div className="auth-form-options" style={{ marginTop: "1rem", justifyContent: "space-between" }}>
                <button 
                  type="button" 
                  className="btn-link" 
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color, #0056b3)', cursor: 'pointer' }}
                  onClick={() => setStep(1)}
                >
                  <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Quay lại
                </button>
                <button 
                  type="button" 
                  className="btn-link" 
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color, #0056b3)', cursor: 'pointer' }}
                  onClick={() => toast.success("Đã gửi lại OTP")}
                >
                  Gửi lại mã
                </button>
              </div>
            </form>
          )}

          {/* Form Bước 3: Đổi Mật Khẩu */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} noValidate>
              <label className="auth-field">
                <span>Mật khẩu mới</span>
                <div className="auth-input-wrap">
                  <FontAwesomeIcon icon={["fas", "lock"]} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Tối thiểu 8 ký tự"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={["fas", showPassword ? "eye-slash" : "eye"]} />
                  </button>
                </div>
              </label>

              <label className="auth-field">
                <span>Xác nhận mật khẩu mới</span>
                <div className="auth-input-wrap">
                  <FontAwesomeIcon icon={["fas", "lock"]} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <FontAwesomeIcon icon={["fas", showConfirmPassword ? "eye-slash" : "eye"]} />
                  </button>
                </div>
              </label>

              <button type="submit" className="auth-submit-btn">
                Lưu mật khẩu & Đăng nhập
              </button>
            </form>
          )}

          <p className="auth-switch">
            Nhớ ra mật khẩu? <Link to="/login">Quay lại đăng nhập</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;