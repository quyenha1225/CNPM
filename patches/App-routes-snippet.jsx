// 1. Thêm import ở đầu file App.js/App.jsx đang chứa <Routes>:
import AccountRoutes from "./account/AccountRoutes";

// 2. Thêm dòng này BÊN TRONG <Routes> chính:
<Route
  path="/account/*"
  element={<AccountRoutes />}
/>
