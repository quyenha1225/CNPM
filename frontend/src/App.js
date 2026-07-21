import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useParams,
} from "react-router-dom";

import Template from "./template/Template";
import ProductDetail from "./products/detail/ProductDetail";
import Landing from "./landing/Landing";
import ProductList from "./products/ProductList";
import About from "./about/About";
import Contact from "./contact/Contact";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ForgotPassword from "./auth/ForgotPassword";
import Cart from "./cart/Cart";
import Payment from "./payment/Payment";
import AiSearchResult from "./ai/AiSearchResult";

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
      categorySlugMap[categorySlug] || ""
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

function App() {
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
              setCategory={setCurrentCategory}
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
              setCategory={setCurrentCategory}
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
          element={<Cart />}
        />

        <Route
          path="/payment"
          element={<Payment />}
        />

        <Route
          path="*"
          element={
            <div className="container mt-5 text-center">
              <h1 className="text-danger">
                404 - Không tìm thấy trang
              </h1>

              <p>
                Vui lòng quay lại trang chủ.
              </p>
            </div>
          }
        />
      </Routes>
    </Template>
  );
}

export default App;