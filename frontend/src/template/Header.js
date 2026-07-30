import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import logo from "../quyen-pc-logo.png";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const categories = [
  {
    id: "dien-thoai",
    label: "Điện thoại",
    icon: "mobile-alt",
  },
  {
    id: "laptop",
    label: "Laptop",
    icon: "laptop",
  },
  {
    id: "phu-kien",
    label: "Phụ kiện",
    icon: "keyboard",
  },
  {
    id: "linh-kien-pc",
    label: "Linh kiện PC",
    icon: "microchip",
  },
  {
    id: "man-hinh",
    label: "Màn hình",
    icon: "tv",
  },
];

function getUserDisplayName(user) {
  const name =
    user?.name ||
    user?.fullName ||
    user?.user_full_name ||
    user?.userFullName ||
    "";

  if (name.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts.slice(-2).join(" ");
  }

  return user?.email || user?.user_email || "Tài khoản";
}

function Header({
  setCategory = () => {},
  setBrand = () => {},
}) {
  const navigate = useNavigate();
  const categoryRef = useRef(null);
  const accountRef = useRef(null);
  const searchInputRef = useRef(null);

  const auth = useAuth();
  const { cartItems, getTotalItems } = useCart();

  const user = auth?.user || null;
  const isAuthenticated =
    typeof auth?.isAuthenticated === "boolean"
      ? auth.isAuthenticated
      : Boolean(user || auth?.token);
  const authLoading = Boolean(
    auth?.sessionLoading ?? auth?.loading ?? false
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    try {
      setCartCount(Number(getTotalItems?.() || 0));
    } catch {
      setCartCount(0);
    }
  }, [cartItems, getTotalItems]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target)
      ) {
        setIsCategoryOpen(false);
      }

      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setIsAccountOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsCategoryOpen(false);
        setIsAccountOpen(false);
        setIsNavOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function closeMenus() {
    setIsCategoryOpen(false);
    setIsAccountOpen(false);
    setIsNavOpen(false);
  }

  function resetProductFilters() {
    setCategory("");
    setBrand("");
    closeMenus();
  }

  function applyCategory(categoryId) {
    setCategory(categoryId);
    setBrand("");
    closeMenus();
  }

  async function handleAiSearch(event) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (query.length < 2) {
      setSearchError(
        "Hãy mô tả sản phẩm cần tìm bằng ít nhất 2 ký tự."
      );
      searchInputRef.current?.focus();
      return;
    }

    setSearchError("");
    setIsSearching(true);

    try {
      const customerId =
        user?.id ??
        user?.userId ??
        user?.user_id ??
        null;

      const requestBody = {
        query,
        limit: 10,
      };

      if (customerId) {
        requestBody.customerId = Number(customerId);
      }

      const response = await fetch(`${API_BASE}/ai/search`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.detail ||
            data.message ||
            "AI Search chưa thể xử lý yêu cầu.";

        throw new Error(message);
      }

      sessionStorage.setItem(
        "aiSearchResult",
        JSON.stringify(data)
      );

      navigate(`/ai-search?search=${Date.now()}`, {
        replace: true,
        state: {
          aiSearchResult: data,
          result: data,
          query,
        },
      });

      closeMenus();
    } catch (error) {
      setSearchError(
        error instanceof Error
          ? error.message
          : "Không thể kết nối tới máy chủ."
      );
    } finally {
      setIsSearching(false);
    }
  }

  async function handleLogout() {
    try {
      await Promise.resolve(auth?.logout?.());
    } finally {
      closeMenus();
      navigate("/");
    }
  }

  const navClassName = ({ isActive }) =>
    `gx-header__nav-link ${isActive ? "is-active" : ""}`;

  return (
    <header
      className={`gx-header ${
        isNavOpen ? "is-mobile-open" : ""
      }`}
    >
      <div className="gx-header__visual" aria-hidden="true">
        <span className="gx-header__orb gx-header__orb--one" />
        <span className="gx-header__orb gx-header__orb--two" />
        <span className="gx-header__scan" />
      </div>

      <div className="gx-header__ticker">
        <div className="gx-header__ticker-track">
          <span>
            <b>AI Search</b> tư vấn cấu hình theo đúng nhu cầu
          </span>
          <span>
            <b>Dữ liệu thật</b> đồng bộ từ sản phẩm và đơn hàng
          </span>
          <span>
            <b>Gearxin</b> công nghệ chính hãng, hỗ trợ tận tâm
          </span>
          <span aria-hidden="true">
            <b>AI Search</b> tư vấn cấu hình theo đúng nhu cầu
          </span>
          <span aria-hidden="true">
            <b>Dữ liệu thật</b> đồng bộ từ sản phẩm và đơn hàng
          </span>
          <span aria-hidden="true">
            <b>Gearxin</b> công nghệ chính hãng, hỗ trợ tận tâm
          </span>
        </div>
      </div>

      <div className="gx-header__main">
        <div className="container-fluid gx-header__main-inner">
          <Link
            to="/"
            className="gx-header__brand"
            onClick={closeMenus}
            aria-label="Gearxin - Trang chủ"
          >
            <span className="gx-header__brand-logo">
              <img src={logo} alt="Gearxin" />
            </span>
            <span className="gx-header__brand-copy">
              <strong>GEARXIN</strong>
              <small>Technology Store</small>
            </span>
          </Link>

          <div className="gx-header__search-area">
            <form
              className="gx-header__search"
              onSubmit={handleAiSearch}
            >
              <span className="gx-header__ai-label">
                <FontAwesomeIcon icon={["fas", "robot"]} />
                AI
              </span>

              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  if (searchError) {
                    setSearchError("");
                  }
                }}
                placeholder="Ví dụ: laptop học IT dưới 20 triệu, RAM 16GB..."
                aria-label="Tìm kiếm sản phẩm bằng AI"
                disabled={isSearching}
              />

              <button
                type="submit"
                disabled={isSearching}
                aria-label={
                  isSearching
                    ? "AI đang phân tích"
                    : "Tìm kiếm bằng AI"
                }
              >
                <FontAwesomeIcon
                  icon={["fas", isSearching ? "spinner" : "search"]}
                  spin={isSearching}
                />
                <span>
                  {isSearching ? "Đang phân tích" : "Tìm kiếm"}
                </span>
              </button>
            </form>

            {searchError && (
              <div
                className="gx-header__search-error"
                role="alert"
              >
                {searchError}
              </div>
            )}
          </div>

          <div className="gx-header__actions">
            <Link
              to="/contact"
              className="gx-header__action"
              onClick={closeMenus}
            >
              <span className="gx-header__action-icon">
                <FontAwesomeIcon icon={["fas", "phone-alt"]} />
              </span>
              <span className="gx-header__action-copy">
                <small>Hỗ trợ</small>
                <strong>Liên hệ</strong>
              </span>
            </Link>

            <Link
              to="/cart"
              className="gx-header__action gx-header__cart"
              onClick={closeMenus}
            >
              <span className="gx-header__action-icon">
                <FontAwesomeIcon
                  icon={["fas", "shopping-cart"]}
                />
                <b>{cartCount}</b>
              </span>
              <span className="gx-header__action-copy">
                <small>Sản phẩm</small>
                <strong>Giỏ hàng</strong>
              </span>
            </Link>

            <div
              ref={accountRef}
              className="gx-header__account"
            >
              <button
                type="button"
                className="gx-header__account-trigger"
                onClick={() => {
                  setIsAccountOpen((value) => !value);
                  setIsCategoryOpen(false);
                }}
                disabled={authLoading}
                aria-expanded={isAccountOpen}
              >
                <span className="gx-header__avatar">
                  <FontAwesomeIcon icon={["fas", "user-alt"]} />
                </span>
                <span className="gx-header__account-copy">
                  <small>
                    {isAuthenticated ? "Xin chào" : "Tài khoản"}
                  </small>
                  <strong>
                    {authLoading
                      ? "Đang tải..."
                      : isAuthenticated
                        ? getUserDisplayName(user)
                        : "Đăng nhập"}
                  </strong>
                </span>
                <FontAwesomeIcon
                  className="gx-header__account-chevron"
                  icon={["fas", "chevron-down"]}
                />
              </button>

              {isAccountOpen && (
                <div className="gx-header__account-menu">
                  {isAuthenticated ? (
                    <>
                      <div className="gx-header__account-summary">
                        <strong>
                          {getUserDisplayName(user)}
                        </strong>
                        <small>
                          {user?.email ||
                            user?.user_email ||
                            "Tài khoản Gearxin"}
                        </small>
                      </div>

                      <button
                        type="button"
                        onClick={handleLogout}
                      >
                        <FontAwesomeIcon
                          icon={["fas", "sign-out-alt"]}
                        />
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={closeMenus}
                      >
                        <FontAwesomeIcon
                          icon={["fas", "sign-in-alt"]}
                        />
                        Đăng nhập
                      </Link>

                      <Link
                        to="/register"
                        onClick={closeMenus}
                      >
                        <FontAwesomeIcon
                          icon={["fas", "user-plus"]}
                        />
                        Tạo tài khoản
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="gx-header__mobile-toggle"
              onClick={() => {
                setIsNavOpen((value) => !value);
                setIsCategoryOpen(false);
                setIsAccountOpen(false);
              }}
              aria-label={
                isNavOpen
                  ? "Đóng menu điều hướng"
                  : "Mở menu điều hướng"
              }
              aria-expanded={isNavOpen}
            >
              <FontAwesomeIcon
                icon={["fas", isNavOpen ? "times" : "bars"]}
              />
            </button>
          </div>
        </div>
      </div>

      <nav className="gx-header__nav">
        <div className="container gx-header__nav-inner">
          <div
            ref={categoryRef}
            className={`gx-header__category ${
              isCategoryOpen ? "is-open" : ""
            }`}
          >
            <button
              type="button"
              className="gx-header__category-trigger"
              onClick={() => {
                setIsCategoryOpen((value) => !value);
                setIsAccountOpen(false);
              }}
              aria-expanded={isCategoryOpen}
            >
              <FontAwesomeIcon icon={["fas", "bars"]} />
              <span>Danh mục sản phẩm</span>
              <FontAwesomeIcon
                className="gx-header__category-chevron"
                icon={["fas", "chevron-down"]}
              />
            </button>

            <div className="gx-header__category-menu">
              <Link
                to="/products"
                onClick={resetProductFilters}
              >
                <span>
                  <FontAwesomeIcon icon={["fas", "th-large"]} />
                </span>
                <div>
                  <strong>Tất cả sản phẩm</strong>
                  <small>Khám phá toàn bộ cửa hàng</small>
                </div>
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  onClick={() => applyCategory(category.id)}
                >
                  <span>
                    <FontAwesomeIcon
                      icon={["fas", category.icon]}
                    />
                  </span>
                  <div>
                    <strong>{category.label}</strong>
                    <small>
                      Sản phẩm {category.label.toLowerCase()}
                    </small>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="gx-header__nav-links">
            <NavLink
              to="/"
              end
              className={navClassName}
              onClick={closeMenus}
            >
              Trang chủ
            </NavLink>

            <NavLink
              to="/products"
              className={navClassName}
              onClick={resetProductFilters}
            >
              Sản phẩm
            </NavLink>

            <NavLink
              to="/category/laptop"
              className={navClassName}
              onClick={() => applyCategory("laptop")}
            >
              Laptop
            </NavLink>

            <NavLink
              to="/category/dien-thoai"
              className={navClassName}
              onClick={() => applyCategory("dien-thoai")}
            >
              Điện thoại
            </NavLink>

            <NavLink
              to="/category/phu-kien"
              className={navClassName}
              onClick={() => applyCategory("phu-kien")}
            >
              Phụ kiện
            </NavLink>

            <NavLink
              to="/about"
              className={navClassName}
              onClick={closeMenus}
            >
              Giới thiệu
            </NavLink>

            <NavLink
              to="/ai-search"
              className={({ isActive }) =>
                `gx-header__nav-link gx-header__nav-ai ${
                  isActive ? "is-active" : ""
                }`
              }
              onClick={closeMenus}
            >
              <FontAwesomeIcon icon={["fas", "robot"]} />
              AI Search
            </NavLink>
          </div>

          <div className="gx-header__nav-trust">
            <span />
            Hệ thống đang hoạt động
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
