import { useEffect, useState } from "react";
import { Routes, Route, useParams, Navigate, Outlet } from "react-router-dom";
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
import AdminLayout from "./layouts/AdminLayout"; // Nhớ import layout Admin của chúng ta vào

// Map chuẩn khớp 100% với category_slug trong Database MySQL
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

// --- NGƯỜI GÁC CỔNG (PROTECTED ROUTE) ---
const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);

  if (!allowedRoles.includes(user.role_code)) {
    return (
      <div className="container mt-5 text-center">
        <h2 className="text-danger">Bạn không có quyền truy cập vào khu vực này!</h2>
        <a href="/">Quay về trang chủ</a>
      </div>
    );
  }

  return <Outlet />;
};

function App() {
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentBrand, setCurrentBrand] = useState("");
  const [userRole, setUserRole] = useState(null);

  return (
    <Routes>
      {/* =========================================
          KHU VỰC 1: CÁC TRANG CÔNG KHAI (AI CŨNG VÀO ĐƯỢC)
          ========================================= */}
      <Route path="/login" element={<Login setUserRole={setUserRole} userRole={userRole} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />


      {/* =========================================
          KHU VỰC 2: KHÁCH HÀNG & MUA SẮM (Bọc bằng Template của bạn)
          ========================================= */}
      <Route element={
        <Template setCategory={setCurrentCategory} setBrand={setCurrentBrand} userRole={userRole} setUserRole={setUserRole}>
          <Outlet />
        </Template>
      }>
        <Route path="/" element={<Landing />} />
        <Route path="/products" element={<ProductList category={currentCategory} setCategory={setCurrentCategory} brand={currentBrand} setBrand={setCurrentBrand} />} />
        <Route path="/category/:categorySlug" element={<CategoryProductPage category={currentCategory} setCategory={setCurrentCategory} brand={currentBrand} setBrand={setCurrentBrand} />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        
        {/* Bắt lỗi trang 404 cho khu vực khách hàng */}
        <Route path="*" element={
          <div className="container mt-5 text-center">
            <h1 className="text-danger">404 - Không tìm thấy trang</h1>
            <p>Vui lòng quay lại trang chủ.</p>
          </div>
        } />
      </Route>


      {/* =========================================
          KHU VỰC 3: QUẢN TRỊ VIÊN (Chỉ ADMIN & STAFF)
          ========================================= */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />}>
        {/* Bọc toàn bộ các trang quản trị bằng AdminLayout HTML thuần vừa tạo */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<h3>Tổng quan thống kê (Dashboard)</h3>} />
          <Route path="products" element={<h3>Trang Thêm/Sửa/Xóa Sản phẩm</h3>} />
          <Route path="orders" element={<h3>Trang duyệt Đơn hàng</h3>} />
          
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="users" element={<h3>Trang quản lý, phân quyền tài khoản</h3>} />
          </Route>
        </Route>
      </Route>

    </Routes>
  );
}

export default App;