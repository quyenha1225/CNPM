import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "react-router-dom";
import Product from "./Product";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const menuCategories = [
  { id: "dien-thoai", name: "Điện thoại", icon: "mobile-alt" },
  { id: "laptop", name: "Laptop", icon: "laptop" },
  { id: "phu-kien", name: "Phụ kiện", icon: "headphones" },
  { id: "linh-kien-pc", name: "Linh kiện PC", icon: "microchip" },
  { id: "man-hinh", name: "Màn hình", icon: "desktop" },
];

const priceOptions = [
  { value: "", label: "Tất cả mức giá", min: "", max: "" },
  { value: "under10", label: "Dưới 10 triệu", min: "", max: 10000000 },
  {
    value: "10to20",
    label: "Từ 10 - 20 triệu",
    min: 10000000,
    max: 20000000,
  },
  {
    value: "20to30",
    label: "Từ 20 - 30 triệu",
    min: 20000000,
    max: 30000000,
  },
  {
    value: "30to40",
    label: "Từ 30 - 40 triệu",
    min: 30000000,
    max: 40000000,
  },
  { value: "over40", label: "Trên 40 triệu", min: 40000000, max: "" },
];

function createPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const values = new Set([
    1,
    2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    totalPages - 1,
    totalPages,
  ]);

  const sorted = Array.from(values)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const result = [];

  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) {
      result.push(`ellipsis-${value}`);
    }
    result.push(value);
  });

  return result;
}

