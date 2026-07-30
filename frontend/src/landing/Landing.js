import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Banner from "./Banner";
import FeatureProduct from "./FeatureProduct";
import ScrollToTopOnMount from "../template/ScrollToTopOnMount";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

async function fetchJson(url, signal) {
  const response = await fetch(url, {
    signal,
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || `API trả về lỗi ${response.status}`;

    throw new Error(message);
  }

  return data;
}

function normalizeProduct(product = {}) {
  const id = product.id ?? product.product_id ?? null;

  return {
    ...product,
    id,
    name:
      product.name ??
      product.product_name ??
      "Sản phẩm công nghệ",
    image:
      product.image ??
      product.image_url ??
      product.thumbnail_url ??
      product.thumbnail ??
      "",
    price:
      product.price ??
      product.base_price ??
      product.min_price ??
      0,
    brand:
      product.brand ??
      product.brand_name ??
      "Gearxin",
    categoryName:
      product.categoryName ??
      product.category_name ??
      product.category ??
      "Công nghệ",
    stock_quantity:
      product.stock_quantity ??
      product.stockQuantity ??
      product.available_quantity ??
      null,
    sold_count:
      product.sold_count ??
      product.total_sold ??
      product.totalSold ??
      product.sold_quantity ??
      product.soldQuantity ??
      0,
    reviewCount:
      product.reviewCount ??
      product.review_count ??
      0,
    rating:
      product.rating ??
      product.average_rating ??
      0,
    description:
      product.description ??
      product.detail ??
      "Sản phẩm công nghệ chính hãng, phù hợp cho học tập, làm việc và giải trí.",
    to: id ? `/products/${id}` : "/products",
  };
}

function Landing() {
  const [products, setProducts] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadLanding() {
      setLoading(true);
      setError("");

      const [productsResult, topSellingResult] =
        await Promise.allSettled([
          fetchJson(`${API_BASE_URL}/products`, controller.signal),
          fetchJson(
            `${API_BASE_URL}/products/top-selling?limit=10`,
            controller.signal
          ),
        ]);

      if (controller.signal.aborted) return;

      const allProducts =
        productsResult.status === "fulfilled" &&
        Array.isArray(productsResult.value)
          ? productsResult.value.map(normalizeProduct)
          : [];

      const bestSellers =
        topSellingResult.status === "fulfilled" &&
        Array.isArray(topSellingResult.value)
          ? topSellingResult.value.map(normalizeProduct)
          : [];

      setProducts(allProducts);
      setTopSelling(bestSellers);

      if (allProducts.length === 0 && bestSellers.length === 0) {
        setError(
          "Không thể tải sản phẩm. Hãy kiểm tra backend cổng 3001 và database."
        );
      }

      setLoading(false);
    }

    loadLanding().catch((loadError) => {
      if (loadError?.name !== "AbortError") {
        console.error("Lỗi tải Landing:", loadError);
        setError("Có lỗi khi tải dữ liệu trang chủ.");
        setLoading(false);
      }
    });

    return () => controller.abort();
  }, []);

  const promotionProducts = useMemo(
    () => topSelling.slice(0, 4),
    [topSelling]
  );

  const featuredProducts = useMemo(() => {
    const topIds = new Set(
      promotionProducts.map((product) => product.id)
    );

    const remaining = products.filter(
      (product) => !topIds.has(product.id)
    );

    return (remaining.length > 0 ? remaining : products).slice(0, 8);
  }, [products, promotionProducts]);

  return (
    <>
      <ScrollToTopOnMount />

      <div className="gx2-landing">
        <Banner topSelling={topSelling} loading={loading} />

        <main className="gx2-landing__main">
          <section className="gx2-category" aria-label="Danh mục sản phẩm">
            <div className="container px-lg-5">
              <div className="gx2-category__rail">
                <Link to="/category/laptop">
                  <span aria-hidden="true">💻</span>
                  <strong>Laptop</strong>
                  <small>Học tập, văn phòng, gaming</small>
                </Link>

                <Link to="/category/dien-thoai">
                  <span aria-hidden="true">📱</span>
                  <strong>Điện thoại</strong>
                  <small>Thiết bị di động chính hãng</small>
                </Link>

                <Link to="/category/linh-kien-pc">
                  <span aria-hidden="true">⚙️</span>
                  <strong>Linh kiện PC</strong>
                  <small>Nâng cấp hiệu năng hệ thống</small>
                </Link>

                <Link to="/category/man-hinh">
                  <span aria-hidden="true">🖥️</span>
                  <strong>Màn hình</strong>
                  <small>Làm việc và giải trí sắc nét</small>
                </Link>

                <Link to="/category/phu-kien">
                  <span aria-hidden="true">⌨️</span>
                  <strong>Phụ kiện</strong>
                  <small>Hoàn thiện góc máy của bạn</small>
                </Link>
              </div>
            </div>
          </section>

          <section className="gx2-section gx2-section--deals">
            <div className="container px-lg-5">
              <header className="gx2-section__header">
                <div>
                  <span className="gx2-section__kicker">
                    Sản phẩm ưu đãi
                  </span>
                  <h2>Những sản phẩm đang được mua nhiều</h2>
                  <p>
                    Thứ hạng được tổng hợp trực tiếp từ số lượng sản phẩm
                    trong các đơn hàng đã hoàn tất.
                  </p>
                </div>

                <Link to="/products" className="gx2-section__link">
                  Xem tất cả
                </Link>
              </header>

              {error && (
                <div className="gx2-alert" role="alert">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="gx2-product-grid">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div className="gx2-card-skeleton" key={index} />
                  ))}
                </div>
              ) : promotionProducts.length > 0 ? (
                <div className="gx2-product-grid">
                  {promotionProducts.map((product, index) => (
                    <FeatureProduct
                      key={product.id ?? `promotion-${index}`}
                      product={product}
                      priority={index < 2}
                      badge={`Top ${index + 1}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="gx2-empty">
                  <strong>Chưa có dữ liệu bán chạy</strong>
                  <p>
                    Khi có đơn hàng hoàn tất, sản phẩm bán chạy sẽ tự động
                    xuất hiện tại đây.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="gx2-section gx2-section--featured">
            <div className="container px-lg-5">
              <header className="gx2-section__header">
                <div>
                  <span className="gx2-section__kicker">
                    Sản phẩm nổi bật
                  </span>
                  <h2>Gợi ý công nghệ dành cho bạn</h2>
                  <p>
                    Bố cục card đồng đều, thông tin dễ đọc và hành động
                    mua hàng rõ ràng trên mọi kích thước màn hình.
                  </p>
                </div>

                <Link to="/products" className="gx2-section__link">
                  Khám phá sản phẩm
                </Link>
              </header>

              {loading ? (
                <div className="gx2-product-grid">
                  {Array.from({ length: 8 }, (_, index) => (
                    <div className="gx2-card-skeleton" key={index} />
                  ))}
                </div>
              ) : featuredProducts.length > 0 ? (
                <div className="gx2-product-grid">
                  {featuredProducts.map((product, index) => (
                    <FeatureProduct
                      key={product.id ?? `featured-${index}`}
                      product={product}
                      priority={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="gx2-empty">
                  <strong>Chưa có sản phẩm nổi bật</strong>
                  <p>Hãy kiểm tra dữ liệu sản phẩm trong database.</p>
                </div>
              )}
            </div>
          </section>

          <section className="gx2-benefits">
            <div className="container px-lg-5">
              <div className="gx2-benefits__grid">
                <article>
                  <span aria-hidden="true">🚚</span>
                  <div>
                    <strong>Giao hàng nhanh</strong>
                    <p>Đóng gói an toàn và theo dõi đơn hàng rõ ràng.</p>
                  </div>
                </article>

                <article>
                  <span aria-hidden="true">🛡️</span>
                  <div>
                    <strong>Bảo hành chính hãng</strong>
                    <p>Thông tin minh bạch theo từng sản phẩm.</p>
                  </div>
                </article>

                <article>
                  <span aria-hidden="true">🤖</span>
                  <div>
                    <strong>Tìm kiếm bằng AI</strong>
                    <p>Gợi ý cấu hình dựa trên nhu cầu và ngân sách.</p>
                  </div>
                </article>

                <article>
                  <span aria-hidden="true">💳</span>
                  <div>
                    <strong>Thanh toán thuận tiện</strong>
                    <p>Hỗ trợ giỏ hàng, mua ngay và thanh toán QR.</p>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default Landing;
