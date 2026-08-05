import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AccountLayout from "./AccountLayout";
import AccountOverviewPage from "./AccountOverviewPage";
import ChangePasswordPage from "./ChangePasswordPage";
import OrderDetailPage from "./OrderDetailPage";
import OrderHistoryPage from "./OrderHistoryPage";
import ProfilePage from "./ProfilePage";

function AccountRoutes() {
  return (
    <Routes>
      <Route element={<AccountLayout />}>
        <Route
          index
          element={<AccountOverviewPage />}
        />

        <Route
          path="profile"
          element={<ProfilePage />}
        />

        <Route
          path="orders"
          element={<OrderHistoryPage />}
        />

        <Route
          path="orders/:orderId"
          element={<OrderDetailPage />}
        />

        <Route
          path="change-password"
          element={<ChangePasswordPage />}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/account"
            replace
          />
        }
      />
    </Routes>
  );
}

export default AccountRoutes;