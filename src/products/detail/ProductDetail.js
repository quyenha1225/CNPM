import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ScrollToTopOnMount from "../../template/ScrollToTopOnMount";
import { addProductToCart } from "../../cart/cartStorage";
import { menuCategories, mockProductsFromMySQL } from "../ProductList";
import { getProductImage } from "../productImages";

const priceFormatter = new Intl.NumberFormat("vi-VN");

function formatCurrency(value) {
  return `${priceFormatter.format(Math.round(value))} đ`;
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cartMessage, setCartMessage] = useState("");

  const product = useMemo(() => {
    return mockProductsFromMySQL.find((item) => String(item.id) === String(id));
  }, [id]);

  const categoryName = useMemo(() => {
    if (!product) return "";
    return menuCategories.find((item) => item.id === product.category)?.name || product.category;
  }, [product]);

  if (!product) {
    return (
      <div className="product-detail-page">
        <ScrollToTopOnMount />
        <div className="container">
          <div className="product-detail-empty">
            <span>404</span>
            <h1>Sản phẩm không tồn tại</h1>
            <p>Sản phẩm này có thể đã ngừng bán hoặc đường dẫn chưa đúng.</p>
            <Link to="/products" className="product-detail-primary-btn">
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasSale = product.percent_off > 0;
  const salePrice = hasSale ? product.price - (product.percent_off * product.price) / 100 : product.price;

  function handleAddToCart() {
    addProductToCart(product);
    setCartMessage("Đã thêm sản phẩm vào giỏ hàng.");
  }

  function handleBuyNow() {
    addProductToCart(product);
    navigate("/cart");
  }

  return (
    <div className="product-detail-page">
      <ScrollToTopOnMount />
      <div className="container">
        <Link to="/products" className="product-detail-back">
          <FontAwesomeIcon icon={["fas", "arrow-left"]} />
          Quay lại danh sách
        </Link>

        <section className="product-detail-shell">
          <div className="product-detail-media">
            {hasSale && <span className="product-detail-sale">-{product.percent_off}%</span>}
            <img
              src={getProductImage(product)}
              alt={product.name}
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="product-detail-info">
            <span className="product-detail-kicker">{categoryName}</span>
            <h1>{product.name}</h1>

            <div className="product-detail-price">
              <strong>{formatCurrency(salePrice)}</strong>
              {hasSale && <del>{formatCurrency(product.price)}</del>}
            </div>

            <div className="product-detail-tags">
              <span>{product.brand || "Gearxin"}</span>
              <span>Còn hàng</span>
              <span>Bảo hành chính hãng</span>
            </div>

            <p className="product-detail-description">
              Cấu hình được chọn cho nhu cầu học tập, làm việc, gaming và nâng cấp góc máy.
              Gearxin hỗ trợ tư vấn linh kiện tương thích, tối ưu ngân sách và kiểm tra trước khi giao.
            </p>

            <div className="product-detail-specs">
              <div>
                <span>Danh mục</span>
                <strong>{categoryName}</strong>
              </div>
              <div>
                <span>Thương hiệu</span>
                <strong>{product.brand || "Khác"}</strong>
              </div>
              <div>
                <span>Ưu đãi</span>
                <strong>{hasSale ? `${product.percent_off}%` : "Giá tốt"}</strong>
              </div>
            </div>

            <div className="product-detail-actions">
              <button type="button" className="product-detail-primary-btn" onClick={handleAddToCart}>
                <FontAwesomeIcon icon={["fas", "cart-plus"]} />
                Thêm vào giỏ
              </button>
              <button type="button" className="product-detail-secondary-btn" onClick={handleBuyNow}>
                <FontAwesomeIcon icon={["fas", "shopping-bag"]} />
                Mua ngay
              </button>
            </div>

            {cartMessage && (
              <div className="product-detail-cart-note" role="status">
                <FontAwesomeIcon icon={["fas", "check-circle"]} />
                <span>{cartMessage}</span>
                <Link to="/cart">Xem giỏ hàng</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProductDetail;
