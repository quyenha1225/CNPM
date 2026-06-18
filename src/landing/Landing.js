import Banner from "./Banner";
import FeatureProduct from "./FeatureProduct";
import ScrollToTopOnMount from "../template/ScrollToTopOnMount";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <>
      <ScrollToTopOnMount />

      <Banner />

      <section className="home-category-strip">
        <div className="container">
          <div className="home-category-grid">
            <Link to="/category/laptop" className="home-category-link">
              <span className="home-category-icon">
                <FontAwesomeIcon icon={["fas", "laptop"]} />
              </span>
              <span className="home-category-text">
                <strong>Laptop</strong>
                <span>Học tập, văn phòng, gaming</span>
              </span>
            </Link>

            <Link to="/products" className="home-category-link">
              <span className="home-category-icon">
                <FontAwesomeIcon icon={["fas", "desktop"]} />
              </span>
              <span className="home-category-text">
                <strong>PC build sẵn</strong>
                <span>Cấu hình tối ưu theo nhu cầu</span>
              </span>
            </Link>

            <Link to="/category/linh-kien-pc" className="home-category-link">
              <span className="home-category-icon">
                <FontAwesomeIcon icon={["fas", "microchip"]} />
              </span>
              <span className="home-category-text">
                <strong>Linh kiện</strong>
                <span>CPU, mainboard, VGA, RAM</span>
              </span>
            </Link>

            <Link to="/category/man-hinh" className="home-category-link">
              <span className="home-category-icon">
                <FontAwesomeIcon icon={["fas", "tv"]} />
              </span>
              <span className="home-category-text">
                <strong>Màn hình</strong>
                <span>Làm việc, đồ họa, gaming</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="home-intro bg-white text-center">
        <div className="container">
          <div className="home-intro-card">
            <h1 className="home-title fw-bold">ElectroShop</h1>

            <p className="home-description mt-3 text-muted mx-auto">
              Không gian mua sắm đồ công nghệ cho sinh viên, dân văn phòng và
              người dùng muốn nâng cấp góc làm việc tại nhà.
            </p>

            <Link to="/products" className="btn btn-dark btn-lg mt-3" replace>
              Khám phá sản phẩm
            </Link>

            <div className="home-stat-row">
              <div className="home-stat">
                <strong>100+</strong>
                <span>Sản phẩm công nghệ</span>
              </div>
              <div className="home-stat">
                <strong>5</strong>
                <span>Nhóm danh mục chính</span>
              </div>
              <div className="home-stat">
                <strong>24h</strong>
                <span>Tư vấn chọn cấu hình</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container home-services">
        <div className="row text-center g-4">
          <div className="col-md-4">
            <div className="home-service-card">
              <FontAwesomeIcon icon={["fas", "truck"]} size="3x" className="mb-3 text-primary" />
              <h5>Giao hàng nhanh</h5>
              <p>Hỗ trợ giao hàng toàn quốc nhanh chóng và an toàn.</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="home-service-card">
              <FontAwesomeIcon icon={["fas", "shield-alt"]} size="3x" className="mb-3 text-success" />
              <h5>Bảo hành chính hãng</h5>
              <p>Cam kết sản phẩm chất lượng và bảo hành uy tín.</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="home-service-card">
              <FontAwesomeIcon icon={["fas", "credit-card"]} size="3x" className="mb-3 text-danger" />
              <h5>Thanh toán QR</h5>
              <p>Hỗ trợ thanh toán nhanh bằng mã QR chuyển khoản.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-products bg-light">
        <div className="container px-lg-5">
          <div className="home-section-heading d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">Sản phẩm nổi bật</h2>
              <p className="text-muted mb-0">
                Một số sản phẩm công nghệ được quan tâm nhiều nhất.
              </p>
            </div>

            <Link to="/products" className="btn btn-outline-dark">
              Xem tất cả
            </Link>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {Array.from({ length: 6 }, (_, i) => (
              <FeatureProduct key={i} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Landing;
