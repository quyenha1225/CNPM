import BannerZero from "./banner-0.jpg";
import BannerOne from "./banner-1.jpg";
import BannerTwo from "./banner-2.jpg";
import { Link } from "react-router-dom";

const banners = [
  {
    image: BannerZero,
    title: "PC gaming, laptop và linh kiện chính hãng",
    text: "Chọn nhanh cấu hình phù hợp cho học tập, làm việc và giải trí với mức giá rõ ràng.",
    kicker: "Gearxin PC",
    action: "Xem sản phẩm",
    to: "/products",
  },
  {
    image: BannerOne,
    title: "Laptop mỏng nhẹ cho học tập và văn phòng",
    text: "Các mẫu laptop phổ biến, dễ chọn, phù hợp nhu cầu đi học, đi làm và di chuyển mỗi ngày.",
    kicker: "Laptop nổi bật",
    action: "Xem laptop",
    to: "/category/laptop",
  },
  {
    image: BannerTwo,
    title: "Phụ kiện và màn hình cho góc máy gọn đẹp",
    text: "Hoàn thiện setup với màn hình, chuột, bàn phím và phụ kiện công nghệ cần thiết.",
    kicker: "Setup trọn bộ",
    action: "Khám phá ngay",
    to: "/category/phu-kien",
  },
];

function BannerIndicator(props) {
  return (
    <button
      type="button"
      data-bs-target="#bannerIndicators"
      data-bs-slide-to={props.index}
      className={props.active ? "active" : ""}
      aria-current={props.active}
    />
  );
}

function BannerImage(props) {
  return (
    <div
      className={"carousel-item " + (props.active ? "active" : "")}
      data-bs-interval="5000"
    >
      <div className="ratio home-banner-ratio home-tech-hero">
        <img
          className="d-block w-100 h-100 bg-dark cover home-banner-image"
          alt={props.title}
          src={props.image}
        />
        <div className="home-banner-overlay" />
        <div className="home-tech-grid" aria-hidden="true" />
        <div className="home-tech-orbit home-tech-orbit-one" aria-hidden="true" />
        <div className="home-tech-orbit home-tech-orbit-two" aria-hidden="true" />
      </div>

      <div className="home-banner-caption">
        <p className="home-banner-kicker">{props.kicker}</p>
        <h1 className="home-banner-title">{props.title}</h1>
        <p className="home-banner-text">{props.text}</p>
        <div className="home-hero-actions">
          <Link to={props.to} className="btn btn-warning btn-lg fw-bold home-primary-cta">
            {props.action}
          </Link>
          <Link to="/about" className="btn btn-outline-light btn-lg home-secondary-cta">
            Liên hệ tư vấn
          </Link>
        </div>

        <div className="home-hero-metrics" aria-label="Thông tin nổi bật">
          <span>
            <strong>100+</strong>
            cấu hình
          </span>
          <span>
            <strong>24h</strong>
            tư vấn
          </span>
          <span>
            <strong>4.9/5</strong>
            đánh giá
          </span>
        </div>
      </div>
    </div>
  );
}

function Banner() {
  return (
    <div
      id="bannerIndicators"
      className="carousel slide home-hero-carousel"
      data-bs-ride="carousel"
    >
      <div className="carousel-indicators">
        {banners.map((banner, index) => (
          <BannerIndicator
            key={banner.title}
            index={index}
            active={index === 0}
          />
        ))}
      </div>

      <div className="carousel-inner">
        {banners.map((banner, index) => (
          <BannerImage
            key={banner.title}
            image={banner.image}
            title={banner.title}
            text={banner.text}
            kicker={banner.kicker}
            action={banner.action}
            to={banner.to}
            active={index === 0}
          />
        ))}
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#bannerIndicators"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#bannerIndicators"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}

export default Banner;
