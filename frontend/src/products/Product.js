import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "../utils/Toast";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function Product({ data, itemIndex = 0 }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [actionLoading, setActionLoading] = useState("");

  const productId = Number(data.id);
  const rating = Number(data.rating ?? data.average_rating ?? 0);
  const reviewCount = Number(data.reviewCount ?? data.review_count ?? 0);
  const totalSold = Number(data.totalSold ?? data.total_sold ?? 0);
  const stock = Number(data.stock_quantity ?? data.stock ?? 0);
  const image =
    data.image_url ||
    data.image ||
    "https://via.placeholder.com/600x450?text=ElectroShop";

  async function buildCartItem() {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Không thể tải cấu hình sản phẩm");
    }

    const detail = await response.json();
    const variants = Array.isArray(detail.variants) ? detail.variants : [];
    const defaultVariant =
      variants.find(
        (variant) =>
          variant.isDefault ||
          variant.is_default ||
          variant.is_default_variant,
      ) || variants[0];

    const additionalPrice = Number(
      defaultVariant?.additionalPrice ??
        defaultVariant?.additional_price ??
        0,
    );

    const finalPrice = Number(detail.price ?? data.price ?? 0) + additionalPrice;

    return {
      id: productId,
      variantId:
        defaultVariant?.id ??
        defaultVariant?.variantId ??
        defaultVariant?.variant_id ??
        null,
      variantName:
        defaultVariant?.name ??
        defaultVariant?.variantName ??
        defaultVariant?.variant_name ??
        "Mặc định",
      name: detail.name || data.name,
      price: finalPrice,
      image: detail.image || detail.image_url || image,
      stock:
        Number(
          defaultVariant?.availableQuantity ??
            defaultVariant?.available_quantity ??
            detail.stock_quantity ??
            stock,
        ) || 0,
      category: data.category,
      brand: data.brand,
    };
  }

  async function handleCartAction(mode) {
    setActionLoading(mode);

    try {
      const item = await buildCartItem();

      if (item.stock <= 0) {
        throw new Error("Sản phẩm hiện đã hết hàng");
      }

      addToCart(item, 1);

      if (mode === "buy") {
        navigate("/payment");
      } else {
        toast.success("Đã thêm sản phẩm vào giỏ hàng", 2200);
      }
    } catch (error) {
      toast.error(error.message, 3000);
    } finally {
      setActionLoading("");
    }
  }

  return (
    <article
      className="product-card product-card--premium"
      style={{ "--item-index": itemIndex }}
    >
      <Link
        to={`/products/${productId}`}
        className="product-card-media"
        aria-label={`Xem chi tiết ${data.name}`}
      >
        <img className="product-card-image" src={image} alt={data.name} />

        {totalSold > 0 && (
          <span className="product-sales-badge">
            <FontAwesomeIcon icon={["fas", "fire"]} />
            Đã bán {totalSold}
          </span>
        )}

        {stock > 0 ? (
          <span className="product-stock-chip is-available">
            Còn {stock}
          </span>
        ) : (
          <span className="product-stock-chip is-empty">Hết hàng</span>
        )}
      </Link>

      <div className="product-card-body">
        <div className="product-card-meta">
          <span>{data.brand || "ElectroShop"}</span>
          <strong>{data.categoryName || data.category || "Công nghệ"}</strong>
        </div>

        <Link to={`/products/${productId}`} className="product-card-title-link">
          <h3 className="product-card-title">{data.name}</h3>
        </Link>

        <div className="product-rating-row">
          <span>
            <FontAwesomeIcon icon={["fas", "star"]} />
            {rating.toFixed(1)}
          </span>
          <small>{reviewCount} đánh giá</small>
        </div>

        <div className="product-price-row">
          <strong>{formatPrice(data.price)}</strong>
        </div>

        <div className="product-card-actions product-card-actions--three">
          <Link
            to={`/products/${productId}`}
            className="product-card-detail-btn"
          >
            Chi tiết
          </Link>

          <button
            type="button"
            className="product-card-btn product-card-btn--cart"
            onClick={() => handleCartAction("cart")}
            disabled={stock <= 0 || Boolean(actionLoading)}
            title="Thêm vào giỏ"
          >
            <FontAwesomeIcon icon={["fas", "cart-plus"]} />
            <span>
              {actionLoading === "cart" ? "Đang thêm..." : "Thêm giỏ"}
            </span>
          </button>

          <button
            type="button"
            className="product-card-btn product-card-btn--buy"
            onClick={() => handleCartAction("buy")}
            disabled={stock <= 0 || Boolean(actionLoading)}
          >
            {actionLoading === "buy" ? "Đang xử lý..." : "Mua ngay"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default Product;
