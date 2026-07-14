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
          <p><a href="#">Điện thoại</a></p>
          <p><a href="#">Laptop</a></p>
          <p><a href="#">Phụ kiện</a></p>
        </div>

        <div>
          <h6>Hỗ trợ</h6>
          <p><a href="#">Hướng dẫn mua hàng</a></p>
          <p><a href="#">Thanh toán QR</a></p>
          <p><a href="#">Bảo hành</a></p>
        </div>

        <div>
          <h6>Liên hệ</h6>
          <p>Email: electroshop@gmail.com</p>
          <p>Hotline: 0385416387</p>

          <div className="footer-social-links">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">TikTok</a>
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