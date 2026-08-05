import {
  useEffect,
  useState,
} from "react";

import {
  Route,
  Routes,
  useParams,
} from "react-router-dom";

import About from "./about/About";
import AccountLayout from "./account/AccountLayout";
import AccountOverviewPage from "./account/AccountOverviewPage";
import ChangePasswordPage from "./account/ChangePasswordPage";
import OrderDetailPage from "./account/OrderDetailPage";
import OrderHistoryPage from "./account/OrderHistoryPage";
import ProfilePage from "./account/ProfilePage";
import AdminDashboard from "./admin/AdminDashboard";
import AiSearchResult from "./ai/AiSearchResult";
import ForgotPassword from "./auth/ForgotPassword";
import Login from "./auth/Login";
import Register from "./auth/Register";
import RequireAuth from "./auth/RequireAuth";
import { RequireRole } from "./auth/RequireRole";
import Cart from "./cart/Cart";
import Contact from "./contact/Contact";
import Landing from "./landing/Landing";
import Payment from "./payment/Payment";
import ProductList from "./products/ProductList";
import ProductDetail from "./products/detail/ProductDetail";
import StaffDashboard from "./staff/StaffDashboard";
import Template from "./template/Template";

const categorySlugMap = {
  laptop: "laptop",
  "dien-thoai": "dien-thoai",
  "phu-kien": "phu-kien",
  "linh-kien-pc": "linh-kien-pc",
  "man-hinh": "man-hinh",
};

function CategoryProductPage({
  category,
  setCategory,
  brand,
  setBrand,
}) {
  const { categorySlug } = useParams();

  useEffect(() => {
    setCategory(
      categorySlugMap[categorySlug] || "",
    );

    setBrand("");
  }, [
    categorySlug,
    setBrand,
    setCategory,
  ]);

  return (
    <ProductList
      category={category}
      setCategory={setCategory}
      brand={brand}
      setBrand={setBrand}
    />
  );
}

function NotFoundPage() {
  return (
    <div className="container py-5 text-center">
      <h1 className="text-danger">
        404 - Không tìm thấy trang
      </h1>

      <p>Vui lòng quay lại trang chủ.</p>
    </div>
  );
}

function StorefrontRoutes() {
  const [
    currentCategory,
    setCurrentCategory,
  ] = useState("");

  const [
    currentBrand,
    setCurrentBrand,
  ] = useState("");

  return (
    <Template
      setCategory={setCurrentCategory}
      setBrand={setCurrentBrand}
    >
      <Routes>
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/products"
          element={
            <ProductList
              category={currentCategory}
              setCategory={
                setCurrentCategory
              }
              brand={currentBrand}
              setBrand={setCurrentBrand}
            />
          }
        />

        <Route
          path="/category/:categorySlug"
          element={
            <CategoryProductPage
              category={currentCategory}
              setCategory={
                setCurrentCategory
              }
              brand={currentBrand}
              setBrand={setCurrentBrand}
            />
          }
        />

        <Route
          path="/products/:id"
          element={<ProductDetail />}
        />

        <Route
          path="/ai-search"
          element={<AiSearchResult />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/cart"
          element={
            <RequireAuth>
              <Cart />
            </RequireAuth>
          }
        />

        <Route
          path="/payment"
          element={
            <RequireAuth>
              <Payment />
            </RequireAuth>
          }
        />

        {/* ROUTE TÀI KHOẢN NGƯỜI DÙNG */}
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountLayout />
            </RequireAuth>
          }
        >
          <Route
            index
            element={
              <AccountOverviewPage />
            }
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
            element={
              <ChangePasswordPage />
            }
          />
        </Route>

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </Template>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <RequireRole roles={["ADMIN"]}>
            <AdminDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/staff/*"
        element={
          <RequireRole roles={["STAFF"]}>
            <StaffDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/*"
        element={<StorefrontRoutes />}
      />
    </Routes>
  );
}

export default App;