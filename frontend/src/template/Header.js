import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import logo from "../quyen-pc-logo.png";

const categoryMap = {
  laptop: "laptop",
  "dien-thoai": "dien-thoai",
  "phu-kien": "phu-kien",
  "linh-kien-pc": "linh-kien-pc",
  "man-hinh": "man-hinh",
};

function Header({ setCategory = () => {}, setBrand = () => {} }) {
  const { getTotalItems, cartItems } = useCart();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // State mở/đóng dropdown user
  const [cartCount, setCartCount] = useState(0);
  const categoryDropdownRef = useRef(null);
  const userDropdownRef = useRef(null); // Ref để đóng dropdown user khi click ra ngoài
  
  const navigate = useNavigate();
  const location = useLocation(); 
  const [user, setUser] = useState(null); 

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]); 

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    function handleOutsideClick(event) {
      // Đóng danh mục
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryOpen(false);
      }
      // Đóng dropdown user
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setIsCategoryOpen(false);
        setIsNavOpen(false);
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    setCartCount(getTotalItems());
  }, [cartItems, getTotalItems]);

  function closeMenus() {
    setIsCategoryOpen(false);
    setIsNavOpen(false);
    setIsUserMenuOpen(false);
  }

  function resetProductFilters() {
    setCategory("");
    setBrand("");
    closeMenus();
  }

  function applyCategory(category) {
    setCategory(category);
    setBrand("");
    closeMenus();
  }

  const isAdminOrStaff = user && (user.role_code === "ADMIN" || user.role_code === "STAFF");

  return (
    <header className="eshop-header">
      <div className="eshop-topbar">
        <div className="container-fluid eshop-header-inner">
          <Link to="/" className="eshop-logo" aria-label="Gearxin - Trang chủ">
            <img className="eshop-logo-image" src={logo} alt="Gearxin" />
          </Link>

          <div className="eshop-search">
            <input
              type="text"
              placeholder="Tìm điện thoại, laptop, phụ kiện..."
            />
            <button type="button">
              <FontAwesomeIcon icon={["fas", "search"]} />
            </button>
          </div>

          <div className="eshop-actions">
            <Link to="/contact" className="eshop-action-item">
              <FontAwesomeIcon icon={["fas", "phone-alt"]} />
              <span>Liên hệ</span>
            </Link>

            <Link to="/cart" className="eshop-action-item">
              <FontAwesomeIcon icon={["fas", "shopping-cart"]} />
              <span>Giỏ hàng</span>
              <b>{cartCount}</b>
            </Link>

            {/* --- DROPDOWN TÀI KHOẢN TÍCH HỢP CHỨC NĂNG ADMIN --- */}
            {user ? (
              <div 
                ref={userDropdownRef} 
                className="eshop-action-item position-relative"
                style={{ cursor: 'pointer' }}
              >
                <div 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="d-flex align-items-center gap-2"
                  style={{ color: '#fff', fontSize: '13px' }}
                >
                  <FontAwesomeIcon icon={["fas", "user-check"]} className="text-success" />
                  <span className="fw-medium">{user.email || user.user_full_name}</span>
                  
                  {/* Badge hiển thị Quyền Quản Trị */}
                  {isAdminOrStaff && (
                    <span 
                      className="badge bg-warning text-dark fw-bold px-1 py-1" 
                      style={{ fontSize: '9px', borderRadius: '4px' }}
                    >
                      {user.role_code}
                    </span>
                  )}
                  <FontAwesomeIcon icon={["fas", "chevron-down"]} style={{ fontSize: '10px', opacity: 0.8 }} />
                </div>

                {/* MENU XỔ XUỐNG CỦA USER / ADMIN */}
                {isUserMenuOpen && (
                  <div 
                    className="position-absolute end-0 mt-2 py-2 bg-dark rounded-3 shadow-lg border border-secondary"
                    style={{ minWidth: '220px', zIndex: 1000, top: '100%' }}
                  >
                    {/* CÁC NÚT DÀNH RIÊNG CHO ADMIN & STAFF */}
                    {isAdminOrStaff && (
                      <>
                        <div className="px-3 py-1 text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                          Quản trị hệ thống
                        </div>
                        
                        <Link 
                          to="/admin" 
                          onClick={closeMenus}
                          className="dropdown-item px-3 py-2 text-white fw-bold d-flex align-items-center gap-2"
                          style={{ fontSize: '13px', backgroundColor: '#5b50e0' }}
                        >
                          🛡️ Trang Quản Trị (Admin)
                        </Link>

                        <Link 
                          to="/admin/inventory" 
                          onClick={closeMenus}
                          className="dropdown-item px-3 py-2 text-light d-flex align-items-center gap-2"
                          style={{ fontSize: '13px' }}
                        >
                          🏢 Quản lý Kho & Nhập xuất
                        </Link>

                        <Link 
                          to="/admin/orders" 
                          onClick={closeMenus}
                          className="dropdown-item px-3 py-2 text-light d-flex align-items-center gap-2"
                          style={{ fontSize: '13px' }}
                        >
                          🛒 Quản lý Đơn hàng
                        </Link>

                        <hr className="dropdown-divider border-secondary my-1" />
                      </>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="dropdown-item px-3 py-2 text-danger fw-bold d-flex align-items-center gap-2 bg-transparent border-0 w-100 text-start"
                      style={{ fontSize: '13px' }}
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="eshop-user-btn">
                <FontAwesomeIcon icon={["fas", "user-alt"]} />
                <span>Tài khoản</span>
              </Link>
            )}
            {/* -------------------------------------------------- */}
          </div>

          <button
            type="button"
            className="eshop-mobile-menu-btn"
            aria-label={isNavOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
            aria-controls="eshop-main-navigation"
            aria-expanded={isNavOpen}
            onClick={() => {
              setIsNavOpen((isOpen) => !isOpen);
              setIsCategoryOpen(false);
            }}
          >
            <FontAwesomeIcon icon={["fas", isNavOpen ? "times" : "bars"]} />
          </button>
        </div>
      </div>

      <nav
        id="eshop-main-navigation"
        className={"eshop-nav " + (isNavOpen ? "is-open" : "")}
      >
        <div className="container eshop-nav-inner">
          <div
            ref={categoryDropdownRef}
            className={
              "eshop-category-dropdown " + (isCategoryOpen ? "is-open" : "")
            }
          >
            <button
              type="button"
              className="eshop-category-btn"
              aria-haspopup="true"
              aria-expanded={isCategoryOpen}
              onClick={() => setIsCategoryOpen((isOpen) => !isOpen)}
            >
              <FontAwesomeIcon icon={["fas", "bars"]} />
              <span>Danh mục</span>
              <FontAwesomeIcon
                icon={["fas", "chevron-down"]}
                className="eshop-category-chevron"
              />
            </button>

            <div className="eshop-category-menu">
              <Link to="/products" onClick={resetProductFilters}>Tất cả sản phẩm</Link>
              <Link to="/category/dien-thoai" onClick={() => applyCategory(categoryMap["dien-thoai"])}>Điện thoại</Link>
              <Link to="/category/laptop" onClick={() => applyCategory(categoryMap.laptop)}>Laptop</Link>
              <Link to="/category/phu-kien" onClick={() => applyCategory(categoryMap["phu-kien"])}>Phụ kiện</Link>
              <Link to="/category/linh-kien-pc" onClick={() => applyCategory(categoryMap["linh-kien-pc"])}>Linh kiện PC</Link>
              <Link to="/category/man-hinh" onClick={() => applyCategory(categoryMap["man-hinh"])}>Màn hình</Link>
            </div>
          </div>

          <Link to="/" onClick={closeMenus}>Trang chủ</Link>
          <Link to="/products" onClick={resetProductFilters}>Sản phẩm</Link>
          <Link to="/category/laptop" onClick={() => applyCategory(categoryMap.laptop)}>Laptop</Link>
          <Link to="/category/dien-thoai" onClick={() => applyCategory(categoryMap["dien-thoai"])}>Điện thoại</Link>
          <Link to="/category/phu-kien" onClick={() => applyCategory(categoryMap["phu-kien"])}>Phụ kiện</Link>
          <Link to="/about" onClick={closeMenus}>Giới thiệu</Link>
          <Link to="/contact" className="eshop-nav-mobile-link" onClick={closeMenus}>Liên hệ</Link>
          <Link to="/cart" className="eshop-nav-mobile-link" onClick={closeMenus}>Giỏ hàng ({getTotalItems()})</Link>

          {/* --- MENU TRÊN MOBILE DÀNH CHO ADMIN / USER --- */}
          {user ? (
            <>
              {isAdminOrStaff && (
                <Link 
                  to="/admin" 
                  className="eshop-nav-mobile-link text-warning fw-bold" 
                  onClick={closeMenus}
                >
                  🛡️ Trang Quản Trị (Admin)
                </Link>
              )}
              <button 
                className="eshop-nav-mobile-link" 
                onClick={() => { closeMenus(); handleLogout(); }}
                style={{ background: 'none', border: 'none', textAlign: 'left', color: '#ff4d4d', fontWeight: 'bold', width: '100%', padding: '10px 15px' }}
              >
                Đăng xuất ({user.user_full_name || user.email})
              </button>
            </>
          ) : (
            <Link to="/login" className="eshop-nav-mobile-link" onClick={closeMenus}>
              Tài khoản
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;