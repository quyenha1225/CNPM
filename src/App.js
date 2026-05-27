import Template from "./template/Template";
import ProductDetail from "./products/detail/ProductDetail";
import { Routes, Route } from "react-router-dom";
import Landing from "./landing/Landing";
import ProductList from "./products/ProductList";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Cart from "./pages/cart/Cart";
import Payment from "./pages/payment/Payment";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
<<<<<<< HEAD
    <AuthProvider>
      <CartProvider>
        <Template>
          <Switch>
            <Route path="/products" exact>
              <ProductList />
            </Route>
            <Route path="/products/:slug">
              <ProductDetail />
            </Route>
            <Route path="/login" exact>
              <Login />
            </Route>
            <Route path="/register" exact>
              <Register />
            </Route>
            <Route path="/cart" exact>
              <Cart />
            </Route>
            <Route path="/payment" exact>
              <Payment />
            </Route>
            <Route path="/" exact>
              <Landing />
            </Route>
          </Switch>
        </Template>
      </CartProvider>
    </AuthProvider>
=======
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
>>>>>>> origin/quyen/admin
  );
}

export default App;