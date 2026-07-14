import { useEffect, useMemo, useRef, useState } from "react";
import Banner from "./Banner";
import FeatureProduct, { featuredProducts } from "./FeatureProduct";
import ScrollToTopOnMount from "../template/ScrollToTopOnMount";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import FlashSale from "./FlashSale";
import { getProducts } from "../api/products";

function Landing() {
  const featuredPerPage = 6;
  const [dbProducts, setDbProducts] = useState([]);
  const [featuredPage, setFeaturedPage] = useState(1);
  const featuredTopRef = useRef(null);
  const visibleProducts = dbProducts.length > 0 ? dbProducts : featuredProducts;
  const featuredTotalPages = Math.max(1, Math.ceil(visibleProducts.length / featuredPerPage));

  useEffect(() => {
    let isMounted = true;

    getProducts()
      .then((products) => {
        if (isMounted) {
          setDbProducts(products);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDbProducts([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredPageProducts = useMemo(() => {
    const startIndex = (featuredPage - 1) * featuredPerPage;
    return visibleProducts.slice(startIndex, startIndex + featuredPerPage);
  }, [featuredPage, featuredPerPage, visibleProducts]);

  const featuredPageNumbers = useMemo(() => {
    return Array.from({ length: featuredTotalPages }, (_, index) => index + 1);
  }, [featuredTotalPages]);

  useEffect(() => {
    if (featuredPage > featuredTotalPages) {
      setFeaturedPage(featuredTotalPages);
    }
  }, [featuredPage, featuredTotalPages]);

  function changeFeaturedPage(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), featuredTotalPages);
    setFeaturedPage(safePage);

    window.requestAnimationFrame(() => {
      featuredTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <>
      <ScrollToTopOnMount />

      <Banner />

      <section className="home-category-strip home-reveal-section">
        <div className="container px-lg-5">
          <FlashSale />
        </div>
      </section>

      <section className="home-products bg-light home-reveal-section">
        <div className="container px-lg-5">
          <div className="home-section-heading home-products-heading d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="home-section-kicker">Danh sách sản phẩm</span>
              <h2 className="fw-bold mb-1">Shop công nghệ cho PC, laptop & linh kiện</h2>
              <p className="text-muted mb-0">
                Chọn nhanh sản phẩm theo nhu cầu học tập, làm việc, gaming và nâng cấp góc máy.
              </p>
            </div>

            <Link to="/products" className="btn btn-outline-dark home-products-main-link">
              Xem danh sách sản phẩm
            </Link>
          </div>

          <div className="home-product-summary-grid">
            <Link to="/products" className="home-product-summary-card">
              <span>
                <FontAwesomeIcon icon={["fas", "desktop"]} />
              </span>
              <strong>PC build sẵn</strong>
              <small>Cấu hình gaming, học tập, văn phòng đã tối ưu sẵn.</small>
            </Link>
            <Link to="/category/laptop" className="home-product-summary-card">
              <span>
                <FontAwesomeIcon icon={["fas", "laptop"]} />
              </span>
              <strong>Laptop</strong>
              <small>Mỏng nhẹ, pin tốt, cấu hình phù hợp đi học và đi làm.</small>
            </Link>
            <Link to="/category/linh-kien-pc" className="home-product-summary-card">
              <span>
                <FontAwesomeIcon icon={["fas", "microchip"]} />
              </span>
              <strong>Linh kiện PC</strong>
              <small>CPU, RAM, SSD, VGA, mainboard cho nhu cầu nâng cấp.</small>
            </Link>
            <Link to="/category/man-hinh" className="home-product-summary-card">
              <span>
                <FontAwesomeIcon icon={["fas", "tv"]} />
              </span>
              <strong>Màn hình & setup</strong>
              <small>Hoàn thiện góc máy với màn hình, chuột, phím và phụ kiện.</small>
            </Link>
          </div>

          <div className="home-product-motion-note" ref={featuredTopRef}>
            <div>
              <span className="home-section-kicker">Đang được quan tâm</span>
              <strong>{visibleProducts.length} mẫu nổi bật cho học tập, làm việc và gaming tại nhà.</strong>
            </div>
            <span className="home-feature-page-count">
              Trang {featuredPage}/{featuredTotalPages}
            </span>
          </div>

          <div className="home-product-focus-row">
            <Link to="/category/laptop">
              Laptop học tập, văn phòng
            </Link>
            <Link to="/products">
              PC gaming build sẵn
            </Link>
            <Link to="/category/linh-kien-pc">
              Linh kiện nâng cấp
            </Link>
            <Link to="/category/man-hinh">
              Màn hình setup
            </Link>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 home-feature-grid" key={featuredPage}>
            {featuredPageProducts.map((product, index) => (
              <FeatureProduct key={product.to || product.id} product={product} index={index} />
            ))}
          </div>

          {featuredTotalPages > 1 && (
            <nav className="product-pagination home-feature-pagination" aria-label="Phân trang sản phẩm nổi bật">
              <button
                type="button"
                className="product-page-btn"
                disabled={featuredPage === 1}
                onClick={() => changeFeaturedPage(featuredPage - 1)}
              >
                Trước
              </button>

              <div className="product-page-numbers">
                {featuredPageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`product-page-dot ${page === featuredPage ? "is-active" : ""}`}
                    onClick={() => changeFeaturedPage(page)}
                    aria-label={`Trang nổi bật ${page}`}
                    aria-current={page === featuredPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="product-page-btn"
                disabled={featuredPage === featuredTotalPages}
                onClick={() => changeFeaturedPage(featuredPage + 1)}
              >
                Sau
              </button>
            </nav>
          )}
        </div>
      </section>

      <section className="home-intro bg-white text-center home-reveal-section">
        <div className="container">
          <div className="home-intro-card">
            <div className="home-intro-copy">
              <p className="home-section-kicker">Khám phá shop</p>
              <h1 className="home-title fw-bold">ElectroShop</h1>

              <p className="home-description mt-3 text-muted mx-auto">
                Không gian mua sắm đồ công nghệ cho sinh viên, dân văn phòng và
                người dùng muốn nâng cấp góc làm việc tại nhà.
              </p>

              <div className="home-intro-actions">
                <Link to="/products" className="btn btn-dark btn-lg home-dark-cta" replace>
                  Khám phá sản phẩm
                </Link>
                <Link to="/category/linh-kien-pc" className="home-outline-cta">
                  Xem linh kiện
                </Link>
              </div>
            </div>

            <div className="home-stat-row">
              <div className="home-stat">
                <span className="home-stat-icon">
                  <FontAwesomeIcon icon={["fas", "boxes"]} />
                </span>
                <strong>100+</strong>
                <span>Sản phẩm công nghệ</span>
              </div>
              <div className="home-stat">
                <span className="home-stat-icon">
                  <FontAwesomeIcon icon={["fas", "layer-group"]} />
                </span>
                <strong>5</strong>
                <span>Nhóm danh mục chính</span>
              </div>
              <div className="home-stat">
                <span className="home-stat-icon">
                  <FontAwesomeIcon icon={["fas", "headset"]} />
                </span>
                <strong>24h</strong>
                <span>Tư vấn chọn cấu hình</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container home-services home-reveal-section">
        <div className="home-services-heading">
          <span className="home-section-kicker">Dịch vụ đi kèm</span>
          <h2>Yên tâm từ lúc chọn cấu hình đến khi nhận máy</h2>
        </div>

        <div className="row text-center g-4">
          <div className="col-md-4">
            <div className="home-service-card">
              <span className="home-service-icon is-blue">
                <FontAwesomeIcon icon={["fas", "truck"]} />
              </span>
              <h5>Giao hàng nhanh</h5>
              <p>Hỗ trợ giao hàng toàn quốc nhanh chóng và an toàn.</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="home-service-card">
              <span className="home-service-icon is-green">
                <FontAwesomeIcon icon={["fas", "shield-alt"]} />
              </span>
              <h5>Bảo hành chính hãng</h5>
              <p>Cam kết sản phẩm chất lượng và bảo hành uy tín.</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="home-service-card">
              <span className="home-service-icon is-red">
                <FontAwesomeIcon icon={["fas", "credit-card"]} />
              </span>
              <h5>Thanh toán QR</h5>
              <p>Hỗ trợ thanh toán nhanh bằng mã QR chuyển khoản.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Landing;
