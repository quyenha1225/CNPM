import { Link } from "react-router-dom";
import ImageAlt from "../nillkin-case-1.jpg"; // Ảnh dự phòng mặc định khi sản phẩm DB không có ảnh

// Hàm định dạng tiền tệ an toàn tuyệt đối (nhận cả số lẫn chuỗi số từ DB)
function formatCurrency(value) {
  if (value === undefined || value === null) return "0 đ";
  
  // Nếu giá trị truyền vào đã có sẵn chữ 'đ' (dữ liệu tĩnh cũ), trả về luôn
  if (typeof value === "string" && value.includes("đ")) {
    return value;
  }

  const num = Number(value);
  if (isNaN(num)) return value; // Nếu không thể parse thành số thì giữ nguyên
  return num.toLocaleString("vi-VN") + " đ";
}

function FeatureProduct({ product, index = 0 }) {
  if (!product) return null;

  // Tự động nhận diện ảnh từ API (ưu tiên image_url hoặc image từ DB)
  const productImage = product.image || product.image_url || ImageAlt;

  return (
    <div className="col">
      <article className="home-feature-product">
        <Link to={product.to} className="home-feature-media">
          <span className="home-feature-badge">{product.badge}</span>
          <img
            className="responsive-product-image"
            alt={product.name}
            src={productImage}
            loading="lazy"
            decoding="async"
          />
        </Link>
        <div className="home-feature-body">
          <div className="home-product-meta">
            <span>{product.type}</span>
            {/* Sử dụng hàm format tiền tệ chuẩn chỉnh */}
            <strong>{formatCurrency(product.price)}</strong>
          </div>
          <h5>{product.name}</h5>
          <p className="product-desc-limit">{product.detail}</p>
          
          <Link to={product.to} className="home-feature-link">
            Xem chi tiết
          </Link>
        </div>
      </article>
    </div>
  );
}

export default FeatureProduct;