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
      <div className="container py-5 text-center">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  return children;
}

export default RequireAuth;