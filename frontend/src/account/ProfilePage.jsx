import {
  useEffect,
  useState,
} from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useAuth } from "../context/AuthContext";

import {
  getProfile,
  updateProfile,
} from "./accountApi";

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Không thể xử lý yêu cầu.";
}

function normalizeProfile(data) {
  const source =
    data?.profile ||
    data?.user ||
    data?.data ||
    data ||
    {};

  return {
    fullName:
      source.fullName ||
      source.name ||
      source.userFullName ||
      source.user_full_name ||
      "",

    email:
      source.email ||
      source.userEmail ||
      source.user_email ||
      "",

    phone:
      source.phone ||
      source.userPhone ||
      source.user_phone ||
      "",

    role:
      source.role ||
      source.roleCode ||
      source.role_code ||
      "CUSTOMER",

    status:
      source.status ||
      source.accountStatus ||
      source.account_status ||
      "ACTIVE",

    createdAt:
      source.createdAt ||
      source.created_at ||
      null,
  };
}

function formatDate(value) {
  if (!value) {
    return "Chưa có thông tin";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Chưa có thông tin";
  }

  return date.toLocaleDateString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );
}

function getRoleLabel(role) {
  switch (
    String(role || "")
      .trim()
      .toUpperCase()
  ) {
    case "ADMIN":
      return "Quản trị viên";

    case "STAFF":
      return "Nhân viên";

    default:
      return "Khách hàng";
  }
}

function getStatusLabel(status) {
  switch (
    String(status || "")
      .trim()
      .toUpperCase()
  ) {
    case "LOCKED":
      return "Đã khóa";

    case "INACTIVE":
      return "Ngừng hoạt động";

    default:
      return "Đang hoạt động";
  }
}

