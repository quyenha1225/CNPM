import { memo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { toast } from "../utils/Toast";
import ImageAlt from "../nillkin-case-1.jpg";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

function formatCurrency(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function FeatureProduct({
  product,
  priority = false,
  badge = "",
}) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [actionLoading, setActionLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const productId = Number(
    product.id ?? product.product_id ?? 0
  );
  const productUrl =
    product.to || (productId ? `/products/${productId}` : "/products");
  const productImage =
    !imageError &&
    (product.image ||
      product.image_url ||
      product.thumbnail_url)
      ? product.image ||
        product.image_url ||
        product.thumbnail_url
      : ImageAlt;

  const rawStock =
    product.stock_quantity ??
    product.stockQuantity ??
    product.available_quantity ??
    null;
  const hasStockData = rawStock !== null && rawStock !== undefined;
  const stock = Number(rawStock ?? 0);
  const isOutOfStock = hasStockData && stock <= 0;

  const soldCount = Number(
    product.sold_count ??
      product.total_sold ??
      product.totalSold ??
      product.sold_quantity ??
      0
  );

  const rating = Number(
    product.rating ?? product.average_rating ?? 0
  );
  const reviewCount = Number(
    product.reviewCount ?? product.review_count ?? 0
  );

  const description =
    product.description ||
    product.detail ||
    "Sản phẩm công nghệ chính hãng, phù hợp cho học tập, làm việc và giải trí.";

  async function buildCartProduct() {
    let detail = product;

    if (!productId) {
      throw new Error("INVALID_PRODUCT");
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}`,
        { credentials: "include" }
      );

      if (response.ok) {
        detail = await response.json();
      }
    } catch (error) {
      console.warn(
        "Không tải được chi tiết sản phẩm, dùng dữ liệu card:",
        error
      );
    }

    const variants = Array.isArray(detail?.variants)
      ? detail.variants
      : [];
    const defaultVariant =
      variants.find((variant) =>
        Boolean(Number(variant.is_default))
      ) ||
      variants[0] ||
      null;

    const availableStock = defaultVariant
      ? Number(
          defaultVariant.available_quantity ??
            defaultVariant.stock_quantity ??
            detail.stock_quantity ??
            stock
        )
      : Number(
          detail?.stock_quantity ??
            detail?.available_quantity ??
            stock
        );

    if (availableStock <= 0) {
      throw new Error("OUT_OF_STOCK");
    }

    const basePrice = Number(
      detail.price ??
        detail.base_price ??
        product.price ??
        product.base_price ??
        0
    );
    const additionalPrice = Number(
      defaultVariant?.additional_price ?? 0
    );

    return {
      id: productId,
      variantId: defaultVariant?.variant_id ?? null,
      variantName: defaultVariant?.variant_name ?? null,
      name:
        detail.name ??
        detail.product_name ??
        product.name,
      price: basePrice + additionalPrice,
      originalPrice: basePrice + additionalPrice,
      image:
        detail.image ??
        detail.image_url ??
        productImage,
      brand:
        detail.brand ??
        detail.brand_name ??
        product.brand ??
        "Gearxin",
      category:
        detail.category ??
        detail.category_name ??
        product.categoryName ??
        "Công nghệ",
      stock: availableStock,
      selectedOptions: defaultVariant
        ? {
            color: defaultVariant.color || null,
            ram: defaultVariant.ram_size || null,
            storage: defaultVariant.storage_size || null,
            gpu: defaultVariant.gpu_option || null,
            cpu: defaultVariant.cpu_option || null,
          }
        : {},
    };
  }

  async function addProductToCart({
    showSuccess = true,
  } = {}) {
    if (actionLoading) return false;

    if (isOutOfStock) {
      toast.error("Sản phẩm hiện đã hết hàng");
      return false;
    }

    setActionLoading(true);

    try {
      const cartProduct = await buildCartProduct();
      addToCart(cartProduct, 1);

      if (showSuccess) {
        toast.success(
          cartProduct.variantName
            ? `Đã thêm ${cartProduct.name} - ${cartProduct.variantName} vào giỏ`
            : `Đã thêm ${cartProduct.name} vào giỏ`
        );
      }

      return true;
    } catch (error) {
      if (error?.message === "OUT_OF_STOCK") {
        toast.error("Sản phẩm hoặc cấu hình mặc định đã hết hàng");
      } else {
        console.error("Lỗi thêm sản phẩm vào giỏ:", error);
        toast.error("Không thể thêm sản phẩm vào giỏ hàng");
      }

      return false;
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBuyNow() {
    const added = await addProductToCart({
      showSuccess: false,
    });

    if (added) {
      navigate("/payment");
    }
  }

  return (
    <article className="gx2-product-card">
      <Link
        to={productUrl}
        className="gx2-product-card__media"
        aria-label={`Xem ${product.name}`}
      >
        <span className="gx2-product-card__badge">
          {badge ||
            product.badge ||
            product.brand ||
            "Nổi bật"}
        </span>

        <img
          src={productImage}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setImageError(true)}
        />
      </Link>

      <div className="gx2-product-card__body">
        <div className="gx2-product-card__meta">
          <span>
            {product.categoryName ||
              product.category_name ||
              product.category ||
              "Công nghệ"}
          </span>

          <span
            className={
              isOutOfStock ? "is-out" : "is-in"
            }
          >
            {isOutOfStock ? "Hết hàng" : "Còn hàng"}
          </span>
        </div>

        <h3>
          <Link to={productUrl}>{product.name}</Link>
        </h3>

        <div className="gx2-product-card__rating">
          <span aria-label={`${rating} trên 5 sao`}>
            ★ {rating.toFixed(1)}
          </span>
          <small>({reviewCount} đánh giá)</small>
        </div>

        <p className="gx2-product-card__description">
          {description}
        </p>

        <div className="gx2-product-card__price">
          <strong>
            {formatCurrency(
              product.price ?? product.base_price
            )}
          </strong>

          {soldCount > 0 && (
            <small>
              Đã bán {soldCount.toLocaleString("vi-VN")}
            </small>
          )}
        </div>

        <div className="gx2-product-card__actions">
          <Link
            to={productUrl}
            className="gx2-card-action gx2-card-action--detail"
          >
            Xem chi tiết
          </Link>

          <button
            type="button"
            className="gx2-card-action gx2-card-action--cart"
            onClick={() => addProductToCart()}
            disabled={isOutOfStock || actionLoading}
          >
            {actionLoading ? "Đang xử lý..." : "Thêm vào giỏ"}
          </button>

          <button
            type="button"
            className="gx2-card-action gx2-card-action--buy"
            onClick={handleBuyNow}
            disabled={isOutOfStock || actionLoading}
          >
            {actionLoading ? "Đang xử lý..." : "Mua ngay"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(FeatureProduct);
