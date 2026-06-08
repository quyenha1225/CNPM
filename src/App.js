import Template from "./template/Template";
import ProductDetail from "./products/detail/ProductDetail";
import { Routes, Route } from "react-router-dom";
import Landing from "./landing/Landing";
import ProductList from "./products/ProductList";

function App() {
  return (
    <Template>
      <Routes>
        {/* 1. Đưa ProductList làm trang chủ để vừa vào web là thấy thanh tìm kiếm và bộ lọc ngay */}
        <Route path="/" element={<ProductList />} />

        {/* 2. Nếu vẫn muốn giữ trang Landing cũ, bạn có thể chuyển nó sang đường dẫn /landing */}
        <Route path="/landing" element={<Landing />} />

        {/* 3. Trang chi tiết sản phẩm: Đổi từ :slug thành :id để khớp với dữ liệu int từ MySQL và code Axios */}
        <Route path="/products/:id" element={<ProductDetail />} />
        
        <Route
          path="/about"
          element={
            <div className="container mt-5 text-center">
              <h2>Trang About đang được xây dựng...</h2>
            </div>
          }
        />
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