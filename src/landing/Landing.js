import Banner from "./Banner";
import FeatureProduct from "./FeatureProduct";
import ScrollToTopOnMount from "../template/ScrollToTopOnMount";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <>
      <ScrollToTopOnMount />

      {/* Banner */}
      <Banner />

      {/* Intro */}
      <div className="d-flex flex-column bg-white py-5">
        <h1 className="text-center fw-bold display-4">
          ElectroShop
        </h1>

        <p className="text-center px-5 mt-3 lead">
          Website bán đồ điện tử hiện đại với các sản phẩm công nghệ,
          điện thoại, laptop và phụ kiện chất lượng cao.
        </p>

        <div className="d-flex justify-content-center mt-3">
          <Link to="/products" className="btn btn-dark btn-lg" replace>
            Khám phá sản phẩm
          </Link>
        </div>
      </div>

      {/* Feature */}
      <div className="container py-5">
        <div className="row text-center">

          <div className="col-md-4">
            <FontAwesomeIcon
              icon={["fas", "truck"]}
              size="3x"
              className="mb-3 text-primary"
            />

            <h5>Giao hàng nhanh</h5>

            <p>
              Hỗ trợ giao hàng toàn quốc nhanh chóng và an toàn.
            </p>
          </div>

          <div className="col-md-4">
            <FontAwesomeIcon
              icon={["fas", "shield-alt"]}
              size="3x"
              className="mb-3 text-success"
            />

            <h5>Bảo hành chính hãng</h5>

            <p>
              Cam kết sản phẩm chất lượng và bảo hành uy tín.
            </p>
          </div>

          <div className="col-md-4">
            <FontAwesomeIcon
              icon={["fas", "credit-card"]}
              size="3x"
              className="mb-3 text-danger"
            />

            <h5>Thanh toán QR</h5>

            <p>
              Hỗ trợ thanh toán nhanh bằng mã QR chuyển khoản.
            </p>
          </div>

        </div>
      </div>

      {/* Products */}
      <h2 className="text-center fw-bold mt-4 mb-4">
        Sản phẩm nổi bật
      </h2>

      <div className="container pb-5 px-lg-5">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 px-md-5">
          {Array.from({ length: 6 }, (_, i) => {
            return <FeatureProduct key={i} />;
          })}
        </div>
      </div>

      {/* Social */}
      <div className="d-flex flex-column bg-dark text-white py-5">
        <h5 className="text-center mb-4">
          Theo dõi chúng tôi
        </h5>

        <div className="d-flex justify-content-center">
          <a href="!#" className="me-4 text-white">
            <FontAwesomeIcon icon={["fab", "facebook"]} size="2x" />
          </a>

          <a href="!#" className="text-white">
            <FontAwesomeIcon icon={["fab", "instagram"]} size="2x" />
          </a>

          <a href="!#" className="ms-4 text-white">
            <FontAwesomeIcon icon={["fab", "twitter"]} size="2x" />
          </a>
        </div>
      </div>
    </>
  );
}

export default Landing;