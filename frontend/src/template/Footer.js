import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="eshop-footer-compact">
      <div className="container eshop-footer-row">
        <div className="eshop-footer-brand">
          <h5>ElectroShop</h5>
          <p>Website bán đồ điện tử, laptop, điện thoại và phụ kiện công nghệ.</p>
        </div>

        <div>
          <h6>Danh mục</h6>
          <p><Link to="/category/dien-thoai">Điện thoại</Link></p>
          <p><Link to="/category/laptop">Laptop</Link></p>
          <p><Link to="/category/phu-kien">Phụ kiện</Link></p>
        </div>

        <div>
          <h6>Hỗ trợ</h6>
          <p><Link to="/about">Giới thiệu</Link></p>
          <p><Link to="/cart">Giỏ hàng</Link></p>
          <p><Link to="/contact">Liên hệ</Link></p>
        </div>

        <div>
          <h6>Liên hệ</h6>
          <p><a href="mailto:electroshop@gmail.com">electroshop@gmail.com</a></p>
          <p><a href="tel:0385416387">0385 416 387</a></p>

          <div className="footer-social-links">
            <a href="https://facebook.com/gearxin.store" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://zalo.me/0385416387" target="_blank" rel="noreferrer">Zalo</a>
            <a href="https://github.com/gearxin-store" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </div>

      <div className="eshop-footer-bottom-small">
        Copyright © 2026 ElectroShop
      </div>
    </footer>
  );
}

export default Footer;
