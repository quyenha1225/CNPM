import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import logo from "../quyen-pc-logo.png";

// Map chuẩn khớp 100% với category_slug trong MySQL và menuCategories ở ProductList
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
  const [cartCount, setCartCount] = useState(0);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    function closeCategoryMenu(event) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryOpen(false);
      }
    }

    function closeCategoryMenuOnEscape(event) {
      if (event.key === "Escape") {
        setIsCategoryOpen(false);
        setIsNavOpen(false);
      }
    }

    document.addEventListener("mousedown", closeCategoryMenu);
    document.addEventListener("keydown", closeCategoryMenuOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeCategoryMenu);
      document.removeEventListener("keydown", closeCategoryMenuOnEscape);
    };
  }, []);

  useEffect(() => {
    setCartCount(getTotalItems());
  }, [cartItems, getTotalItems]);

  function closeMenus() {
    setIsCategoryOpen(false);
    setIsNavOpen(false);
  }

  function resetProductFilters() {
    setCategory("");
    setBrand("");
    closeMenus();
  }

  // Cập nhật trực tiếp slug gốc dạng chữ thường gạch ngang
  function applyCategory(category) {
    setCategory(category);
    setBrand("");
    closeMenus();
  }

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

            <Link to="/login" className="eshop-user-btn">
              <FontAwesomeIcon icon={["fas", "user-alt"]} />
              <span>Tài khoản</span>
            </Link>
          </div>

          <button
            type="button"
            className="eshop-mobile-menu-btn"
            aria-label={
              isNavOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"
            }
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
              <Link to="/products" onClick={resetProductFilters}>
                Tất cả sản phẩm
              </Link>
              <Link
                to="/category/dien-thoai"
                onClick={() => applyCategory(categoryMap["dien-thoai"])}
              >
                Điện thoại
              </Link>
              <Link
                to="/category/laptop"
                onClick={() => applyCategory(categoryMap.laptop)}
              >
                Laptop
              </Link>
              <Link
                to="/category/phu-kien"
                onClick={() => applyCategory(categoryMap["phu-kien"])}
              >
                Phụ kiện
              </Link>
              <Link
                to="/category/linh-kien-pc"
                onClick={() => applyCategory(categoryMap["linh-kien-pc"])}
              >
                Linh kiện PC
              </Link>
              <Link
                to="/category/man-hinh"
                onClick={() => applyCategory(categoryMap["man-hinh"])}
              >
                Màn hình
              </Link>
            </div>
          </div>

          <Link to="/" onClick={closeMenus}>
            Trang chủ
          </Link>
          <Link to="/products" onClick={resetProductFilters}>
            Sản phẩm
          </Link>
          <Link
            to="/category/laptop"
            onClick={() => applyCategory(categoryMap.laptop)}
          >
            Laptop
          </Link>
          <Link
            to="/category/dien-thoai"
            onClick={() => applyCategory(categoryMap["dien-thoai"])}
          >
            Điện thoại
          </Link>
          <Link
            to="/category/phu-kien"
            onClick={() => applyCategory(categoryMap["phu-kien"])}
          >
            Phụ kiện
          </Link>
          <Link to="/about" onClick={closeMenus}>
            Giới thiệu
          </Link>
          <Link
            to="/contact"
            className="eshop-nav-mobile-link"
            onClick={closeMenus}
          >
            Liên hệ
          </Link>
          <Link
            to="/cart"
            className="eshop-nav-mobile-link"
            onClick={closeMenus}
          >
            Giỏ hàng ({getTotalItems()})
          </Link>
          <Link
            to="/login"
            className="eshop-nav-mobile-link"
            onClick={closeMenus}
          >
            Tài khoản
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
