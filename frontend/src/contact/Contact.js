import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const contactChannels = [
  {
    icon: ["fas", "phone-alt"],
    label: "Hotline",
    value: "0385 416 387",
    href: "tel:0385416387",
  },
  {
    icon: ["fas", "comment-dots"],
    label: "Zalo",
    value: "zalo.me/0385416387",
    href: "https://zalo.me/0385416387",
  },
  {
    icon: ["fab", "facebook-f"],
    label: "Facebook",
    value: "Gearxin Store",
    href: "https://facebook.com/gearxin.store",
  },
  {
    icon: ["fab", "github"],
    label: "GitHub",
    value: "github.com/gearxin-store",
    href: "https://github.com/gearxin-store",
  },
  {
    icon: ["fas", "envelope"],
    label: "Gmail",
    value: "electroshop@gmail.com",
    href: "mailto:electroshop@gmail.com",
  },
];

const branches = [
  {
    name: "Gearxin Hà Đông - Nguyễn Trãi",
    address: "Số 24 Nguyễn Trãi, phường Mộ Lao, quận Hà Đông, Hà Nội",
    phone: "0385 416 387",
    hours: "08:00 - 22:00",
    note: "Showroom chính, hỗ trợ laptop, điện thoại, phụ kiện và bảo hành.",
  },
  {
    name: "Gearxin La Khê",
    address: "Tầng 1, số 68 Tố Hữu, phường La Khê, quận Hà Đông, Hà Nội",
    phone: "0968 245 886",
    hours: "08:30 - 21:30",
    note: "Nhận đặt hàng online, lắp máy, giao nhanh khu vực Hà Đông.",
  },
  {
    name: "Gearxin Văn Quán",
    address: "Kiot 12, khu dịch vụ Văn Quán, phường Văn Quán, quận Hà Đông, Hà Nội",
    phone: "0974 120 558",
    hours: "09:00 - 21:00",
    note: "Tư vấn phụ kiện, màn hình, linh kiện PC và vệ sinh thiết bị.",
  },
];

const serviceHighlights = [
  "Tư vấn chọn máy theo nhu cầu học tập, gaming, văn phòng",
  "Giao hàng nhanh nội thành Hà Đông trong ngày",
  "Hỗ trợ đổi trả, bảo hành và kiểm tra kỹ thuật tại cửa hàng",
  "Nhận đặt hàng qua Hotline, Zalo, Facebook và Gmail",
];

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    alert("Gearxin đã nhận thông tin. Nhân viên sẽ liên hệ lại sớm nhất!");
    setFormData({ name: "", phone: "", message: "" });
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container contact-hero-inner">
          <div className="contact-hero-copy">
            <span className="contact-kicker">Liên hệ Gearxin</span>
            <h1>Cửa hàng công nghệ tại Hà Đông</h1>
            <p>
              Gearxin hỗ trợ tư vấn laptop, điện thoại, phụ kiện, linh kiện PC,
              thanh toán QR, giao hàng nhanh và bảo hành tận tâm cho khách hàng.
            </p>
            <div className="contact-hero-actions">
              <a href="tel:0385416387" className="contact-primary-btn">
                <FontAwesomeIcon icon={["fas", "phone-alt"]} />
                Gọi ngay 0385 416 387
              </a>
              <a
                href="mailto:electroshop@gmail.com"
                className="contact-secondary-btn"
              >
                <FontAwesomeIcon icon={["fas", "envelope"]} />
                Gửi Gmail
              </a>
            </div>
          </div>

          <div className="contact-hero-panel" aria-label="Thông tin cửa hàng">
            <div className="contact-live-dot">
              <span></span>
              Đang nhận tư vấn
            </div>
            <strong>ElectroShop / Gearxin Store</strong>
            <p>
              Địa chỉ chính: Số 24 Nguyễn Trãi, Mộ Lao, Hà Đông, Hà Nội.
            </p>
            <div className="contact-mini-stats">
              <span>
                <b>3</b>
                Chi nhánh
              </span>
              <span>
                <b>08-22h</b>
                Mở cửa
              </span>
              <span>
                <b>24/7</b>
                Online
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-section-heading">
            <span>Kênh liên hệ</span>
            <h2>Kết nối với cửa hàng</h2>
            <p>
              Chọn kênh thuận tiện nhất để đặt hàng, hỏi giá, giữ máy hoặc cần
              hỗ trợ bảo hành.
            </p>
          </div>

          <div className="contact-channel-grid">
            {contactChannels.map((channel, index) => (
              <a
                key={channel.label}
                href={channel.href}
                className="contact-channel-card"
                style={{ "--contact-index": index }}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
              >
                <span>
                  <FontAwesomeIcon icon={channel.icon} />
                </span>
                <small>{channel.label}</small>
                <strong>{channel.value}</strong>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section contact-branches-band">
        <div className="container">
          <div className="contact-section-heading">
            <span>Chi nhánh Hà Đông</span>
            <h2>Địa chỉ cửa hàng</h2>
            <p>
              Hệ thống chi nhánh hỗ trợ xem máy, nhận hàng, bảo hành và tư vấn
              trực tiếp trong khu vực Hà Đông.
            </p>
          </div>

          <div className="contact-branch-grid">
            {branches.map((branch, index) => (
              <article
                className="contact-branch-card"
                key={branch.name}
                style={{ "--branch-index": index }}
              >
                <div className="contact-branch-number">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3>{branch.name}</h3>
                <p>
                  <FontAwesomeIcon icon={["fas", "map-marker-alt"]} />
                  {branch.address}
                </p>
                <p>
                  <FontAwesomeIcon icon={["fas", "phone"]} />
                  {branch.phone}
                </p>
                <p>
                  <FontAwesomeIcon icon={["fas", "clock"]} />
                  {branch.hours}
                </p>
                <small>{branch.note}</small>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    branch.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Xem bản đồ
                  <FontAwesomeIcon icon={["fas", "arrow-right"]} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="container contact-info-layout">
          <div className="contact-service-panel">
            <span className="contact-kicker">Dịch vụ hỗ trợ</span>
            <h2>Thông tin cửa hàng</h2>
            <p>
              Gearxin tập trung vào trải nghiệm mua sắm nhanh, rõ giá, dễ liên
              hệ và có người hỗ trợ sau khi nhận hàng.
            </p>
            <div className="contact-service-list">
              {serviceHighlights.map((item) => (
                <div key={item}>
                  <FontAwesomeIcon icon={["fas", "check-circle"]} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <form className="contact-form-panel" onSubmit={handleSubmit}>
            <span className="contact-kicker">Gửi yêu cầu</span>
            <h2>Cần nhân viên gọi lại?</h2>
            <label>
              Họ tên
              <input
                type="text"
                name="name"
                placeholder="Nhập họ tên của bạn"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Số điện thoại
              <input
                type="tel"
                name="phone"
                placeholder="Ví dụ: 0385416387"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Nội dung cần tư vấn
              <textarea
                name="message"
                rows="4"
                placeholder="Bạn cần mua sản phẩm nào hoặc hỗ trợ vấn đề gì?"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </label>
            <button type="submit">
              <FontAwesomeIcon icon={["fas", "paper-plane"]} />
              Gửi thông tin
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Contact;
