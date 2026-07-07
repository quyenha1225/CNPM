import { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import Template from "./template/Template";
import ProductDetail from "./products/detail/ProductDetail";
import Landing from "./landing/Landing"; // Trang chủ mặc định ban đầu của bạn
import ProductList from "./products/ProductList";
import Cart from "./cart/Cart";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ForgotPassword from "./auth/ForgotPassword";

const categorySlugMap = {
  laptop: "Laptop",
  "dien-thoai": "DienThoai",
  "phu-kien": "PhuKien",
  "linh-kien-pc": "LinhKien",
  "man-hinh": "ManHinh",
};

function CategoryProductPage({ category, setCategory, brand, setBrand }) {
  const { categorySlug } = useParams();

  useEffect(() => {
    setCategory(categorySlugMap[categorySlug] || "");
    setBrand("");
  }, [categorySlug, setBrand, setCategory]);

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
  // Quản lý State tập trung để đồng bộ giữa Mega Menu và trang sản phẩm
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentBrand, setCurrentBrand] = useState("");

  return (
    <Template setCategory={setCurrentCategory} setBrand={setCurrentBrand}>
      <Routes>

        {/* 1. ĐƯA TRANG LANDING CŨ VỀ LÀM TRANG CHỦ MẶC ĐỊNH (/) */}
        <Route path="/" element={<Landing />} />
        
        {/* 2. CHỈ KHI VÀO ĐƯỜNG DẪN /products MỚI RA TRANG SẢN PHẨM CÔNG NGHỆ */}
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

        {/* Trang chi tiết sản phẩm */}
        <Route path="/products/:id" element={<ProductDetail />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Trang Giới thiệu */}
        <Route
          path="/about"
          element={
            <div className="container mt-5 text-center">
              <h2>Trang About đang được xây dựng...</h2>
            </div>
          }
        />
        
        {/* Bắt lỗi trang 404 */}
        <Route
          path="*"
          element={
            <div className="container mt-5 text-center">
              <h1 className="text-danger">404 - Không tìm thấy trang</h1>
              <p>Vui lòng quay lại trang chủ.</p>
            </div>
          }
        />
      </Routes>
    </Template>
  );
}

export default App;
