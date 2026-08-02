import {
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useAuth } from "../context/AuthContext";

import AdminOverview from "./AdminOverview";
import AdminProductsPage from "./AdminProductsPage";
import AdminInventoryPage from "./AdminInventoryPage";
import AdminUsersPage from "./AdminUsersPage";
import {
  AdminAiConfigPage,
  AdminAuditLogsPage,
  AdminOrdersPage,
  AdminPromotionsPage,
  AdminReportsPage,
  AdminReviewsPage,
  AdminStaffPage,
} from "./AdminExtraPages";

import "./AdminDashboard.css";

const adminMenus = [
  {
    path: "",
    end: true,
    label: "Tổng quan",
    icon: "chart-pie",
    title: "Tổng quan hệ thống",
  },
  {
    path: "products",
    label: "Quản lý sản phẩm",
    icon: "box-open",
    title: "Quản lý sản phẩm",
  },
  {
    path: "inventory",
    label: "Quản lý kho",
    icon: "warehouse",
    title: "Quản lý kho",
  },
  {
    path: "orders",
    label: "Đơn hàng",
    icon: "receipt",
    title: "Đơn hàng và xử lý bán hàng",
  },
  {
    path: "users",
    label: "Người dùng & phân quyền",
    icon: "users-cog",
    title: "Người dùng và phân quyền",
  },
  {
    path: "staff",
    label: "Quản lý nhân viên",
    icon: "user-tie",
    title: "Quản lý nhân viên",
  },
  {
    path: "reviews",
    label: "Kiểm duyệt đánh giá",
    icon: "star",
    title: "Kiểm duyệt đánh giá",
  },
  {
    path: "promotions",
    label: "Khuyến mãi",
    icon: "tags",
    title: "Khuyến mãi và mã ưu đãi",
  },
  {
    path: "ai-config",
    label: "Cấu hình AI",
    icon: "robot",
    title: "Cấu hình AI Search",
  },
  {
    path: "reports",
    label: "Báo cáo doanh thu",
    icon: "chart-line",
    title: "Báo cáo doanh thu",
  },
  {
    path: "audit-logs",
    label: "Nhật ký hệ thống",
    icon: "clipboard-list",
    title: "Nhật ký hệ thống",
  },
];

function getUserName(user) {
  return (
    user?.fullName ||
    user?.userFullName ||
    user?.user_full_name ||
    user?.name ||
    "Quản trị viên"
  );
}

function AdminNotFound() {
  return (
    <section className="gx-admin-placeholder">
      <div className="gx-admin-placeholder__icon">
        <FontAwesomeIcon icon={["fas", "exclamation-triangle"]} />
      </div>
      <span>404</span>
      <h2>Không tìm thấy chức năng</h2>
      <p>Đường dẫn quản trị bạn truy cập không tồn tại.</p>
    </section>
  );
}

function AdminDashboard() {
  const auth = useAuth();
  const user = auth?.user || null;
  const location = useLocation();
  const navigate = useNavigate();

  const relativePath = location.pathname
    .replace(/^.*\/admin\/?/, "")
    .split("/")[0];

  const currentMenu =
    adminMenus.find((menu) => menu.path === relativePath) ||
    adminMenus[0];

  async function handleLogout() {
    await Promise.resolve(auth?.logout?.());
    navigate("/", { replace: true });
  }

  const navClassName = ({ isActive }) =>
    `gx-admin-sidebar__link ${isActive ? "is-active" : ""}`;

  return (
    <main className="gx-admin-app">
      <aside className="gx-admin-sidebar">
        <div className="gx-admin-brand">
          <div className="gx-admin-brand__icon">
            <FontAwesomeIcon icon={["fas", "shield-alt"]} />
          </div>
          <div>
            <strong>GEARXIN</strong>
            <small>Admin Control</small>
          </div>
        </div>

        <div className="gx-admin-account">
          <div className="gx-admin-account__avatar">
            <FontAwesomeIcon icon={["fas", "user-shield"]} />
          </div>
          <div>
            <span>Quản trị viên</span>
            <strong>{getUserName(user)}</strong>
            <small>
              {user?.email || user?.user_email || "admin@electroshop.vn"}
            </small>
          </div>
        </div>

        <nav className="gx-admin-sidebar__nav">
          <span className="gx-admin-sidebar__title">MENU QUẢN TRỊ</span>
          {adminMenus.map((menu) => (
            <NavLink
              key={menu.path || "overview"}
              to={menu.path ? `/admin/${menu.path}` : "/admin"}
              end={menu.end}
              className={navClassName}
            >
              <FontAwesomeIcon icon={["fas", menu.icon]} />
              <span>{menu.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="gx-admin-sidebar__footer">
          <NavLink to="/" className="gx-admin-store-link">
            <FontAwesomeIcon icon={["fas", "store"]} />
            Về cửa hàng
          </NavLink>
          <button type="button" onClick={handleLogout}>
            <FontAwesomeIcon icon={["fas", "sign-out-alt"]} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <section className="gx-admin-main">
        <header className="gx-admin-topbar">
          <div>
            <span>KHU VỰC QUẢN TRỊ</span>
            <h1>{currentMenu.title}</h1>
          </div>
          <div className="gx-admin-topbar__actions">
            <NavLink to="/">
              <FontAwesomeIcon icon={["fas", "external-link-alt"]} />
              Xem cửa hàng
            </NavLink>
            <button type="button" aria-label="Thông báo quản trị">
              <FontAwesomeIcon icon={["fas", "bell"]} />
              <span />
            </button>
          </div>
        </header>

        <div className="gx-admin-content">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="staff" element={<AdminStaffPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="promotions" element={<AdminPromotionsPage />} />
            <Route path="ai-config" element={<AdminAiConfigPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="*" element={<AdminNotFound />} />
          </Routes>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;
