import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Thêm 2 hook của React Router
import Product from "./Product";

// CÂY DANH MỤC
export const menuCategories = [
  { id: "dien-thoai", name: "Điện thoại" },
  { id: "laptop", name: "Laptop - Notebook" },
  { id: "phu-kien", name: "Phụ kiện" },
  { id: "linh-kien-pc", name: "Linh kiện PC" },
  { id: "man-hinh", name: "Màn hình" }
];

const brandOptions = [
  "Apple", "Samsung", "Dell", "Asus", "Lenovo", "Xiaomi", "Logitech", "LG"
];

const priceOptions = [
  { value: "", label: "Tất cả mức giá" },
  { value: "duoi10", label: "Dưới 10 triệu" },
  { value: "10den20", label: "Từ 10 - 20 triệu" },
  { value: "tren20", label: "Trên 20 triệu" },
];

function ProductList({ category, setCategory, brand, setBrand }) {
  const [dbProducts, setDbProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priceRange, setPriceRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsTopRef = useRef(null);
  const productsPerPage = 12;

  // --- BẮT ĐẦU PHẦN CODE ĐỒNG BỘ URL ---
  const location = useLocation();
  const navigate = useNavigate();

  // Cắt lấy tên danh mục từ URL (Ví dụ: lấy chữ "dien-thoai" từ "/category/dien-thoai")
  const urlCategory = location.pathname.includes("/category/")
    ? location.pathname.split("/category/")[1]
    : "";

  // Chốt danh mục hiện tại: Ưu tiên URL trước, sau đó đến prop truyền vào
  const activeCategory = urlCategory || category || "";

  // Hàm xử lý khi người dùng click chọn danh mục (Đồng bộ URL ngay lập tức)
  const handleCategoryChange = (newCategoryId) => {
    if (newCategoryId === "") {
      navigate("/products");
    } else {
      navigate(`/category/${newCategoryId}`);
    }
    if (setCategory) setCategory(newCategoryId);
    if (setBrand) setBrand("");
  };
  // -------------------------------------

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3001/api/products");
        const data = await response.json();

        if (Array.isArray(data)) {
          setDbProducts(data);
        } else {
          setDbProducts([]);
        }
      } catch (error) {
        console.error("Lỗi gọi API:", error);
        setDbProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return dbProducts.filter((item) => {
      // SỬ DỤNG activeCategory THAY VÌ category ĐỂ LỌC
      const matchCategory = activeCategory === "" || item.category === activeCategory;
      const matchBrand = brand === "" || item.brand === brand;

      let matchPrice = true;
      if (priceRange === "duoi10") matchPrice = item.price < 10000000;
      else if (priceRange === "10den20") matchPrice = item.price >= 10000000 && item.price <= 20000000;
      else if (priceRange === "tren20") matchPrice = item.price > 20000000;

      return matchCategory && matchBrand && matchPrice;
    });
  }, [dbProducts, activeCategory, brand, priceRange]);

  const categoryCounts = useMemo(() => {
    return dbProducts.reduce((counts, item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
      return counts;
    }, {});
  }, [dbProducts]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const indexOfFirstProduct = (currentPage - 1) * productsPerPage;
  const indexOfLastProduct = indexOfFirstProduct + productsPerPage;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, brand, priceRange]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const currentProductsToShow = useMemo(() => {
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [filteredProducts, indexOfFirstProduct, indexOfLastProduct]);

  const selectedCategoryName = useMemo(() => {
    return menuCategories.find((menu) => menu.id === activeCategory)?.name || "Tất cả sản phẩm";
  }, [activeCategory]);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  function changePage(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    setCurrentPage(safePage);
    window.requestAnimationFrame(() => {
      productsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function resetFilters() {
    navigate("/products");
    if (setCategory) setCategory("");
    if (setBrand) setBrand("");
    setPriceRange("");
  }

  return (
    <div className="product-page container-fluid mb-5 px-3 px-lg-4" ref={productsTopRef}>
      <div className="product-toolbar">
        <div>
          <span className="product-eyebrow">Gearxin Store</span>
          <h1 className="product-page-title">{selectedCategoryName}</h1>
          <p className="product-page-subtitle">
            {filteredProducts.length} sản phẩm phù hợp, hiển thị {currentProductsToShow.length} sản phẩm mỗi trang.
          </p>
        </div>
        <button type="button" className="product-reset-btn" onClick={resetFilters}>
          Xóa lọc
        </button>
      </div>

      <div className="product-filter-panel">
        <label>
          <span>Mức giá</span>
          <select className="form-select" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            {priceOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Loại sản phẩm</span>
          <select className="form-select" value={activeCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
            <option value="">Tất cả danh mục</option>
            {menuCategories.map((menu) => (
              <option key={menu.id} value={menu.id}>{menu.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Thương hiệu</span>
          <select className="form-select" value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">Tất cả thương hiệu</option>
            {brandOptions.map((brandName) => (
              <option key={brandName} value={brandName}>{brandName}</option>
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
                className={`product-category-btn ${activeCategory === "" ? "is-active" : ""}`}
                onClick={() => handleCategoryChange("")}
              >
                <span>Tất cả sản phẩm</span>
                <small>{dbProducts.length}</small>
              </button>
              {menuCategories.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  className={`product-category-btn ${activeCategory === menu.id ? "is-active" : ""}`}
                  onClick={() => handleCategoryChange(menu.id)}
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
                <strong>Trang {currentPage}/{totalPages}</strong>
                <span>
                  Sản phẩm {filteredProducts.length === 0 ? 0 : indexOfFirstProduct + 1}
                  -{Math.min(indexOfLastProduct, filteredProducts.length)} trong {filteredProducts.length}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-5">
                 <div className="spinner-border text-primary" role="status"></div>
                 <p className="mt-2">Đang tải dữ liệu sản phẩm...</p>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 row-cols-xxl-4 g-4 product-grid-page" key={currentPage}>
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
            )}

            {totalPages > 1 && !isLoading && (
              <nav className="product-pagination" aria-label="Phân trang sản phẩm">
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
