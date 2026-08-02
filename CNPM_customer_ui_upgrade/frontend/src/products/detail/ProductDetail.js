import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ScrollToTopOnMount from "../../template/ScrollToTopOnMount";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "../../utils/Toast";
import fallbackImage from "../../nillkin-case-1.jpg";
import "./ProductDetail.css";

const API_BASE = (
  process.env.REACT_APP_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

const VARIANT_DIMENSIONS = [
  { key: "cpu_option", label: "CPU" },
  { key: "ram_size", label: "RAM" },
  { key: "storage_size", label: "Ổ cứng" },
  { key: "gpu_option", label: "Card đồ họa" },
  { key: "color", label: "Màu sắc" },
];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatPrice(value) {
  return currencyFormatter.format(Number(value || 0));
}

function getVariantId(variant) {
  return variant?.variant_id ?? variant?.variantId ?? variant?.id ?? null;
}

function getVariantStock(variant) {
  return Math.max(
    Number(
      variant?.available_quantity ??
        variant?.availableQuantity ??
        variant?.stock_quantity ??
        0,
    ),
    0,
  );
}

function formatSpecValue(spec) {
  if (!spec) return "";
  return spec.attribute_unit
    ? `${spec.attribute_value} ${spec.attribute_unit}`
    : spec.attribute_value;
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, sessionLoading, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError("");
      setImageFailed(false);
      setQuantity(1);

      try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
          credentials: "include",
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            Array.isArray(data.message)
              ? data.message.join(", ")
              : data.message || "Không thể tải sản phẩm",
          );
        }

        setProduct(data);

        fetch(`${API_BASE}/products/recommend/${id}`, {
          credentials: "include",
          signal: controller.signal,
        })
          .then((res) => (res.ok ? res.json() : []))
          .then((items) => setRecommendations(Array.isArray(items) ? items : []))
          .catch(() => {});

        const userId = user?.id ?? user?.user_id;
        if (userId) {
          fetch(`${API_BASE}/products/log-view`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, productId: Number(id) }),
          }).catch(() => {});
        }
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [id, user]);

  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product],
  );

  const dimensionValues = useMemo(() => {
    const result = {};
    VARIANT_DIMENSIONS.forEach((dimension) => {
      result[dimension.key] = [
        ...new Set(variants.map((variant) => variant[dimension.key]).filter(Boolean)),
      ];
    });
    return result;
  }, [variants]);

  const activeDimensions = useMemo(
    () =>
      VARIANT_DIMENSIONS.filter(
        (dimension) => dimensionValues[dimension.key]?.length > 1,
      ),
    [dimensionValues],
  );

  const fixedOptions = useMemo(() => {
    const result = {};
    VARIANT_DIMENSIONS.forEach((dimension) => {
      const values = dimensionValues[dimension.key] || [];
      if (values.length === 1) result[dimension.key] = values[0];
    });
    return result;
  }, [dimensionValues]);

  useEffect(() => {
    setSelectedOptions(fixedOptions);
  }, [fixedOptions, product?.id]);

  function variantMatchesSelection(variant, options) {
    return VARIANT_DIMENSIONS.every((dimension) => {
      const selectedValue = options[dimension.key];
      return !selectedValue || variant[dimension.key] === selectedValue;
    });
  }

  function isOptionAvailable(dimensionKey, value) {
    const candidate = { ...selectedOptions, [dimensionKey]: value };
    return variants.some(
      (variant) => getVariantStock(variant) > 0 && variantMatchesSelection(variant, candidate),
    );
  }

  function selectOption(dimensionKey, value) {
    if (!isOptionAvailable(dimensionKey, value)) return;

    setSelectedOptions((current) => {
      const next = { ...current, [dimensionKey]: value };

      activeDimensions.forEach((dimension) => {
        if (dimension.key === dimensionKey || !next[dimension.key]) return;

        const stillValid = variants.some(
          (variant) =>
            getVariantStock(variant) > 0 && variantMatchesSelection(variant, next),
        );

        if (!stillValid) delete next[dimension.key];
      });

      return next;
    });
  }

  const selectionComplete = activeDimensions.every(
    (dimension) => Boolean(selectedOptions[dimension.key]),
  );

  const matchedVariant = useMemo(() => {
    if (!variants.length) return null;

    if (!activeDimensions.length) {
      return (
        variants.find(
          (variant) =>
            Boolean(variant.is_default ?? variant.isDefault) &&
            getVariantStock(variant) > 0,
        ) || variants.find((variant) => getVariantStock(variant) > 0) || variants[0]
      );
    }

    if (!selectionComplete) return null;

    return (
      variants.find(
        (variant) =>
          getVariantStock(variant) > 0 &&
          VARIANT_DIMENSIONS.every((dimension) => {
            const selected = selectedOptions[dimension.key];
            return !selected || variant[dimension.key] === selected;
          }),
      ) || null
    );
  }, [activeDimensions.length, selectedOptions, selectionComplete, variants]);

  const specifications = Array.isArray(product?.specifications)
    ? product.specifications
    : [];

  const groupedSpecs = useMemo(() => {
    return specifications.reduce((groups, specification) => {
      const groupName = specification.spec_group || "Thông số khác";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(specification);
      groups[groupName].sort(
        (left, right) => Number(left.display_order || 0) - Number(right.display_order || 0),
      );
      return groups;
    }, {});
  }, [specifications]);

  const highlightSpecs = useMemo(() => {
    const highlighted = specifications.filter((spec) => Boolean(spec.is_highlight));
    return (highlighted.length ? highlighted : specifications).slice(0, 6);
  }, [specifications]);

  if (loading) {
    return (
      <main className="gx-detail-loading">
        <div className="gx-detail-spinner" />
        <p>Đang tải thông tin sản phẩm...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="gx-detail-error">
        <h1>Không tìm thấy sản phẩm</h1>
        <p>{error || "Sản phẩm không tồn tại"}</p>
        <Link to="/products">Quay lại danh sách</Link>
      </main>
    );
  }

  const productId = Number(product.id ?? product.product_id ?? id);
  const image = !imageFailed
    ? product.image_url || product.image || fallbackImage
    : fallbackImage;
  const basePrice = Number(product.price ?? product.base_price ?? 0);
  const discountPercent = Number(product.percent_off || 0);
  const discountedBasePrice =
    discountPercent > 0
      ? basePrice - (discountPercent * basePrice) / 100
      : basePrice;
  const variantExtra = Number(
    matchedVariant?.additional_price ?? matchedVariant?.additionalPrice ?? 0,
  );
  const finalPrice = discountedBasePrice + variantExtra;
  const stock = variants.length
    ? getVariantStock(matchedVariant)
    : Math.max(
        Number(
          product.stock_quantity ??
            product.stockQuantity ??
            product.current_stock ??
            product.stock ??
            0,
        ),
        0,
      );
  const readyToBuy =
    stock > 0 && (!variants.length || Boolean(matchedVariant)) && selectionComplete;

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
      2400,
    );
    navigate("/login", {
      state: { from: `/products/${productId}`, intent },
    });
    return false;
  }

  function createCartItem() {
    return {
      id: productId,
      variantId: getVariantId(matchedVariant),
      variantName:
        matchedVariant?.variant_name ?? matchedVariant?.variantName ?? null,
      name: product.name ?? product.product_name,
      price: finalPrice,
      originalPrice: basePrice + variantExtra,
      image,
      stock,
      brand: product.brand ?? product.brand_name ?? "Gearxin",
      category: product.category ?? product.category_name ?? "Công nghệ",
      selectedOptions: variants.length ? { ...selectedOptions } : undefined,
    };
  }

  function addCurrentProduct(intent) {
    if (!requireLogin(intent)) return false;

    if (!readyToBuy) {
      toast.error(
        variants.length && !matchedVariant
          ? "Vui lòng chọn đầy đủ cấu hình còn hàng"
          : "Sản phẩm hiện đã hết hàng",
        2400,
      );
      return false;
    }

    setActionLoading(intent);
    addToCart(createCartItem(), quantity);
    setActionLoading("");
    return true;
  }

  function handleAddToCart() {
    if (addCurrentProduct("cart")) {
      toast.success("Đã thêm sản phẩm vào giỏ hàng", 2000);
    }
  }

  function handleBuyNow() {
    if (addCurrentProduct("buy")) navigate("/payment");
  }

  return (
    <main className="gx-detail-page">
      <ScrollToTopOnMount />

      <div className="gx-detail-container">
        <Link to="/products" className="gx-detail-back">
          ← Quay lại danh sách sản phẩm
        </Link>

        <section className="gx-detail-hero">
          <div className="gx-detail-gallery">
            {discountPercent > 0 && (
              <span className="gx-detail-sale">-{discountPercent}%</span>
            )}
            <div className="gx-detail-image-wrap">
              <img
                src={image}
                alt={product.name}
                onError={() => setImageFailed(true)}
              />
            </div>
            <div className="gx-detail-benefits">
              <span>✓ Chính hãng</span>
              <span>✓ Bảo hành rõ ràng</span>
              <span>✓ Hỗ trợ cấu hình</span>
            </div>
          </div>

          <div className="gx-detail-info">
            <span className="gx-detail-brand">
              {product.brand || product.brand_name || "Gearxin"}
            </span>

            <h1>{product.name || product.product_name}</h1>

            <div className="gx-detail-meta">
              <span>{product.category || product.category_name || "Công nghệ"}</span>
              <span>
                ★ {Number(product.average_rating ?? product.rating ?? 0).toFixed(1)} (
                {Number(product.review_count ?? product.reviewCount ?? 0)} đánh giá)
              </span>
              <span className={stock > 0 ? "is-stock" : "is-empty"}>
                {stock > 0 ? `Còn ${stock} sản phẩm` : "Hết hàng"}
              </span>
            </div>

            <div className="gx-detail-price">
              <strong>{formatPrice(finalPrice)}</strong>
              {discountPercent > 0 && <del>{formatPrice(basePrice + variantExtra)}</del>}
            </div>

            {highlightSpecs.length > 0 && (
              <div className="gx-detail-highlights">
                {highlightSpecs.map((spec) => (
                  <div key={spec.attribute_id || spec.attribute_name}>
                    <small>{spec.attribute_name}</small>
                    <strong>{formatSpecValue(spec)}</strong>
                  </div>
                ))}
              </div>
            )}

            {activeDimensions.length > 0 && (
              <div className="gx-detail-variants">
                <div className="gx-detail-variants__title">
                  <strong>Chọn cấu hình</strong>
                  <span>
                    {selectionComplete && matchedVariant
                      ? "Cấu hình hợp lệ"
                      : "Vui lòng chọn đủ tùy chọn"}
                  </span>
                </div>

                {activeDimensions.map((dimension) => (
                  <div className="gx-detail-variant-group" key={dimension.key}>
                    <label>{dimension.label}</label>
                    <div>
                      {dimensionValues[dimension.key].map((value) => {
                        const selected = selectedOptions[dimension.key] === value;
                        const available = isOptionAvailable(dimension.key, value);

                        return (
                          <button
                            key={value}
                            type="button"
                            className={selected ? "is-selected" : ""}
                            disabled={!available}
                            onClick={() => selectOption(dimension.key, value)}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="gx-detail-description">
              {product.description ||
                product.product_description ||
                "Sản phẩm công nghệ chính hãng, được kiểm tra trước khi giao."}
            </p>

            <div className="gx-detail-purchase-row">
              <div className="gx-detail-quantity">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(value - 1, 1))}
                >
                  −
                </button>
                <strong>{quantity}</strong>
                <button
                  type="button"
                  disabled={!readyToBuy || quantity >= stock}
                  onClick={() => setQuantity((value) => Math.min(value + 1, stock))}
                >
                  +
                </button>
              </div>

              <div className="gx-detail-actions">
                <button
                  type="button"
                  className="gx-detail-cart-button"
                  disabled={!readyToBuy || Boolean(actionLoading)}
                  onClick={handleAddToCart}
                >
                  {actionLoading === "cart" ? "Đang thêm..." : "Thêm vào giỏ"}
                </button>

                <button
                  type="button"
                  className="gx-detail-buy-button"
                  disabled={!readyToBuy || Boolean(actionLoading)}
                  onClick={handleBuyNow}
                >
                  {actionLoading === "buy" ? "Đang xử lý..." : "Mua ngay"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {Object.keys(groupedSpecs).length > 0 && (
          <section className="gx-detail-specs">
            <header>
              <span>THÔNG SỐ SẢN PHẨM</span>
              <h2>Thông số kỹ thuật chi tiết</h2>
            </header>

            <div className="gx-detail-spec-grid">
              {Object.entries(groupedSpecs).map(([groupName, groupItems]) => (
                <article key={groupName}>
                  <h3>{groupName}</h3>
                  {groupItems.map((spec) => (
                    <dl key={spec.attribute_id || `${groupName}-${spec.attribute_name}`}>
                      <dt>{spec.attribute_name}</dt>
                      <dd>{formatSpecValue(spec)}</dd>
                    </dl>
                  ))}
                </article>
              ))}
            </div>
          </section>
        )}

        {recommendations.length > 0 && (
          <section className="gx-detail-related">
            <header>
              <span>SẢN PHẨM LIÊN QUAN</span>
              <h2>Có thể bạn cũng quan tâm</h2>
            </header>

            <div className="gx-detail-related-grid">
              {recommendations.slice(0, 4).map((item) => (
                <Link key={item.id} to={`/products/${item.id}`}>
                  <div>
                    <img src={item.image_url || fallbackImage} alt={item.name} />
                  </div>
                  <span>{item.brand || "Gearxin"}</span>
                  <h3>{item.name}</h3>
                  <strong>{formatPrice(item.price)}</strong>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default ProductDetail;
