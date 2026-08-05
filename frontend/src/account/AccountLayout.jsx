import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useAuth } from "../context/AuthContext";
import "./account.css";

const accountMenus = [
  {
    to: "/account",
    end: true,
    label: "Tổng quan",
    icon: "chart-pie",
  },
  {
    to: "/account/profile",
    label: "Thông tin cá nhân",
    icon: "user-edit",
  },
  {
    to: "/account/orders",
    label: "Đơn hàng của tôi",
    icon: "receipt",
  },
  {
    to: "/account/change-password",
    label: "Đổi mật khẩu",
    icon: "key",
  },
];

function getDisplayName(user) {
  return (
    user?.name ||
    user?.fullName ||
    user?.user_full_name ||
    user?.userFullName ||
    "Khách hàng"
  );
}

function AccountLayout() {
  const navigate = useNavigate();
  const auth = useAuth();

  const user = auth?.user || null;
  const displayName = getDisplayName(user);

  async function handleLogout() {
    try {
      await Promise.resolve(
        auth?.logout?.(),
      );
    } finally {
      navigate("/", {
        replace: true,
      });
    }
  }

  return (
    <main className="gx-account-page">
      <div className="container gx-account-shell">
        <aside className="gx-account-sidebar">
          <div className="gx-account-user-card">
            <div className="gx-account-avatar">
              {String(displayName)
                .trim()
                .charAt(0)
                .toUpperCase() || "U"}
            </div>

            <div className="gx-account-user-info">
              <span>TÀI KHOẢN CỦA TÔI</span>

              <strong>
                {displayName}
              </strong>

              <small>
                {user?.email ||
                  user?.user_email ||
                  ""}
              </small>
            </div>
          </div>

          <nav className="gx-account-menu">
            {accountMenus.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? "is-active"
                    : ""
                }
              >
                <FontAwesomeIcon
                  icon={[
                    "fas",
                    item.icon,
                  ]}
                />

                <span>{item.label}</span>
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleLogout}
            >
              <FontAwesomeIcon
                icon={[
                  "fas",
                  "sign-out-alt",
                ]}
              />

              <span>Đăng xuất</span>
            </button>
          </nav>
        </aside>

        <section className="gx-account-content">
          <Outlet />
        </section>
      </div>
    </main>
  );
}

export default AccountLayout;