function ProfilePage() {
  const auth = useAuth();

  const [
    form,
    setForm,
  ] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "CUSTOMER",
    status: "ACTIVE",
    createdAt: null,
  });

  const [
    originalForm,
    setOriginalForm,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

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

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const data =
          await getProfile();

        if (!active) {
          return;
        }

        const normalized =
          normalizeProfile(data);

        setForm(normalized);
        setOriginalForm(normalized);
      } catch (requestError) {
        if (!active) {
          return;
        }

        const authProfile =
          normalizeProfile(
            auth?.user || {},
          );

        if (
          authProfile.email ||
          authProfile.fullName
        ) {
          setForm(authProfile);
          setOriginalForm(
            authProfile,
          );
        }

        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [auth?.user]);

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

  function validateForm() {
    const fullName =
      form.fullName.trim();

    const phone = form.phone
      .trim()
      .replace(
        /[\s.-]/g,
        "",
      );

    if (fullName.length < 2) {
      return "Họ và tên phải có ít nhất 2 ký tự.";
    }

    if (
      phone &&
      !/^(0|\+84)[0-9]{9,10}$/.test(
        phone,
      )
    ) {
      return "Số điện thoại không hợp lệ.";
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
      const payload = {
        fullName:
          form.fullName.trim(),

        phone:
          form.phone
            .trim()
            .replace(
              /[\s.-]/g,
              "",
            ),
      };

      const data =
        await updateProfile(
          payload,
        );

      const normalized =
        normalizeProfile({
          ...form,
          ...data?.profile,
          ...data?.user,
          ...data?.data,
        });

      setForm(normalized);
      setOriginalForm(
        normalized,
      );

      if (
        typeof auth?.refreshSession ===
        "function"
      ) {
        await auth.refreshSession();
      } else if (
        typeof auth?.loadSession ===
        "function"
      ) {
        await auth.loadSession();
      }

      setSuccess(
        data?.message ||
          "Cập nhật thông tin thành công.",
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

  function handleReset() {
    if (!originalForm) {
      return;
    }

    setForm(originalForm);
    setError("");
    setSuccess("");
  }

  if (loading) {
    return (
      <section className="gx-account-form-page">
        <div className="gx-account-loading">
          <FontAwesomeIcon
            icon={[
              "fas",
              "spinner",
            ]}
            spin
          />

          <span>
            Đang tải thông tin cá
            nhân...
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="gx-account-form-page">
      <header className="gx-account-heading">
        <span>
          PERSONAL INFORMATION
        </span>

        <h1>
          Thông tin cá nhân
        </h1>

        <p>
          Cập nhật họ tên và số điện
          thoại sử dụng trong quá
          trình đặt hàng.
        </p>
      </header>

      <div className="gx-account-profile-grid">
        <article className="gx-account-form-card">
          <div className="gx-account-form-card__header">
            <div className="gx-account-form-card__icon">
              <FontAwesomeIcon
                icon={[
                  "fas",
                  "user-edit",
                ]}
              />
            </div>

            <div>
              <span>
                HỒ SƠ NGƯỜI DÙNG
              </span>

              <h2>
                Thông tin liên hệ
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
            <div className="gx-account-form__row">
              <label className="gx-account-field">
                <span>
                  Họ và tên
                </span>

                <div className="gx-account-input">
                  <FontAwesomeIcon
                    icon={[
                      "fas",
                      "user",
                    ]}
                  />

                  <input
                    type="text"
                    name="fullName"
                    value={
                      form.fullName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Nhập họ và tên"
                    maxLength="100"
                    required
                  />
                </div>
              </label>

              <label className="gx-account-field">
                <span>
                  Số điện thoại
                </span>

                <div className="gx-account-input">
                  <FontAwesomeIcon
                    icon={[
                      "fas",
                      "phone-alt",
                    ]}
                  />

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={
                      handleChange
                    }
                    placeholder="Ví dụ: 0912345678"
                    maxLength="15"
                  />
                </div>
              </label>
            </div>

            <label className="gx-account-field">
              <span>
                Địa chỉ email
              </span>

              <div className="gx-account-input is-readonly">
                <FontAwesomeIcon
                  icon={[
                    "fas",
                    "envelope",
                  ]}
                />

                <input
                  type="email"
                  value={form.email}
                  readOnly
                />
              </div>

              <small>
                Email được sử dụng để
                đăng nhập nên không thể
                thay đổi tại đây.
              </small>
            </label>

            <div className="gx-account-form__actions">
              <button
                type="button"
                className="gx-account-button is-secondary"
                onClick={handleReset}
                disabled={
                  submitting
                }
              >
                <FontAwesomeIcon
                  icon={[
                    "fas",
                    "undo",
                  ]}
                />

                Khôi phục
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
                      : "save",
                  ]}
                  spin={submitting}
                />

                {submitting
                  ? "Đang lưu..."
                  : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </article>

        <aside className="gx-account-info-card">
          <div className="gx-account-info-card__avatar">
            {String(
              form.fullName ||
                form.email ||
                "U",
            )
              .trim()
              .charAt(0)
              .toUpperCase()}
          </div>

          <h3>
            {form.fullName ||
              "Khách hàng Gearxin"}
          </h3>

          <p>{form.email}</p>

          <dl>
            <div>
              <dt>
                Vai trò
              </dt>

              <dd>
                {getRoleLabel(
                  form.role,
                )}
              </dd>
            </div>

            <div>
              <dt>
                Trạng thái
              </dt>

              <dd className="is-active">
                {getStatusLabel(
                  form.status,
                )}
              </dd>
            </div>

            <div>
              <dt>
                Ngày tham gia
              </dt>

              <dd>
                {formatDate(
                  form.createdAt,
                )}
              </dd>
            </div>
          </dl>

          <div className="gx-account-security-note">
            <FontAwesomeIcon
              icon={[
                "fas",
                "shield-alt",
              ]}
            />

            <div>
              <strong>
                Thông tin được bảo vệ
              </strong>

              <span>
                Chỉ bạn và quản trị viên
                có quyền mới có thể truy
                cập dữ liệu này.
              </span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default ProfilePage;