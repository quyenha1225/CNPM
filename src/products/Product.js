import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getProductImage, saveProductImage } from "./productFilters";
import defaultImage from "../nillkin-case-1.jpg";
import { useRef } from "react";

function Product({ product }) {
  const fileInputRef = useRef(null);

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      saveProductImage(product.id, reader.result);
      window.location.reload();
    };
    reader.readAsDataURL(file);
  }
  const price = product.price.toLocaleString("vi-VN");
  const badge = product.tag === "sale" ? "SALE" : product.tag === "new" ? "NEW" : "HOT";

  return (
    <div className="col">
      <div className="card shadow-sm h-100">
        <Link to="/products/1" href="!#" replace>
          <div
            className="badge bg-dim py-2 text-white position-absolute"
            style={{ top: "0.5rem", right: "0.5rem" }}
          >
            {badge}
          </div>
          <img
            className="card-img-top bg-dark cover"
            height="200"
            alt={product.name}
            src={getProductImage(product) || defaultImage}
          />
        </Link>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-center text-dark text-truncate">
            {product.name}
          </h5>
          <p className="card-text text-center text-muted mb-0">{price}₫</p>
          <p className="card-text text-center text-muted small mt-1">
            {product.category} · {product.brand}
          </p>
          <div className="d-grid d-block mt-auto">
            <button className="btn btn-outline-dark mt-3">
              <FontAwesomeIcon icon={["fas", "cart-plus"]} /> Add to cart
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <FontAwesomeIcon icon={["fas", "image"]} /> Change image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleImageUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
