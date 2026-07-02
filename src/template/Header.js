import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { useState } from "react";

function Header() {
  const [openedDrawer, setOpenedDrawer] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  function toggleDrawer() {
    setOpenedDrawer(!openedDrawer);
  }

  function changeNav() {
    if (openedDrawer) {
      setOpenedDrawer(false);
    }
  }

  function openAuth(mode) {
    setAuthMode(mode);
    setIsAuthOpen(true);
    if (openedDrawer) {
      setOpenedDrawer(false);
    }
  }

  return (
    <header>
      <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/" onClick={changeNav}>
            <FontAwesomeIcon
              icon={["fab", "bootstrap"]}
              className="ms-1"
              size="lg"
            />
            <span className="ms-2 h5 fw-bold text-primary">ElectroShop</span>
          </Link>

          <div className={"navbar-collapse offcanvas-collapse " + (openedDrawer ? "open" : "")}>
            <ul className="navbar-nav me-auto mb-lg-0">
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={changeNav}>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/products" className="nav-link" onClick={changeNav}>
                  Products
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/about" className="nav-link" onClick={changeNav}>
                  About
                </Link>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              <button type="button" className="btn btn-outline-dark d-none d-lg-inline-flex align-items-center">
                <FontAwesomeIcon icon={["fas", "shopping-cart"]} />
                <span className="ms-2 badge rounded-pill bg-dark">0</span>
              </button>
              <button
                type="button"
                className="btn btn-dark rounded-pill px-3"
                onClick={() => openAuth("login")}
              >
                <FontAwesomeIcon icon={["fas", "user-alt"]} />
                <span className="ms-2 d-none d-sm-inline">Sign In</span>
              </button>
            </div>
          </div>

          <div className="d-inline-block d-lg-none">
            <button type="button" className="btn btn-outline-dark">
              <FontAwesomeIcon icon={["fas", "shopping-cart"]} />
              <span className="ms-3 badge rounded-pill bg-dark">0</span>
            </button>
            <button
              className="navbar-toggler p-0 border-0 ms-3"
              type="button"
              onClick={toggleDrawer}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
      </nav>

      {isAuthOpen && (
        <div className="auth-overlay" onClick={() => setIsAuthOpen(false)}>
          <div className="auth-panel" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-0 fw-bold">{authMode === "login" ? "Welcome back" : "Create account"}</h5>
                <p className="text-muted small mb-0">
                  {authMode === "login"
                    ? "Sign in to continue shopping"
                    : "Join ElectroShop in seconds"}
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsAuthOpen(false)}
              ></button>
            </div>

            <div className="auth-tabs mb-3">
              <button
                type="button"
                className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-tab ${authMode === "signup" ? "active" : ""}`}
                onClick={() => setAuthMode("signup")}
              >
                Sign Up
              </button>
            </div>

            <form>
              {authMode === "signup" && (
                <div className="mb-3">
                  <label className="form-label small">Full name</label>
                  <input className="form-control" placeholder="Your name" />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label small">Email</label>
                <input className="form-control" type="email" placeholder="you@example.com" />
              </div>
              <div className="mb-3">
                <label className="form-label small">Password</label>
                <input className="form-control" type="password" placeholder="••••••••" />
              </div>
              <button type="button" className="btn btn-dark w-100 rounded-pill">
                {authMode === "login" ? "Login" : "Create account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;