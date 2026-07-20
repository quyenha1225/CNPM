import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faEnvelope, faPaperPlane, faShieldAlt, faCheck, faRedo, faLock, faEye, faEyeSlash, faSave, faArrowLeft, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import "./Auth.css";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    message: "",
    type: "error",
    nextStep: null
  });

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email) {
      setModalConfig({ show: true, title: "Lỗi", message: "Vui lòng nhập địa chỉ email!", type: "error" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setModalConfig({ show: true, title: "Lỗi", message: "Địa chỉ email không hợp lệ!", type: "error" });
      return;
    }

    setModalConfig({
      show: true,
      title: "Đã gửi mã OTP",
      message: `Mã xác thực 6 chữ số đã được gửi đến ${email}`,
      type: "success",
      nextStep: 2
    });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp) {
      setModalConfig({ show: true, title: "Lỗi", message: "Vui lòng nhập mã OTP!", type: "error" });
      return;
    }
    if (otp.length !== 6) {
      setModalConfig({ show: true, title: "Lỗi", message: "Mã OTP phải có đúng 6 chữ số!", type: "error" });
      return;
    }

    setModalConfig({
      show: true,
      title: "Xác thực thành công",
      message: "Mã OTP hợp lệ. Bạn có thể đặt lại mật khẩu mới ngay bây giờ.",
      type: "success",
      nextStep: 3
    });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword) {
      setModalConfig({ show: true, title: "Lỗi", message: "Vui lòng nhập mật khẩu mới!", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setModalConfig({ show: true, title: "Lỗi", message: "Mật khẩu phải có ít nhất 6 ký tự!", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalConfig({ show: true, title: "Lỗi", message: "Mật khẩu xác nhận không khớp!", type: "error" });
      return;
    }

    setModalConfig({
      show: true,
      title: "Thành công!",
      message: "Mật khẩu của bạn đã được cập nhật lại thành công.",
      type: "success",
      nextStep: "LOGIN"
    });
  };

  const handleCloseModal = () => {
    const targetStep = modalConfig.nextStep;
    setModalConfig({ ...modalConfig, show: false, nextStep: null });

    if (targetStep === "LOGIN") {
      navigate("/login");
    } else if (targetStep) {
      setStep(targetStep);
    }
  };

  return (
    <div className="auth-container">
      {/* CSS Animation hiệu ứng trượt từ dưới lên */}
      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { transform: translateY(60px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .custom-modal-backdrop {
          animation: fadeInBackdrop 0.3s ease forwards;
        }
        .custom-modal-box {
          animation: slideUpModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      <div className="auth-card">
        <div className="auth-header">
          <h2 className="text-dark mb-4">
            <FontAwesomeIcon icon={faKey} /> Quên Mật Khẩu
          </h2>
          <p className="text-muted">
            {step === 1 && "Nhập email của bạn để nhận mã xác thực"}
            {step === 2 && "Nhập mã OTP từ email"}
            {step === 3 && "Tạo mật khẩu mới"}
          </p>
        </div>

        <div className="progress mb-4">
          <div className="progress-bar" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                <FontAwesomeIcon icon={faEnvelope} /> Địa chỉ Email
              </label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="email"
                placeholder="Nhập email đăng ký"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <small className="text-muted">Chúng tôi sẽ gửi mã OTP đến email này</small>
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100">
              <FontAwesomeIcon icon={faPaperPlane} /> Gửi Mã OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="mb-4">
              <label htmlFor="otp" className="form-label">
                <FontAwesomeIcon icon={faShieldAlt} /> Mã Xác Thực
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
              <small className="text-muted d-block mt-2">Nhập 6 chữ số được gửi đến {email}</small>
            </div>
            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary btn-lg">
                <FontAwesomeIcon icon={faCheck} /> Xác Thực OTP
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                <FontAwesomeIcon icon={faRedo} /> Quay Lại
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                <FontAwesomeIcon icon={faLock} /> Mật Khẩu Mới
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
                <button type="button" className="btn-show-password" onClick={() => setShowPassword(!showPassword)}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">
                <FontAwesomeIcon icon={faLock} /> Xác Nhận Mật Khẩu
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
                <button type="button" className="btn-show-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-success btn-lg w-100">
              <FontAwesomeIcon icon={faSave} /> Lưu Mật Khẩu Mới
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-muted text-decoration-none">
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại đăng nhập
          </Link>
        </div>
      </div>

      {modalConfig.show && (
        <div
          className="custom-modal-backdrop"
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
          }}
        >
          <div
            className="custom-modal-box"
            style={{
              background: '#ffffff', borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ marginBottom: '15px' }}>
              <FontAwesomeIcon 
                icon={modalConfig.type === 'error' ? faTimesCircle : faCheckCircle} 
                style={{ fontSize: '56px', color: modalConfig.type === 'error' ? '#e74c3c' : '#2ecc71' }} 
              />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              {modalConfig.title}
            </h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: '25px' }}>
              {modalConfig.message}
            </p>
            <button onClick={handleCloseModal} style={{
              background: modalConfig.type === 'error' ? '#e74c3c' : '#2ecc71',
              color: '#fff', border: 'none', padding: '12px 0', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', width: '100%'
            }}>
              Đồng ý
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default ForgotPassword;