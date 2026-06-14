import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { useState } from "react";

function Header({ setCategory, setBrand }) {
  const [openedDrawer, setOpenedDrawer] = useState(false);

  function toggleDrawer() {
    setOpenedDrawer(!openedDrawer);
  }

  // Hàm xử lý thông minh: Chuyển hướng sang trang sản phẩm khi click vào Mega Menu
  const handleMenuClick = (catId = "", brandId = "") => {
    setCategory(catId); 
    setBrand(brandId);  

    // Nếu click vào một mục cụ thể (không phải reset Trang Chủ)
    if (catId !== "" || brandId !== "") {
      window.location.hash = "/products"; // Ép trang nhảy sang /products để xem kết quả lọc
    }
  };

  return (
    <header>
      <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
        <div className="container-fluid px-4">
          
          {/* --- LOGO THƯƠNG HIỆU (Bấm vào về trang chủ, xóa bộ lọc) --- */}
          <Link className="navbar-brand d-flex align-items-center" to="/" onClick={() => handleMenuClick("", "")}>
            <FontAwesomeIcon icon={["fab", "bootstrap"]} className="ms-1 text-primary" size="lg" />
            <span className="ms-2 h5 fw-bold text-dark mb-0">
              Electro<span className="text-primary">Shop</span>
            </span>
          </Link>

          <div className={"navbar-collapse offcanvas-collapse " + (openedDrawer ? 'open' : '')}>
            <ul className="navbar-nav mb-lg-0 align-items-lg-center">
              
              {/* --- NÚT TRANG CHỦ (Về trang Landing mặc định) --- */}
              <li className="nav-item">
                <Link to="/" className="nav-link fw-bold text-uppercase mx-1" style={{ fontSize: "14px" }} onClick={() => handleMenuClick("", "")}>
                  Trang Chủ
                </Link>
              </li>

              {/* === MENU SẢN PHẨM CHỨA MEGA MENU (Trỏ sang /products) === */}
              <li className="nav-item dropdown position-static">
                <Link 
                  to="/products" 
                  className="nav-link dropdown-toggle fw-bold text-uppercase mx-1 text-primary" 
                  id="megaMenu" 
                  role="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  style={{ fontSize: "14px" }}
                  onClick={() => handleMenuClick("", "")} // Bấm thẳng vào chữ "Sản Phẩm" thì hiện tất cả sản phẩm
                >
                  Sản Phẩm
                </Link>
                
                <div className="dropdown-menu w-100 shadow-lg border-0 rounded-0 m-0 py-4 px-5" style={{ top: "100%", left: "0", borderTop: "3px solid #000080" }} aria-labelledby="megaMenu">
                  <div className="container-fluid">
                    <div className="row g-4">
                      
                      {/* CỘT 1: HỆ THỐNG MÁY TÍNH */}
                      <div className="col-md-2" style={{ borderRight: "1px solid #eee" }}>
                        <h6 className="fw-bold text-primary mb-3" style={{ fontSize: "15px" }}>Hệ Thống PC</h6>
                        <ul className="list-unstyled lh-lg" style={{ fontSize: "13.5px" }}>
                          <li><Link to="/products" className="text-decoration-none text-muted" onClick={() => handleMenuClick("PC_Gaming")}>› PC Gaming Shark</Link></li>
                          <li><Link to="/products" className="text-decoration-none text-muted" onClick={() => handleMenuClick("PC_Gaming")}>› PC Đồ Họa & Render</Link></li>
                          <li><Link to="/products" className="text-decoration-none text-muted" onClick={() => handleMenuClick("PC_VanPhong")}>› PC Văn Phòng Trọn Bộ</Link></li>
                        </ul>
                      </div>

                      {/* CỘT 2: LAPTOP */}
                      <div className="col-md-2" style={{ borderRight: "1px solid #eee" }}>
                        <h6 className="fw-bold text-primary mb-3" style={{ fontSize: "15px" }}>Laptop - Notebook</h6>
                        <ul className="list-unstyled lh-lg" style={{ fontSize: "13.5px" }}>
                          <li><Link to="/products" className="text-decoration-none text-muted" onClick={() => handleMenuClick("Laptop", "Asus")}>› Asus Vivobook Series</Link></li>
                          <li><Link to="/products" className="text-decoration-none text-muted" onClick={() => handleMenuClick("Laptop", "Apple")}>› Apple MacBook Air / Pro</Link></li>
                        </ul>
                      </div>

                      {/* CỘT 3: LINH KIỆN */}
                      <div className="col-md-3" style={{ borderRight: "1px solid #eee" }}>
                        <h6 className="fw-bold text-primary mb-3" style={{ fontSize: "15px" }}>Linh Kiện Phần Cứng</h6>
                        <div className="row">
                          <div className="col-6">
                            <ul className="list-unstyled lh-lg" style={{ fontSize: "13.5px" }}>
                              <li><Link to="/products" className="text-decoration-none text-muted" onClick={() => handleMenuClick("LinhKien", "Intel")}>› CPU Intel Core</Link></li>
                              <li><Link to="/products" className="text-decoration-none text-muted" onClick={() => handleMenuClick("LinhKien", "Asus")}>› Bo Mạch Chủ (Mainboard)</Link></li>
                            </ul>
                          </div>
                          <div className="col-6">
                            <ul className="list-unstyled lh-lg" style={{ fontSize: "13.5px" }}>
                              <li><Link to="/products" className="text-decoration-none text-muted" onClick={() => handleMenuClick("LinhKien")}>› VGA - Card Đồ Họa</Link></li>
                              <li><Link to="/products" className="text-decoration-none text-muted" onClick={() => handleMenuClick("LinhKien")}>› RAM Máy Tính</Link></li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* CỘT 4: MÀN HÌNH */}
                      <div className="col-md-2" style={{ borderRight: "1px solid #eee" }}>
                        <h6 className="fw-bold text-primary mb-3" style={{ fontSize: "15px" }}>Màn Hình Máy Tính</h6>
                        <ul className="list-unstyled lh-lg" style={{ fontSize: "13.5px" }}>
                          <li><Link to="/products" className="text-decoration-none text-muted" onClick={() => handleMenuClick("ManHinh", "MSI")}>› Màn Hình Gaming MSI</Link></li>
                        </ul>
                      </div>

                      {/* CỘT 5: GAMING GEAR */}
                      <div className="col-md-3">
                        <h6 className="fw-bold text-primary mb-3" style={{ fontSize: "15px" }}>Gaming Gear & Phụ Kiện</h6>
                        <ul className="list-unstyled lh-lg" style={{ fontSize: "13.5px" }}>
                          <li><Link to="/products" className="text-decoration-none text-muted" onClick={() => handleMenuClick("GamingGear", "Logitech")}>› Chuột Không Dây Logitech</Link></li>
                          <li><Link to="/products" className="text-decoration-none text-muted" onClick={() => handleMenuClick("GamingGear", "Asus")}>› Bàn Phím Cơ ROG Strix</Link></li>
                        </ul>
                      </div>

                    </div>
                  </div>
                </div>
              </li>
            </ul>

            {/* THANH TÌM KIẾM */}
            <form className="d-flex mx-auto col-12 col-lg-5 my-2 my-lg-0">
              <div className="input-group">
                <input type="text" className="form-control border-secondary shadow-none" placeholder="Tìm kiếm sản phẩm công nghệ..." style={{ borderRadius: "20px 0 0 20px" }} />
                <button className="btn btn-primary px-3" type="submit" style={{ borderRadius: "0 20px 20px 0" }}>🔍 Tìm</button>
              </div>
            </form>
            
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;