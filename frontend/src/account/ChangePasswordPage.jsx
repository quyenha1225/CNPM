import {
  useMemo,
  useState,
} from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  changePassword,
} from "./accountApi";

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Không thể xử lý yêu cầu.";
}

function getPasswordStrength(
  password,
) {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  }

  if (
    /[^a-zA-Z0-9]/.test(
      password,
    )
  ) {
    score += 1;
  }

  if (score <= 1) {
    return {
      score,
      label: "Yếu",
      className: "is-weak",
    };
  }

  if (score <= 3) {
    return {
      score,
      label: "Trung bình",
      className: "is-medium",
    };
  }

  return {
    score,
    label: "Mạnh",
    className: "is-strong",
  };
}

function PasswordInput({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete,
}) {
  return (
    <label className="gx-account-field">
      <span>{label}</span>

      <div className="gx-account-input gx-account-password-input">
        <FontAwesomeIcon
          icon={[
            "fas",
            "lock",
          ]}
        />

        <input
          type={
            visible
              ? "text"
              : "password"
          }
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={
            autoComplete
          }
          required
        />

        <button
          type="button"
          className="gx-account-password-toggle"
          onClick={onToggle}
          aria-label={
            visible
              ? "Ẩn mật khẩu"
              : "Hiện mật khẩu"
          }
        >
          <FontAwesomeIcon
            icon={[
              "fas",
              visible
                ? "eye-slash"
                : "eye",
            ]}
          />
        </button>
      </div>
    </label>
  );
}

