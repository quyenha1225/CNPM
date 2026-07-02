import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getProductImage, saveProductImage } from "./productFilters";
import defaultImage from "../nillkin-case-1.jpg";
import { useRef } from "react";

function ProductH({ product }) {
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
  return (
    <div className="col">
      <div className="card shadow-sm">
        <div className="row g-0">
          <div className="col-4">
            <Link to="/products/1" href="!#" replace>
              <div
                className="badge bg-dim py-2 text-white position-absolute"
                style={{ top: "0.5rem", left: "0.5rem" }}
              >
                {product.tag.toUpperCase()}
              </div>
              <img
                className="rounded-start bg-dark cover w-100 h-100"
                alt={product.name}
                src={getProductImage(product) || defaultImage}
              />
            </Link>
          </div>
          <div className="col-8">
            <div className="card-body h-100">
              <div className="d-flex flex-column h-100">
                <h5 className="card-title text-dark text-truncate mb-1">
                  {product.name}
                </h5>
                <span className="card-text text-muted mb-2 flex-shrink-0">
                  {price}₫
                </span>
                <div className="mt-auto d-flex flex-column gap-2">
                  <button className="btn btn-outline-dark ms-auto">
                    <FontAwesomeIcon icon={["fas", "cart-plus"]} /> Add to cart
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary ms-auto"
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
        </div>
      </div>
    </div>
  );
}

export default ProductH;
