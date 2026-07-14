import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Product from "./Product";

// 1. CÂY DANH MỤC SIDEBAR BÊN TRÁI - Đồng bộ chuẩn 100% với category_slug dưới Database
export const menuCategories = [
  { id: "dien-thoai", name: "Điện thoại" },
  { id: "laptop", name: "Laptop" },
  { id: "phu-kien", name: "Phụ kiện" },
  { id: "linh-kien-pc", name: "Linh kiện PC" },
  { id: "man-hinh", name: "Màn hình" },
];

// Định nghĩa các khoảng giá lọc mới theo yêu cầu của bạn
const priceOptions = [
  { value: "", label: "Tất cả mức giá" },
  { value: "duoi10", label: "Dưới 10 triệu" },
  { value: "10den20", label: "Từ 10 - 20 triệu" },
  { value: "20den30", label: "Từ 20 - 30 triệu" },
  { value: "30den40", label: "Từ 30 - 40 triệu" },
  { value: "tren40", label: "Trên 40 triệu" },
];

function ProductList({ category, setCategory, brand, setBrand }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsTopRef = useRef(null);
  const productsPerPage = 12;

  // Đọc danh mục đang chạy từ thanh URL trình duyệt (Hỗ trợ định dạng Route của dự án)
  const params = useParams();
  const routeCategory = params.category || params.categorySlug;

  // Lắng nghe sự thay đổi của URL từ thanh Navbar để đồng bộ bộ lọc
  useEffect(() => {
    if (routeCategory) {
      setCategory(routeCategory);
    } else {
      setCategory("");
    }
    setBrand("");
    setPriceRange("");
  }, [routeCategory, setCategory, setBrand]);

  // Lấy dữ liệu trực tiếp từ Backend API (NestJS - PORT 3001)
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3001/api/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Không thể tải danh sách sản phẩm!");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // TỰ ĐỘNG GOM THƯƠNG HIỆU: Chỉ hiển thị các hãng đang có sản phẩm thực tế trong DB
  // Giúp danh sách ngắn gọn, luôn xổ xuống (Dropdown) cực kỳ ngăn nắp
  const availableBrands = useMemo(() => {
    const brandsInDb = products
      .map((item) => item.brand)
      .filter((brandName) => brandName && brandName.trim() !== "");

    // Loại bỏ các hãng trùng lặp và sắp xếp theo bảng chữ cái A-Z
    return Array.from(new Set(brandsInDb)).sort();
  }, [products]);

  // Logic lọc sản phẩm tổng hợp (Lọc theo Category + Brand + Giá)
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Khớp danh mục
      const matchCategory = category === "" || item.category === category;

      // 2. Khớp thương hiệu (Chuyển về chữ thường để loại bỏ hoàn toàn lỗi lệch chữ hoa/thường)
      const matchBrand =
        brand === "" ||
        (item.brand &&
          item.brand.trim().toLowerCase() === brand.trim().toLowerCase());

      // 3. Khớp khoảng giá mới
      let matchPrice = true;
      if (priceRange === "duoi10") {
        matchPrice = item.price < 10000000;
      } else if (priceRange === "10den20") {
        matchPrice = item.price >= 10000000 && item.price <= 20000000;
      } else if (priceRange === "20den30") {
        matchPrice = item.price >= 20000000 && item.price <= 30000000;
      } else if (priceRange === "30den40") {
        matchPrice = item.price >= 30000000 && item.price <= 40000000;
      } else if (priceRange === "tren40") {
        matchPrice = item.price > 40000000;
      }

      return matchCategory && matchBrand && matchPrice;
    });
  }, [products, category, brand, priceRange]);

  // Tính số lượng sản phẩm cho từng danh mục ở menu bên trái
  const categoryCounts = useMemo(() => {
    return products.reduce((counts, item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
      return counts;
    }, {});
  }, [products]);

  // Phân trang
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage),
  );
  const indexOfFirstProduct = (currentPage - 1) * productsPerPage;
  const indexOfLastProduct = indexOfFirstProduct + productsPerPage;

  useEffect(() => {
    setCurrentPage(1);
  }, [category, brand, priceRange]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const currentProductsToShow = useMemo(() => {
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [filteredProducts, indexOfFirstProduct, indexOfLastProduct]);

  const selectedCategoryName = useMemo(() => {
    return (
      menuCategories.find((menu) => menu.id === category)?.name ||
      "Tất cả sản phẩm"
    );
  }, [category]);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  function changePage(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    setCurrentPage(safePage);

    window.requestAnimationFrame(() => {
      productsTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function resetFilters() {
    setCategory("");
    setBrand("");
    setPriceRange("");
  }

  if (loading) {
    return (
      <div className="container text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-2">Đang tải danh sách sản phẩm từ máy chủ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center my-5 py-5 text-danger">
        <h4>Đã xảy ra lỗi khi lấy dữ liệu:</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      className="product-page container-fluid mb-5 px-3 px-lg-4"
      ref={productsTopRef}
    >
      <div className="product-toolbar">
        <div>
          <span className="product-eyebrow">Gearxin Store</span>
          <h1 className="product-page-title">{selectedCategoryName}</h1>
          <p className="product-page-subtitle">
            {filteredProducts.length} sản phẩm phù hợp, hiển thị{" "}
            {currentProductsToShow.length} sản phẩm mỗi trang.
          </p>
        </div>

        <button
          type="button"
          className="product-reset-btn"
          onClick={resetFilters}
        >
          Xóa lọc
        </button>
      </div>

      <div className="product-filter-panel">
        {/* Bộ lọc mức giá */}
        <label>
          <span>Mức giá</span>
          <select
            className="form-select"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          >
            {priceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {/* Bộ lọc loại sản phẩm */}
        <label>
          <span>Loại sản phẩm</span>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {menuCategories.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.name}
              </option>
            ))}
          </select>
        </label>

        {/* Bộ lọc thương hiệu thông minh (Dynamic Brands) */}
        <label>
          <span>Thương hiệu</span>
          <select
            className="form-select"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">Tất cả thương hiệu</option>
            {availableBrands.map((brandName) => (
              <option key={brandName} value={brandName}>
                {brandName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="row g-4 product-content-row">
        <div className="col-lg-3">
          <aside className="product-sidebar">
            <div className="product-sidebar-title">Danh mục</div>
            <div className="product-category-list">
              <button
                type="button"
                className={`product-category-btn ${category === "" ? "is-active" : ""}`}
                onClick={() => {
                  setCategory("");
                  setBrand("");
                }}
              >
                <span>Tất cả sản phẩm</span>
                <small>{products.length}</small>
              </button>

              {menuCategories.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  className={`product-category-btn ${category === menu.id ? "is-active" : ""}`}
                  onClick={() => {
                    setCategory(menu.id);
                    setBrand("");
                  }}
                >
                  <span>{menu.name}</span>
                  <small>{categoryCounts[menu.id] || 0}</small>
                </button>
              ))}
            </div>
          </aside>
        </div>

        <div className="col-lg-9">
          <div className="product-grid-shell">
            <div className="product-grid-head">
              <div>
                <strong>
                  Trang {currentPage}/{totalPages}
                </strong>
                <span>
                  Sản phẩm{" "}
                  {filteredProducts.length === 0 ? 0 : indexOfFirstProduct + 1}-
                  {Math.min(indexOfLastProduct, filteredProducts.length)} trong{" "}
                  {filteredProducts.length}
                </span>
              </div>
            </div>

            <div
              className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 row-cols-xxl-4 g-4 product-grid-page"
              key={currentPage}
            >
              {currentProductsToShow.length > 0 ? (
                currentProductsToShow.map((item, index) => (
                  <Product key={item.id} data={item} itemIndex={index} />
                ))
              ) : (
                <div className="col-12">
                  <div className="product-empty-state">
                    <strong>Không tìm thấy sản phẩm</strong>
                    <p>Hãy thử đổi mức giá, danh mục hoặc thương hiệu khác.</p>
                  </div>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <nav
                className="product-pagination"
                aria-label="Phân trang sản phẩm"
              >
                <button
                  type="button"
                  className="product-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => changePage(currentPage - 1)}
                >
                  Trước
                </button>

                <div className="product-page-numbers">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`product-page-dot ${page === currentPage ? "is-active" : ""}`}
                      onClick={() => changePage(page)}
                      aria-label={`Trang ${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="product-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => changePage(currentPage + 1)}
                >
                  Sau
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;