function ChangePasswordPage() {
  const [
    form,
    setForm,
  ] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [
    visibleFields,
    setVisibleFields,
  ] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const passwordStrength =
    useMemo(
      () =>
        getPasswordStrength(
          form.newPassword,
        ),
      [form.newPassword],
    );

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  function toggleVisibility(
    field,
  ) {
    setVisibleFields(
      (current) => ({
        ...current,
        [field]:
          !current[field],
      }),
    );
  }

  function validateForm() {
    if (
      !form.currentPassword
    ) {
      return "Vui lòng nhập mật khẩu hiện tại.";
    }

    if (
      form.newPassword.length < 8
    ) {
      return "Mật khẩu mới phải có ít nhất 8 ký tự.";
    }

    if (
      !/[A-Z]/.test(
        form.newPassword,
      )
    ) {
      return "Mật khẩu mới phải có ít nhất một chữ hoa.";
    }

    if (
      !/[a-z]/.test(
        form.newPassword,
      )
    ) {
      return "Mật khẩu mới phải có ít nhất một chữ thường.";
    }

    if (
      !/[0-9]/.test(
        form.newPassword,
      )
    ) {
      return "Mật khẩu mới phải có ít nhất một chữ số.";
    }

    if (
      form.currentPassword ===
      form.newPassword
    ) {
      return "Mật khẩu mới không được trùng với mật khẩu hiện tại.";
    }

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      return "Xác nhận mật khẩu mới không khớp.";
    }

    return "";
  }

  async function handleSubmit(
    event,
  ) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const data =
        await changePassword({
          currentPassword:
            form.currentPassword,

          newPassword:
            form.newPassword,

          confirmPassword:
            form.confirmPassword,
        });

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setVisibleFields({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });

      setSuccess(
        data?.message ||
          "Đổi mật khẩu thành công.",
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="gx-account-form-page">
      <header className="gx-account-heading">
        <span>
          ACCOUNT SECURITY
        </span>

        <h1>Đổi mật khẩu</h1>

        <p>
          Cập nhật mật khẩu thường xuyên
          để tăng mức độ an toàn cho tài
          khoản.
        </p>
      </header>

      <div className="gx-account-password-grid">
        <article className="gx-account-form-card">
          <div className="gx-account-form-card__header">
            <div className="gx-account-form-card__icon">
              <FontAwesomeIcon
                icon={[
                  "fas",
                  "key",
                ]}
              />
            </div>

            <div>
              <span>
                PASSWORD SETTINGS
              </span>

              <h2>
                Tạo mật khẩu mới
              </h2>
            </div>
          </div>

          {error && (
            <div
              className="gx-account-alert is-error"
              role="alert"
            >
              <FontAwesomeIcon
                icon={[
                  "fas",
                  "exclamation-circle",
                ]}
              />

              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              className="gx-account-alert is-success"
              role="status"
            >
              <FontAwesomeIcon
                icon={[
                  "fas",
                  "check-circle",
                ]}
              />

              <span>{success}</span>
            </div>
          )}

          <form
            className="gx-account-form"
            onSubmit={handleSubmit}
          >
            <PasswordInput
              label="Mật khẩu hiện tại"
              name="currentPassword"
              value={
                form.currentPassword
              }
              onChange={handleChange}
              visible={
                visibleFields.currentPassword
              }
              onToggle={() =>
                toggleVisibility(
                  "currentPassword",
                )
              }
              placeholder="Nhập mật khẩu hiện tại"
              autoComplete="current-password"
            />

            <PasswordInput
              label="Mật khẩu mới"
              name="newPassword"
              value={
                form.newPassword
              }
              onChange={handleChange}
              visible={
                visibleFields.newPassword
              }
              onToggle={() =>
                toggleVisibility(
                  "newPassword",
                )
              }
              placeholder="Nhập mật khẩu mới"
              autoComplete="new-password"
            />

            {form.newPassword && (
              <div className="gx-password-strength">
                <div className="gx-password-strength__header">
                  <span>
                    Độ mạnh mật khẩu
                  </span>

                  <strong
                    className={
                      passwordStrength.className
                    }
                  >
                    {
                      passwordStrength.label
                    }
                  </strong>
                </div>

                <div className="gx-password-strength__bars">
                  {[
                    1,
                    2,
                    3,
                    4,
                    5,
                  ].map(
                    (value) => (
                      <span
                        key={value}
                        className={
                          value <=
                          passwordStrength.score
                            ? passwordStrength.className
                            : ""
                        }
                      />
                    ),
                  )}
                </div>
              </div>
            )}

            <PasswordInput
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              value={
                form.confirmPassword
              }
              onChange={handleChange}
              visible={
                visibleFields.confirmPassword
              }
              onToggle={() =>
                toggleVisibility(
                  "confirmPassword",
                )
              }
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
            />

            <div className="gx-account-form__actions">
              <button
                type="button"
                className="gx-account-button is-secondary"
                disabled={
                  submitting
                }
                onClick={() => {
                  setForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });

                  setError("");
                  setSuccess("");
                }}
              >
                <FontAwesomeIcon
                  icon={[
                    "fas",
                    "times",
                  ]}
                />

                Xóa nội dung
              </button>

              <button
                type="submit"
                className="gx-account-button is-primary"
                disabled={
                  submitting
                }
              >
                <FontAwesomeIcon
                  icon={[
                    "fas",
                    submitting
                      ? "spinner"
                      : "shield-alt",
                  ]}
                  spin={submitting}
                />

                {submitting
                  ? "Đang cập nhật..."
                  : "Đổi mật khẩu"}
              </button>
            </div>
          </form>
        </article>

        <aside className="gx-account-security-card">
          <div className="gx-account-security-card__icon">
            <FontAwesomeIcon
              icon={[
                "fas",
                "shield-alt",
              ]}
            />
          </div>

          <h3>
            Tiêu chuẩn mật khẩu
          </h3>

          <p>
            Mật khẩu mới nên đáp ứng các
            yêu cầu sau:
          </p>

          <ul>
            <li>
              <FontAwesomeIcon
                icon={[
                  "fas",
                  "check",
                ]}
              />

              Ít nhất 8 ký tự
            </li>

            <li>
              <FontAwesomeIcon
                icon={[
                  "fas",
                  "check",
                ]}
              />

              Có chữ hoa và chữ thường
            </li>

            <li>
              <FontAwesomeIcon
                icon={[
                  "fas",
                  "check",
                ]}
              />

              Có ít nhất một chữ số
            </li>

            <li>
              <FontAwesomeIcon
                icon={[
                  "fas",
                  "check",
                ]}
              />

              Không trùng mật khẩu hiện
              tại
            </li>
          </ul>

          <div className="gx-account-security-note">
            <FontAwesomeIcon
              icon={[
                "fas",
                "info-circle",
              ]}
            />

            <div>
              <strong>
                Không chia sẻ mật khẩu
              </strong>

              <span>
                Gearxin không bao giờ yêu
                cầu cung cấp mật khẩu qua
                email hoặc điện thoại.
              </span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default ChangePasswordPage;