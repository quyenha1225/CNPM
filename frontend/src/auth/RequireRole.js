import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({ children }) {
  const location = useLocation();
  const { isAuthenticated, sessionLoading } = useAuth();

  if (sessionLoading) {
    return (
      <main className="route-guard-loading">
        <span className="spinner-border" aria-hidden="true" />
        <p>Đang kiểm tra phiên đăng nhập...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  return children;
}

export function RequireRole({ roles = [], children }) {
  const location = useLocation();
  const { user, isAuthenticated, sessionLoading } = useAuth();

  if (sessionLoading) {
    return (
      <main className="route-guard-loading">
        <span className="spinner-border" aria-hidden="true" />
        <p>Đang xác thực quyền truy cập...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  const currentRole = String(user?.role || "").toUpperCase();

  if (roles.length && !roles.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
