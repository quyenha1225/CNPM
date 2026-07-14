import React from 'react';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const commitments = [
  {
    icon: ["fas", "laptop"],
    title: "Sản phẩm chọn lọc",
    text: "Laptop, điện thoại, phụ kiện và linh kiện được phân nhóm rõ ràng, dễ so sánh.",
  },
  {
    icon: ["fas", "shield-alt"],
    title: "Bảo hành rõ ràng",
    text: "Thông tin bảo hành, đổi trả và hỗ trợ kỹ thuật được tư vấn trước khi mua.",
  },
  {
    icon: ["fas", "truck"],
    title: "Mua sắm nhanh",
    text: "Đặt hàng online, thanh toán linh hoạt và hỗ trợ giao hàng trong khu vực Hà Nội.",
  },
];

// Hai cột icon thiết bị công nghệ dùng cho marquee.
const marqueeColA = [
  "laptop",
  "mobile-alt",
  "headphones",
  "camera",
  "keyboard",
];
const marqueeColB = [
  "tablet-alt",
  "gamepad",
  "tv",
  "microchip",
  "wifi",
];

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container about-hero-inner">
          <div>
            <span className="about-kicker">Về Gearxin</span>
            <h1>ElectroShop dành cho người yêu công nghệ</h1>
            <p>
              Gearxin xây dựng trải nghiệm mua sắm thiết bị công nghệ gọn gàng,
              dễ hiểu và đáng tin cậy cho sinh viên, dân văn phòng, game thủ và
              người dùng gia đình.
            </p>
            <div className="about-actions">
              <Link to="/products" className="about-primary-btn">
                <FontAwesomeIcon icon={["fas", "shopping-bag"]} />
                Xem sản phẩm
              </Link>
              <Link to="/contact" className="about-secondary-btn">
                <FontAwesomeIcon icon={["fas", "phone-alt"]} />
                Liên hệ cửa hàng
              </Link>
            </div>
          </div>

          <div className="about-visual-panel">
            <div className="about-marquee">
              <div className="about-marquee-col about-marquee-col-a">
                {[...marqueeColA, ...marqueeColA].map((icon, index) => (
                  <div className="about-marquee-tile" key={`a-${index}`}>
                    <FontAwesomeIcon icon={["fas", icon]} />
                  </div>
                ))}
              </div>
              <div className="about-marquee-col about-marquee-col-b">
                {[...marqueeColB, ...marqueeColB].map((icon, index) => (
                  <div className="about-marquee-tile" key={`b-${index}`}>
                    <FontAwesomeIcon icon={["fas", icon]} />
                  </div>
                ))}
              </div>
            </div>

            <div className="about-visual-caption">
              <span>Gearxin Store</span>
              <strong>Thiết bị tốt, tư vấn thật, hỗ trợ nhanh.</strong>
              <p>
                Từ danh sách sản phẩm đến giỏ hàng và thanh toán, mọi phần của
                website được thiết kế để khách hàng tìm đúng món cần mua trong
                ít bước nhất.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container about-stat-grid">
          <div>
            <strong>500+</strong>
            <span>Sản phẩm công nghệ</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Nhóm hàng chính</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>Tiếp nhận hỗ trợ online</span>
          </div>
        </div>
      </section>

      <section className="about-section about-commit-band">
        <div className="container">
          <div className="about-section-heading">
            <span>Cam kết</span>
            <h2>Điều Gearxin muốn làm tốt</h2>
          </div>

          <div className="about-commit-grid">
            {commitments.map((item, index) => (
              <article
                className="about-commit-card"
                key={item.title}
                style={{ "--about-index": index }}
              >
                <div>
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container about-process">
          <div className="about-section-heading">
            <span>Quy trình</span>
            <h2>Mua hàng đơn giản hơn</h2>
          </div>

          <div className="about-process-steps">
            <div>
              <b>01</b>
              <strong>Chọn sản phẩm</strong>
              <span>Lọc theo danh mục, thương hiệu và mức giá.</span>
            </div>
            <div>
              <b>02</b>
              <strong>Thêm vào giỏ</strong>
              <span>Kiểm tra số lượng, tổng tiền và thông tin sản phẩm.</span>
            </div>
            <div>
              <b>03</b>
              <strong>Nhận tư vấn</strong>
              <span>Liên hệ cửa hàng để xác nhận đơn, giao hàng hoặc bảo hành.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;