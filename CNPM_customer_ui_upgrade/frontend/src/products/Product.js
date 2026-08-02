import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "../utils/Toast";

const API_BASE = (
  process.env.REACT_APP_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function Product({ data, itemIndex = 0 }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, sessionLoading } = useAuth();
  const [actionLoading, setActionLoading] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const productId = Number(data.id ?? data.product_id ?? 0);
  const productUrl = `/products/${productId}`;
  const rating = Number(data.rating ?? data.average_rating ?? 0);
  const reviewCount = Number(data.reviewCount ?? data.review_count ?? 0);
  const totalSold = Number(data.totalSold ?? data.total_sold ?? 0);
  const stock = Math.max(
    Number(
      data.stock_quantity ??
        data.stockQuantity ??
        data.current_stock ??
        data.stock ??
        0,
    ),
    0,
  );
  const image =
    !imageFailed && (data.image_url || data.image)
      ? data.image_url || data.image
      : `${process.env.PUBLIC_URL || ""}/logo512.png`;

  function requireLogin(intent) {
    if (sessionLoading) {
      toast.warning("Hệ thống đang kiểm tra phiên đăng nhập", 1800);
      return false;
    }

    if (isAuthenticated) return true;

    toast.warning(
      intent === "buy"
        ? "Vui lòng đăng nhập trước khi mua hàng"
        : "Vui lòng đăng nhập trước khi thêm vào giỏ",
      2300,
    );
    navigate("/login", {
      state: { from: productUrl, intent },
    });
    return false;
  }

  async function buildCartItem() {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      credentials: "include",
    });
    const detail = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        Array.isArray(detail.message)
          ? detail.message.join(", ")
          : detail.message || "Không thể tải cấu hình sản phẩm",
      );
    }

    const variants = Array.isArray(detail.variants) ? detail.variants : [];

    if (variants.length > 1) {
      return {
        requiresConfiguration: true,
      };
    }

    const variant = variants[0] || null;
    const additionalPrice = Number(
      variant?.additional_price ?? variant?.additionalPrice ?? 0,
    );
    const itemStock = Math.max(
      Number(
        variant?.available_quantity ??
          variant?.availableQuantity ??
          variant?.stock_quantity ??
          detail.stock_quantity ??
          stock,
      ),
      0,
    );

    return {
      id: productId,
      variantId: variant?.variant_id ?? variant?.variantId ?? variant?.id ?? null,
      variantName: variant?.variant_name ?? variant?.variantName ?? null,
      name: detail.name || detail.product_name || data.name,
      price: Number(detail.price ?? detail.base_price ?? data.price ?? 0) + additionalPrice,
      originalPrice:
        Number(detail.price ?? detail.base_price ?? data.price ?? 0) + additionalPrice,
      image: detail.image || detail.image_url || image,
      stock: itemStock,
      category: data.categoryName || data.category_name || data.category,
      brand: data.brand || data.brand_name,
      selectedOptions: variant
        ? {
            cpu_option: variant.cpu_option || null,
            ram_size: variant.ram_size || null,
            storage_size: variant.storage_size || null,
            gpu_option: variant.gpu_option || null,
            color: variant.color || null,
          }
        : undefined,
    };
  }

  async function handleCartAction(mode) {
    if (!requireLogin(mode) || actionLoading) return;

    setActionLoading(mode);

    try {
      const item = await buildCartItem();

      if (item.requiresConfiguration) {
        toast.warning("Vui lòng chọn cấu hình trước khi mua", 2200);
        navigate(productUrl);
        return;
      }

      if (item.stock <= 0) {
        throw new Error("Sản phẩm hiện đã hết hàng");
      }

      addToCart(item, 1);

      if (mode === "buy") {
        navigate("/payment");
      } else {
        toast.success("Đã thêm sản phẩm vào giỏ hàng", 2000);
      }
    } catch (requestError) {
      toast.error(requestError.message, 2800);
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
        to={productUrl}
        className="product-card-media"
        aria-label={`Xem chi tiết ${data.name}`}
      >
        <img
          className="product-card-image"
          src={image}
          alt={data.name}
          loading={itemIndex < 4 ? "eager" : "lazy"}
          decoding="async"
          onError={() => setImageFailed(true)}
        />

        {totalSold > 0 && (
          <span className="product-sales-badge">
            <FontAwesomeIcon icon={["fas", "fire"]} />
            Đã bán {totalSold.toLocaleString("vi-VN")}
          </span>
        )}

        <span
          className={`product-stock-chip ${
            stock > 0 ? "is-available" : "is-empty"
          }`}
        >
          {stock > 0 ? `Còn ${stock}` : "Hết hàng"}
        </span>
      </Link>

      <div className="product-card-body">
        <div className="product-card-meta">
          <span>{data.brand || data.brand_name || "Gearxin"}</span>
          <strong>{data.categoryName || data.category_name || data.category}</strong>
        </div>

        <Link to={productUrl} className="product-card-title-link">
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
          <Link to={productUrl} className="product-card-detail-btn">
            Chi tiết
          </Link>

          <button
            type="button"
            className="product-card-btn product-card-btn--cart"
            onClick={() => handleCartAction("cart")}
            disabled={stock <= 0 || Boolean(actionLoading) || sessionLoading}
          >
            <FontAwesomeIcon icon={["fas", "cart-plus"]} />
            <span>{actionLoading === "cart" ? "Đang thêm..." : "Thêm giỏ"}</span>
          </button>

          <button
            type="button"
            className="product-card-btn product-card-btn--buy"
            onClick={() => handleCartAction("buy")}
            disabled={stock <= 0 || Boolean(actionLoading) || sessionLoading}
          >
            {actionLoading === "buy" ? "Đang xử lý..." : "Mua ngay"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default Product;
