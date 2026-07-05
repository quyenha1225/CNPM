import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addProductToCart } from "../cart/cartStorage";
import { getProductImage } from "./productImages";

const priceFormatter = new Intl.NumberFormat("vi-VN");

function formatCurrency(value) {
  return `${priceFormatter.format(Math.round(value))} đ`;
}

function Product({ data, itemIndex = 0 }) {
  const { id, name, price, category, brand, percent_off = 0 } = data;
  const [isAdded, setIsAdded] = useState(false);
  const hasSale = percent_off > 0;
  const salePrice = hasSale ? price - (percent_off * price) / 100 : price;

  function handleAddToCart() {
    addProductToCart(data);
    setIsAdded(true);
  }

  return (
    <div className="col product-grid-item" style={{ "--item-index": itemIndex }}>
      <article className="product-card h-100">
        <Link to={`/products/${id}`} className="product-card-media" replace>
          {hasSale && <span className="product-discount-badge">-{percent_off}%</span>}
          <img
            className="product-card-image"
            alt={name}
            src={getProductImage(data)}
            loading="lazy"
            decoding="async"
          />
        </Link>

        <div className="product-card-body">
          <div className="product-card-meta">
            <span>{brand || category}</span>
            {hasSale && <strong>Sale</strong>}
          </div>

          <h2 className="product-card-title" title={name}>
            {name}
          </h2>

          <div className="product-price-row">
            <strong>{formatCurrency(salePrice)}</strong>
            {hasSale && <del>{formatCurrency(price)}</del>}
          </div>

          <div className="product-card-actions">
            <Link to={`/products/${id}`} className="product-card-detail-btn" replace>
              Chi tiết
            </Link>
            <button type="button" className="product-card-btn" onClick={handleAddToCart}>
              <FontAwesomeIcon icon={["fas", isAdded ? "check" : "cart-plus"]} />
              <span>{isAdded ? "Đã thêm" : "Thêm"}</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

export default memo(Product);
