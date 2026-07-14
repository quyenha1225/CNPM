import { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
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

// Map chuẩn khớp 100% với category_slug trong Database MySQL của quyen/admin
const categorySlugMap = {
  laptop: "laptop",
  "dien-thoai": "dien-thoai",
  "phu-kien": "phu-kien",
  "linh-kien-pc": "linh-kien-pc",
  "man-hinh": "man-hinh",
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
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentBrand, setCurrentBrand] = useState("");

  // Logic quản lý Role & Trạng thái Đăng nhập tập trung để thực hiện chuyển đổi vai trò (role) giữa Admin và Khách hàng
  const [userRole, setUserRole] = useState(null); // null (chưa đăng nhập), 'admin', 'user'

  return (
    <Template setCategory={setCurrentCategory} setBrand={setCurrentBrand} userRole={userRole} setUserRole={setUserRole}>
      <Routes>
        {/* 1. Trang chủ mặc định */}
        <Route path="/" element={<Landing />} />
        
        {/* 2. Trang danh sách sản phẩm công nghệ */}
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

        {/* 3. Trang sản phẩm lọc theo danh mục */}
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

        {/* 4. Trang chi tiết sản phẩm */}
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* 5. Trang Giới thiệu (Đã đồng bộ theo quyen/admin) */}
        <Route path="/about" element={<About />} />
        
        {/* 6. Trang Liên hệ */}
        <Route path="/contact" element={<Contact />} />

        {/* 7. Các tuyến đường xác thực Tài khoản (Đã đồng bộ sang Component riêng của Quyền) */}
        <Route path="/login" element={<Login setUserRole={setUserRole} userRole={userRole} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 8. Giỏ hàng / Thanh toán */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />

        {/* 9. Bắt lỗi trang 404 */}
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