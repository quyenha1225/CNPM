import Template from "./template/Template";
import ProductDetail from "./products/detail/ProductDetail";
import { Routes, Route } from "react-router-dom";
import Landing from "./landing/Landing";
import ProductList from "./products/ProductList";

function App() {
  return (
    <Template>
      <Routes>
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/" element={<Landing />} />
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