function ProductList({ category, setCategory, brand, setBrand }) {
  const params = useParams();
  const productsTopRef = useRef(null);
  const routeCategory = params.category || params.categorySlug || "";

  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState({
    totalProducts: 0,
    categories: [],
    brands: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCategory(routeCategory);
    setBrand("");
    setPriceRange("");
    setCurrentPage(1);
  }, [routeCategory, setCategory, setBrand]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const price = priceOptions.find((item) => item.value === priceRange);

    const query = new URLSearchParams({
      page: String(currentPage),
      limit: "12",
      sort: sortBy,
    });

    if (category) query.set("category", category);
    if (brand) query.set("brand", brand);
    if (debouncedSearch) query.set("search", debouncedSearch);
    if (price?.min !== "" && price?.min !== undefined) {
      query.set("minPrice", String(price.min));
    }
    if (price?.max !== "" && price?.max !== undefined) {
      query.set("maxPrice", String(price.max));
    }

    async function loadCatalog() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE}/products/catalog?${query.toString()}`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            Array.isArray(data.message)
              ? data.message.join(", ")
              : data.message || "Không thể tải danh sách sản phẩm",
          );
        }

        setProducts(Array.isArray(data.data) ? data.data : []);
        setPagination(
          data.pagination || {
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 1,
          },
        );
        setFacets(
          data.facets || {
            totalProducts: 0,
            categories: [],
            brands: [],
          },
        );
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message);
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadCatalog();

    return () => controller.abort();
  }, [
    currentPage,
    category,
    brand,
    priceRange,
    sortBy,
    debouncedSearch,
  ]);

  const selectedCategoryName = useMemo(
    () =>
      menuCategories.find((item) => item.id === category)?.name ||
      "Tất cả sản phẩm",
    [category],
  );

  const paginationItems = useMemo(
    () =>
      createPaginationItems(
        Number(pagination.page || 1),
        Number(pagination.totalPages || 1),
      ),
    [pagination.page, pagination.totalPages],
  );

  const categoryCounts = useMemo(() => {
    return Object.fromEntries(
      (facets.categories || []).map((item) => [
        item.slug,
        Number(item.productCount || 0),
      ]),
    );
  }, [facets.categories]);

  function resetFilters() {
    setCategory("");
    setBrand("");
    setPriceRange("");
    setSortBy("newest");
    setSearch("");
    setCurrentPage(1);
  }

  function changePage(nextPage) {
    const safePage = Math.min(
      Math.max(Number(nextPage), 1),
      Number(pagination.totalPages || 1),
    );

    setCurrentPage(safePage);

    window.requestAnimationFrame(() => {
      productsTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  const firstItem =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  return (
    <main
      className="product-page container-fluid px-3 px-lg-4"
      ref={productsTopRef}
    >
      <section className="product-toolbar product-toolbar--premium">
        <div>
          <span className="product-eyebrow">Gearxin Technology Store</span>
          <h1 className="product-page-title">{selectedCategoryName}</h1>
          <p className="product-page-subtitle">
            Dữ liệu được lọc và phân trang trực tiếp từ backend.
          </p>
        </div>

        <button
          type="button"
          className="product-reset-btn"
          onClick={resetFilters}
        >
          <FontAwesomeIcon icon={["fas", "undo"]} />
          Xóa bộ lọc
        </button>
      </section>

      <section className="product-filter-panel product-filter-panel--premium">
        <label className="product-search-filter">
          <span>Tìm trong danh sách</span>
          <div>
            <FontAwesomeIcon icon={["fas", "search"]} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tên sản phẩm, thương hiệu..."
            />
          </div>
        </label>

        <label>
          <span>Mức giá</span>
          <select
            className="form-select"
            value={priceRange}
            onChange={(event) => {
              setPriceRange(event.target.value);
              setCurrentPage(1);
            }}
          >
            {priceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Thương hiệu</span>
          <select
            className="form-select"
            value={brand}
            onChange={(event) => {
              setBrand(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả thương hiệu</option>
            {(facets.brands || []).map((item) => (
              <option key={item.id} value={item.name}>
                {item.name} ({item.productCount})
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Sắp xếp</span>
          <select
            className="form-select"
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="newest">Mới nhất</option>
            <option value="bestSelling">Bán chạy nhất</option>
            <option value="rating">Đánh giá cao nhất</option>
            <option value="reviews">Nhiều đánh giá nhất</option>
            <option value="priceAsc">Giá tăng dần</option>
            <option value="priceDesc">Giá giảm dần</option>
          </select>
        </label>
      </section>

      <div className="row g-4 product-content-row">
        <div className="col-lg-3 col-xl-2">
          <aside className="product-sidebar product-sidebar--premium">
            <div className="product-sidebar-title">
              <span>
                <FontAwesomeIcon icon={["fas", "layer-group"]} />
                Danh mục
              </span>
              <small>{facets.totalProducts} sản phẩm</small>
            </div>

            <div className="product-category-list">
              <button
                type="button"
                className={`product-category-btn ${category === "" ? "is-active" : ""}`}
                onClick={() => {
                  setCategory("");
                  setBrand("");
                  setCurrentPage(1);
                }}
              >
                <span className="product-category-main">
                  <i>
                    <FontAwesomeIcon icon={["fas", "border-all"]} />
                  </i>
                  Tất cả sản phẩm
                </span>
                <small>{facets.totalProducts}</small>
              </button>

              {menuCategories.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  className={`product-category-btn ${category === menu.id ? "is-active" : ""}`}
                  onClick={() => {
                    setCategory(menu.id);
                    setBrand("");
                    setCurrentPage(1);
                  }}
                >
                  <span className="product-category-main">
                    <i>
                      <FontAwesomeIcon icon={["fas", menu.icon]} />
                    </i>
                    {menu.name}
                  </span>
                  <small>{categoryCounts[menu.id] || 0}</small>
                </button>
              ))}
            </div>
          </aside>
        </div>

        <div className="col-lg-9 col-xl-10">
          <section className="product-grid-shell product-grid-shell--premium">
            <header className="product-grid-head">
              <div>
                <strong>
                  Trang {pagination.page}/{pagination.totalPages}
                </strong>
                <span>
                  Hiển thị {firstItem}-{lastItem} trong {pagination.total} sản phẩm
                </span>
              </div>

              
            </header>

            {error ? (
              <div className="product-empty-state">
                <div>
                  <strong>Không thể tải sản phẩm</strong>
                  <p>{error}</p>
                </div>
              </div>
            ) : loading ? (
              <div className="product-loading-grid">
                {Array.from({ length: 8 }, (_, index) => (
                  <div className="product-skeleton-card" key={index}>
                    <span />
                    <b />
                    <i />
                    <i />
                  </div>
                ))}
              </div>
            ) : products.length ? (
              <div
                className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 row-cols-xxl-4 g-4 product-grid-page"
                key={`${pagination.page}-${category}-${brand}-${sortBy}`}
              >
                {products.map((item, index) => (
                  <div className="col" key={item.id}>
                    <Product data={item} itemIndex={index} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="product-empty-state">
                <div>
                  <strong>Không tìm thấy sản phẩm phù hợp</strong>
                  <p>Hãy thử xóa một số bộ lọc hoặc đổi từ khóa.</p>
                </div>
              </div>
            )}

            {pagination.totalPages > 1 && (
              <nav
                className="product-pagination product-pagination--premium"
                aria-label="Phân trang sản phẩm"
              >
                <button
                  type="button"
                  className="product-page-btn product-page-btn--nav"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => changePage(pagination.page - 1)}
                >
                  <FontAwesomeIcon icon={["fas", "chevron-left"]} />
                  Trước
                </button>

                <div className="product-page-numbers">
                  {paginationItems.map((item) =>
                    typeof item === "string" ? (
                      <span className="product-page-ellipsis" key={item}>
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={`product-page-dot ${item === pagination.page ? "is-active" : ""}`}
                        onClick={() => changePage(item)}
                        aria-label={`Trang ${item}`}
                        aria-current={
                          item === pagination.page ? "page" : undefined
                        }
                      >
                        {item}
                      </button>
                    ),
                  )}
                </div>

                <button
                  type="button"
                  className="product-page-btn product-page-btn--nav"
                  disabled={!pagination.hasNextPage}
                  onClick={() => changePage(pagination.page + 1)}
                >
                  Sau
                  <FontAwesomeIcon icon={["fas", "chevron-right"]} />
                </button>
              </nav>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default ProductList;
