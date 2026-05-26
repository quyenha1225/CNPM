import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useHistory } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Header() {
  const [openedDrawer, setOpenedDrawer] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalQuantity } = useCart();
  const history = useHistory();

  function toggleDrawer() {
    setOpenedDrawer(!openedDrawer);
  }

  function changeNav(event) {
    if (openedDrawer) {
      setOpenedDrawer(false);
    }
  }

  function handleLogout() {
    logout();
    changeNav();
    history.push("/");
  }

  return (
    <header>
      <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-white border-bottom">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/" onClick={changeNav}>
            <FontAwesomeIcon
              icon={["fab", "bootstrap"]}
              className="ms-1"
              size="lg"
            />
            <span className="ms-2 h5 fw-bold text-primary">ElectroShop</span>
          </Link>

          <div className={"navbar-collapse offcanvas-collapse " + (openedDrawer ? 'open' : '')}>
            <ul className="navbar-nav me-auto mb-lg-0">
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={changeNav}>Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/products" className="nav-link" onClick={changeNav}>Products</Link>
              </li>
              <li className="nav-item">
                <Link to="/about" className="nav-link" onClick={changeNav}>About</Link>
              </li>
            </ul>
            
            <Link to="/cart" type="button" className="btn btn-outline-dark me-3 d-none d-lg-inline" onClick={changeNav}>
              <FontAwesomeIcon icon={["fas", "shopping-cart"]} />
              <span className="ms-3 badge rounded-pill bg-dark">{getTotalQuantity()}</span>
            </Link>
            
            <ul className="navbar-nav mb-2 mb-lg-0">
              <li className="nav-item dropdown">
                <a
                  href="#!"
                  className="nav-link dropdown-toggle"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FontAwesomeIcon icon={["fas", "user-alt"]} />
                  {isAuthenticated && <span className="ms-2">{user?.name}</span>}
                </a>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="userDropdown"
                >
                  {!isAuthenticated ? (
                    <>
                      <li>
                        <Link to="/login" className="dropdown-item" onClick={changeNav}>
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link to="/register" className="dropdown-item" onClick={changeNav}>
                          Sign Up
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <span className="dropdown-item disabled">{user?.email}</span>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </li>
            </ul>
          </div>

          <div className="d-inline-block d-lg-none">
            <Link to="/cart" type="button" className="btn btn-outline-dark" onClick={changeNav}>
              <FontAwesomeIcon icon={["fas", "shopping-cart"]} />
              <span className="ms-3 badge rounded-pill bg-dark">{getTotalQuantity()}</span>
            </Link>
            <button className="navbar-toggler p-0 border-0 ms-3" type="button" onClick={toggleDrawer}>
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;