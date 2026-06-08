import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Product(props) {
  // Lấy các trường dữ liệu động được truyền từ ProductList qua props
  // Nếu không có ảnh từ database, sẽ dùng ảnh mặc định nillkin-case-1.jpg làm fallback
  const { id, name, price, image_url, percent_off } = props.data;

  let percentOffBadge;
  let offPrice = `${price} VNĐ`;

  // Kiểm tra nếu sản phẩm có chương trình giảm giá (%)
  if (percent_off && percent_off > 0) {
    percentOffBadge = (
      <div
        className="badge bg-dim py-2 text-white position-absolute"
        style={{ top: "0.5rem", right: "0.5rem" }}
      >
        {percent_off}% OFF
      </div>
    );

    offPrice = (
      <>
        <del className="text-muted">{price} VNĐ</del> {price - (percent_off * price) / 100} VNĐ
      </>
    );
  }

  return (
    <div className="col">
      <div className="card shadow-sm h-100">
        {/* Đường dẫn động chuyển hướng tới đúng ID của sản phẩm đó */}
        <Link to={`/products/${id}`} replace>
          {percentOffBadge}
          <img
            className="card-img-top bg-dark cover"
            height="200"
            alt={name}
            // Ưu tiên hiển thị đường dẫn ảnh từ MySQL, nếu lỗi/trống sẽ dùng ảnh tĩnh trong thư mục
            src={image_url || require("../nillkin-case-1.jpg")}
          />
        </Link>
        <div className="card-body d-flex flex-column justify-content-between">
          <h5 className="card-title text-center text-dark text-truncate" title={name}>
            {name} {/* Tên sản phẩm động */}
          </h5>
          <p className="card-text text-center text-muted mb-0">{offPrice}</p>
          <div className="d-grid d-block">
            <button className="btn btn-outline-dark mt-3">
              <FontAwesomeIcon icon={["fas", "cart-plus"]} /> Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;