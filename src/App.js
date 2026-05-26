import Template from "./template/Template";
import ProductDetail from "./products/detail/ProductDetail";
import { Switch, Route } from "react-router-dom";
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
  );
}

export default App;
