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

  const {
    id,
    name,
    price,
    image_url,
    percent_off,
    brand,
    category,
    average_rating,
    review_count,
    stock_quantity,
  } = data;

  const image = image_url || fallbackImage;

  const finalPrice =
    percent_off > 0
      ? price - (percent_off * price) / 100
      : price;

  const inStock = stock_quantity > 0;

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    addToCart({
      id,
      name,
      price: finalPrice,
      originalPrice: price,
      brand,
      category,
      image,
      quantity: 1,
      stock: stock_quantity,
    });

    toast.success("✓ Đã thêm vào giỏ hàng", 3000);
  };

  return (
    <div className="col">
      <div className="card shadow-sm h-100">

        <Link to={`/products/${id}`}>

          {percent_off > 0 && (
            <div
              className="badge bg-danger position-absolute"
              style={{
                top: 10,
                right: 10,
                zIndex: 10,
              }}
            >
              -{percent_off}%
            </div>
          )}

          {!inStock && (
            <div
              className="badge bg-secondary position-absolute"
              style={{
                top: 45,
                right: 10,
                zIndex: 10,
              }}
            >
              Hết hàng
            </div>
          )}

          <img
            src={image}
            alt={name}
            className="card-img-top bg-white"
            height="220"
            style={{
              objectFit: "contain",
            }}
          />

        </Link>

        <div className="card-body d-flex flex-column">

          <h5
            className="card-title"
            title={name}
          >
            {name}
          </h5>

          <small className="text-muted">

            {brand}

          </small>

          <small className="text-muted mb-2">

            {category}

          </small>

          <div className="mb-2">

            ⭐ {average_rating ?? 0}

            <small className="text-muted">

              {" "}
              ({review_count ?? 0} đánh giá)

            </small>

          </div>

          <div className="mb-2">

            {percent_off > 0 && (
              <div>

                <del className="text-muted">

                  {formatPrice(price)}

                </del>

              </div>
            )}

            <div className="text-danger fw-bold fs-5">

              {formatPrice(finalPrice)}

            </div>

          </div>

          <div className="mb-3">

            {inStock ? (
              <span className="text-success">

                Còn {stock_quantity} sản phẩm

              </span>
            ) : (
              <span className="text-danger">

                Hết hàng

              </span>
            )}

          </div>

          <div className="mt-auto">

            <button
              className="btn btn-dark w-100"
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              <FontAwesomeIcon icon={["fas", "cart-plus"]} />

              {" "}Thêm vào giỏ
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Product;