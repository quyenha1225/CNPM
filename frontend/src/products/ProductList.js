import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Product from "./Product";

// 1. CÂY DANH MỤC BANNER / SIDEBAR BÊN TRÁI
export const menuCategories = [
  { id: "dien-thoai", name: "Điện thoại" },
  { id: "laptop", name: "Laptop" },
  { id: "phu-kien", name: "Phụ kiện" },
  { id: "linh-kien-pc", name: "Linh kiện PC" },
  { id: "man-hinh", name: "Màn hình" },
];

// 2. MAPPING CHUẨN 100% VỚI DATABASE electroshop_db (1: ĐIỆN THOẠI, 2: LAPTOP, 3: PHỤ KIỆN, 4: LINH KIỆN PC)
const categoryIdToSlug = {
  1: "dien-thoai",
  2: "laptop",
  3: "phu-kien",
  4: "linh-kien-pc",
  "1": "dien-thoai",
  "2": "laptop",
  "3": "phu-kien",
  "4": "linh-kien-pc",
  "dien-thoai": "dien-thoai",
  "laptop": "laptop",
  "phu-kien": "phu-kien",
  "linh-kien-pc": "linh-kien-pc",
  "man-hinh": "man-hinh"
};

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

  const params = useParams();
  const routeCategory = params.category || params.categorySlug;

  // Lắng nghe sự thay đổi URL từ Navbar
  useEffect(() => {
    if (routeCategory) {
      setCategory(routeCategory);
    } else {
      setCategory("");
    }
    setBrand("");
    setPriceRange("");
  }, [routeCategory, setCategory, setBrand]);

  // Load và đồng bộ toàn bộ danh sách sản phẩm từ DB & LocalStorage
  const fetchAllProducts = async () => {
    setLoading(true);
    let apiProducts = [];

    try {
      const res = await fetch("http://localhost:3001/api/products");
      if (res.ok) {
        const data = await res.json();
        apiProducts = Array.isArray(data) ? data : data.products || data.data || [];
      }
    } catch (err) {
      console.warn("API NestJS không phản hồi, tiến hành lấy từ LocalStorage");
    }

    // Đọc sản phẩm lưu thủ công/thêm mới từ Admin thông qua LocalStorage
    const localProducts = JSON.parse(localStorage.getItem('global_products') || '[]');

    // Hợp nhất dữ liệu
    const allRaw = [...apiProducts, ...localProducts];

    // Map dữ liệu SQL sang định dạng chuẩn của React
    const uniqueMap = new Map();
    allRaw.forEach((item) => {
      const pId = Number(item.product_id || item.id);
      if (pId && !uniqueMap.has(pId)) {
        // Lấy category slug dựa vào ID chuẩn từ electroshop_db
        const rawCat = item.category_id || item.category || "dien-thoai";
        const catSlug = categoryIdToSlug[rawCat] || "dien-thoai";

        // Tự động detect thương hiệu nếu trong DB SQL chưa có cột brand
        let detectedBrand = item.brand || "Khác";
        const pName = (item.product_name || item.name || "").toLowerCase();
        if (pName.includes("iphone") || pName.includes("macbook") || pName.includes("apple")) detectedBrand = "Apple";
        else if (pName.includes("samsung") || pName.includes("galaxy")) detectedBrand = "Samsung";
        else if (pName.includes("asus") || pName.includes("rog")) detectedBrand = "ASUS";
        else if (pName.includes("lenovo") || pName.includes("thinkpad")) detectedBrand = "Lenovo";
        else if (pName.includes("hp") || pName.includes("victus") || pName.includes("elitebook")) detectedBrand = "HP";
        else if (pName.includes("acer") || pName.includes("swift")) detectedBrand = "Acer";
        else if (pName.includes("msi")) detectedBrand = "MSI";
        else if (pName.includes("xiaomi")) detectedBrand = "Xiaomi";
        else if (pName.includes("oppo")) detectedBrand = "Oppo";
        else if (pName.includes("logitech")) detectedBrand = "Logitech";
        else if (pName.includes("razer")) detectedBrand = "Razer";
        else if (pName.includes("corsair")) detectedBrand = "Corsair";

        // Xử lý ảnh sản phẩm (Ưu tiên ảnh từ product_images table)
        let imgUrl = item.image_url || item.image || "";
        if (!imgUrl && Array.isArray(item.product_images) && item.product_images.length > 0) {
          imgUrl = item.product_images[0].image_url;
        }
        if (!imgUrl) {
          imgUrl = "https://via.placeholder.com/300";
        }

        uniqueMap.set(pId, {
          id: pId,
          product_id: pId,
          name: item.product_name || item.name || "Sản phẩm",
          product_name: item.product_name || item.name || "Sản phẩm",
          price: Number(item.base_price || item.price || 0),
          base_price: Number(item.base_price || item.price || 0),
          image: imgUrl,
          image_url: imgUrl,
          category: catSlug,
          brand: detectedBrand,
          slug: item.product_slug || item.slug || ""
        });
      }
    });

    // Sắp xếp ID từ mới nhất đến cũ hơn hoặc theo thứ tự tăng dần
    const normalizedList = Array.from(uniqueMap.values()).sort((a, b) => a.id - b.id);
    setProducts(normalizedList);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllProducts();

    // 💡 Đồng bộ Real-Time khi thêm sản phẩm bên trang Admin
    const handleSync = () => fetchAllProducts();
    window.addEventListener("storage", handleSync);
    window.addEventListener("products_updated", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("products_updated", handleSync);
    };
  }, []);

  // Danh sách thương hiệu tự động
  const availableBrands = useMemo(() => {
    const brandsInDb = products
      .map((item) => item.brand)
      .filter((brandName) => brandName && brandName.trim() !== "");

    return Array.from(new Set(brandsInDb)).sort();
  }, [products]);

  // Bộ lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory = category === "" || item.category === category;

      const matchBrand =
        brand === "" ||
        (item.brand &&
          item.brand.trim().toLowerCase() === brand.trim().toLowerCase());

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

  // Đếm số lượng sản phẩm mỗi danh mục
  const categoryCounts = useMemo(() => {
    return products.reduce((counts, item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
      return counts;
    }, {});
  }, [products]);

  // Phân trang
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage)
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
        <p className="mt-2">Đang đồng bộ dữ liệu với electroshop_db...</p>
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