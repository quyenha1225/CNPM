import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCart } from "../context/CartContext";
import { toast } from "../utils/Toast";
import fallbackImage from "../nillkin-case-1.jpg";

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price) + " đ";
}

function Product({ data }) {
  const { addToCart } = useCart();
  const { id, name, price, image_url, percent_off } = data;
  let image = fallbackImage;
  if (image_url) {
    image = image_url.startsWith("/") ? process.env.PUBLIC_URL + image_url : image_url;
  }

  const finalPrice = percent_off ? price - (percent_off * price) / 100 : price;

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price: finalPrice,
      image,
      quantity: 1,
    });
    toast.success("✓ Sản phẩm đã được thêm vào giỏ hàng!", 3000);
  };

  return (
    <div className="col">
      <div className="card shadow-sm h-100">
        <Link to={`/products/${id}`}>
          {percent_off > 0 && (
            <div
              className="badge bg-dim py-2 text-white position-absolute"
              style={{ top: "0.5rem", right: "0.5rem" }}
            >
              {percent_off}% OFF
            </div>
          )}
          <img className="card-img-top bg-dark cover" height="200" alt={name} src={image} />
        </Link>

        <div className="card-body d-flex flex-column justify-content-between">
          <h5 className="card-title text-center text-dark" title={name}>
            {name}
          </h5>
          <p className="card-text text-center text-muted mb-0">
            {percent_off > 0 && (
              <>
                <del>{formatPrice(price)}</del>{" "}
              </>
            )}
            <span className="fw-bold text-danger">{formatPrice(finalPrice)}</span>
          </p>
          <div className="d-grid d-block">
            <button type="button" className="btn btn-outline-dark mt-3" onClick={handleAddToCart}>
              <FontAwesomeIcon icon={["fas", "cart-plus"]} /> Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
