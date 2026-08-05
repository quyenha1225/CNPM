import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function RequireAuth({ children }) {
  const location = useLocation();
  const {
    isAuthenticated,
    sessionLoading,
  } = useAuth();

  if (sessionLoading) {
    return (
      <main className="gx-account-loading">
        Đang kiểm tra phiên đăng nhập...
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}

export default RequireAuth;
