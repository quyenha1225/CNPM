import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Auth.css";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
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
    setStep(2);
    alert("OTP đã được gửi đến email của bạn");
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
    alert("Mã OTP xác thực thành công");
  };

  // Step 3: Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError("");
    alert("Mật khẩu đã được đặt lại thành công!");
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="text-dark mb-4">
            <FontAwesomeIcon icon={["fas", "key"]} /> Quên Mật Khẩu
          </h2>
          <p className="text-muted">
            {step === 1 && "Nhập email của bạn để nhận mã xác thực"}
            {step === 2 && "Nhập mã OTP từ email"}
            {step === 3 && "Tạo mật khẩu mới"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="progress mb-4">
          <div
            className="progress-bar"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <FontAwesomeIcon icon={["fas", "exclamation-circle"]} /> {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError("")}
            ></button>
          </div>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                <FontAwesomeIcon icon={["fas", "envelope"]} /> Địa chỉ Email
              </label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="email"
                placeholder="Nhập email đăng ký"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <small className="text-muted">
                Chúng tôi sẽ gửi mã OTP đến email này
              </small>
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100">
              <FontAwesomeIcon icon={["fas", "paper-plane"]} /> Gửi Mã OTP
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="mb-4">
              <label htmlFor="otp" className="form-label">
                <FontAwesomeIcon icon={["fas", "shield-alt"]} /> Mã Xác Thực
              </label>
              <input
                type="text"
                className="form-control form-control-lg text-center"
                id="otp"
                placeholder="000000"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
              <small className="text-muted d-block mt-2">
                Nhập 6 chữ số được gửi đến {email}
              </small>
            </div>
            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary btn-lg">
                <FontAwesomeIcon icon={["fas", "check"]} /> Xác Thực OTP
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setStep(1)}
              >
                <FontAwesomeIcon icon={["fas", "redo"]} /> Quay Lại
              </button>
            </div>
            <div className="text-center mt-3">
              <small className="text-muted">
                Không nhận được OTP?{" "}
                <button
                  type="button"
                  className="btn btn-link p-0 text-primary"
                  onClick={() => alert("Đã gửi lại OTP")}
                >
                  Gửi lại
                </button>
              </small>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            {/* New Password */}
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                <FontAwesomeIcon icon={["fas", "lock"]} /> Mật Khẩu Mới
              </label>
              <div className="password-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control form-control-lg"
                  id="newPassword"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              <small className="text-muted d-block mt-1">
                Mật khẩu phải có ít nhất 6 ký tự
              </small>
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">
                <FontAwesomeIcon icon={["fas", "lock"]} /> Xác Nhận Mật Khẩu
              </label>
              <div className="password-input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control form-control-lg"
                  id="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
            </div>

            <button type="submit" className="btn btn-success btn-lg w-100">
              <FontAwesomeIcon icon={["fas", "save"]} /> Lưu Mật Khẩu Mới
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="text-center mt-4">
          <Link to="/login" className="text-muted text-decoration-none">
            <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
