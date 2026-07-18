import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ScrollToTopOnMount from "../../template/ScrollToTopOnMount";
import { useCart } from "../../context/CartContext";
import { toast } from "../../utils/Toast";
import fallbackImage from "../../nillkin-case-1.jpg";
import "./ProductDetail.css";

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price) + " đ";
}

function getDiscountedPrice(product) {
  if (!product.percent_off) return product.price;
  return product.price - (product.percent_off * product.price) / 100;
}

// Cac chieu cau hinh co the chon mua
const VARIANT_DIMENSIONS = [
  { key: "cpu_option", label: "CPU" },
  { key: "ram_size", label: "RAM" },
  { key: "storage_size", label: "Ổ cứng" },
  { key: "gpu_option", label: "Card đồ họa" },
  { key: "color", label: "Màu sắc" },
];

const SPEC_ICON_MAP = {
  "cpu": "🧠",
  "ram": "💾",
  "ổ cứng": "💽",
  "card đồ họa": "🎮",
  "gpu": "🎮",
  "màn hình": "🖥️",
  "pin": "🔋",
  "hệ điều hành": "⚙️",
  "trọng lượng": "⚖️",
};

function getSpecIcon(attributeName) {
  const key = (attributeName || "").toLowerCase();
  const found = Object.keys(SPEC_ICON_MAP).find((k) => key.includes(k));
  return found ? SPEC_ICON_MAP[found] : "🔧";
}

function formatSpecValue(spec) {
  if (!spec) return "";
  return spec.attribute_unit
    ? `${spec.attribute_value} ${spec.attribute_unit}`
    : spec.attribute_value;
}

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    setLoading(true);

    // Goi dung API lay chi tiet 1 san pham
    fetch(`http://localhost:3001/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải sản phẩm");
        return res.json();
      })
      .then((productData) => {
        setProduct(productData);
        setLoading(false);

        fetch("http://localhost:3001/api/products/log-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: 1,
            productId: Number(id),
          }),
        }).catch(() => {});

        fetch(`http://localhost:3001/api/products/recommend/${id}`)
          .then((res) => res.json())
          .then((data) => setRecommendations(data))
          .catch(() => {});
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const variants = product.variants || [];
    if (variants.length === 0) {
      setSelectedOptions({});
      return;
    }
    const defaultVariant = variants.find((v) => v.is_default) || variants[0];
    setSelectedOptions({
      ram_size: defaultVariant.ram_size ?? null,
      storage_size: defaultVariant.storage_size ?? null,
      cpu_option: defaultVariant.cpu_option ?? null,
      gpu_option: defaultVariant.gpu_option ?? null,
      color: defaultVariant.color ?? null,
    });
  }, [product]);

  if (loading) {
    return (
      <div className="container text-center my-5 py-5">
        <div className="spinner-border text-dark"></div>
        <p className="mt-3">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container text-center mt-5">
        <h2 className="text-danger">Không tìm thấy sản phẩm</h2>
        <p>{error}</p>
        <Link to="/products" className="btn btn-dark">
          Quay lại
        </Link>
      </div>
    );
  }

  const image = product.image_url || fallbackImage;
  const specifications = product.specifications || [];
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  const activeDimensions = VARIANT_DIMENSIONS.filter((dim) => {
    const distinctValues = new Set(
      variants.map((v) => v[dim.key]).filter(Boolean)
    );
    return distinctValues.size > 1;
  });

  const isOptionAvailable = (dimKey, value) =>
    variants.some((v) => {
      if (v[dimKey] !== value) return false;
      return activeDimensions.every((dim) => {
        if (dim.key === dimKey) return true;
        const selected = selectedOptions[dim.key];
        return selected == null || v[dim.key] === selected;
      });
    });

  const matchedVariant = hasVariants
    ? variants.find((v) =>
        activeDimensions.every((dim) => v[dim.key] === selectedOptions[dim.key])
      ) || null
    : null;

  const handleSelectOption = (dimKey, value) => {
    if (!isOptionAvailable(dimKey, value)) return;
    setSelectedOptions((prev) => ({ ...prev, [dimKey]: value }));
  };

  const basePriceAfterDiscount = getDiscountedPrice(product);
  const variantExtra = matchedVariant?.additional_price
    ? Number(matchedVariant.additional_price)
    : 0;
  const finalPrice = basePriceAfterDiscount + variantExtra;

  const stock = hasVariants
    ? matchedVariant?.stock_quantity ?? 0
    : product.stock_quantity ?? 0;

  const rating = product.average_rating ?? 0;
  const reviewCount = product.review_count ?? 0;

  const highlightSpecs =
    specifications.filter((s) => s.is_highlight).length > 0
      ? specifications.filter((s) => s.is_highlight)
      : [...specifications]
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .slice(0, 4);

  const groupedSpecs = specifications.reduce((acc, spec) => {
    const groupName = spec.spec_group || "Thông số khác";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(spec);
    return acc;
  }, {});

  Object.values(groupedSpecs).forEach((list) =>
    list.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  );

  const specGroupNames = Object.keys(groupedSpecs).sort((a, b) => {
    const orderA = Math.min(...groupedSpecs[a].map((s) => s.display_order ?? 0));
    const orderB = Math.min(...groupedSpecs[b].map((s) => s.display_order ?? 0));
    return orderA - orderB;
  });

  const handleAddToCart = () => {
    if (hasVariants && !matchedVariant) {
      toast.error("Vui lòng chọn cấu hình còn hàng");
      return;
    }
    if (stock <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }
    addToCart({
      id: product.id,
      variantId: matchedVariant?.variant_id ?? null,
      variantName: matchedVariant?.variant_name ?? null,
      name: product.name,
      price: finalPrice,
      originalPrice: product.price + variantExtra,
      image,
      brand: product.brand,
      category: product.category,
      quantity: 1,
      stock,
      selectedOptions: hasVariants ? { ...selectedOptions } : undefined,
    });
    toast.success("Đã thêm vào giỏ hàng");
  };

  return (
    <>
      <ScrollToTopOnMount />

      <div className="container product-detail-page">
        <Link to="/products" className="product-detail-back">
          ← Quay lại danh sách
        </Link>

        {/* Khung bao bọc chính đã được sửa */}
        <div className="product-detail-shell">
          
          {/* Cột hình ảnh đã được sửa */}
          <div className="product-detail-media">
            {product.percent_off > 0 && (
              <div className="product-detail-sale">
                -{product.percent_off}%
              </div>
            )}
            <img src={image} alt={product.name} />
          </div>

          {/* Cột thông tin đã được sửa */}
          <div className="product-detail-info">
            
            <span className="product-detail-kicker">{product.brand || "ElectroShop"}</span>
            
            <h1>{product.name}</h1>

            <div className="product-detail-tags">
              <span>{product.category}</span>
              <span>⭐ {rating}/5 ({reviewCount} đánh giá)</span>
              {stock > 0 ? (
                <span>Kho còn: {stock}</span>
              ) : (
                <span style={{ color: '#dc3545' }}>Hết hàng</span>
              )}
            </div>

            {/* Khu vực giá tiền đã được sửa */}
            <div className="product-detail-price">
              <strong>{formatPrice(finalPrice)}</strong>
              {product.percent_off > 0 && (
                <del>{formatPrice(product.price + variantExtra)}</del>
              )}
            </div>

            {hasVariants && activeDimensions.length > 0 && (
              <div className="variant-selector mb-4">
                {activeDimensions.map((dim) => {
                  const values = [
                    ...new Set(variants.map((v) => v[dim.key]).filter(Boolean)),
                  ];
                  return (
                    <div className="variant-group mb-3" key={dim.key}>
                      <div className="variant-group-label fw-bold mb-2">{dim.label}</div>
                      <div className="variant-options d-flex gap-2 flex-wrap">
                        {values.map((value) => {
                          const isSelected = selectedOptions[dim.key] === value;
                          const available = isOptionAvailable(dim.key, value);
                          return (
                            <button
                              type="button"
                              key={value}
                              className={`btn ${isSelected ? "btn-dark" : "btn-outline-secondary"} ${!available ? "disabled" : ""}`}
                              disabled={!available}
                              onClick={() => handleSelectOption(dim.key, value)}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {!matchedVariant && (
                  <p className="text-danger mt-2 mb-0">Cấu hình này hiện chưa có sẵn.</p>
                )}
              </div>
            )}

            {/* Mô tả sản phẩm đã được sửa */}
            <div className="product-detail-description">
              <p>{product.description || "Sản phẩm chưa có mô tả chi tiết."}</p>
            </div>

            {/* Nút bấm mua hàng đã được sửa */}
            <div className="product-detail-actions mt-4">
              <button
                className="product-detail-primary-btn"
                disabled={stock <= 0 || (hasVariants && !matchedVariant)}
                onClick={handleAddToCart}
              >
                🛒 {stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
              </button>
              <button className="product-detail-secondary-btn">
                ❤️ Yêu thích
              </button>
            </div>

          </div>
        </div>

        {specifications.length > 0 && (
          <div className="spec-section mt-5 bg-white p-4 rounded shadow-sm">
            <h3 className="mb-4">Thông số kỹ thuật</h3>
            <div className="row g-4">
              {specGroupNames.map((groupName) => (
                <div className="col-md-6" key={groupName}>
                  <h5 className="text-danger border-bottom pb-2 mb-3">{groupName}</h5>
                  <table className="table table-striped">
                    <tbody>
                      {groupedSpecs[groupName].map((spec) => (
                        <tr key={spec.attribute_id}>
                          <td className="text-muted w-50">{spec.attribute_name}</td>
                          <td className="fw-bold">{formatSpecValue(spec)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="related-section mt-5">
            <h3 className="mb-4">Sản phẩm liên quan</h3>
            <div className="row g-4">
              {recommendations.map((item) => {
                const price = item.percent_off
                  ? item.price - (item.percent_off * item.price) / 100
                  : item.price;
                return (
                  <div className="col-lg-3 col-md-4 col-sm-6" key={item.id}>
                    <div className="card h-100 shadow-sm border-0">
                      <Link to={`/products/${item.id}`} className="text-decoration-none text-dark">
                        <img
                          src={item.image_url || fallbackImage}
                          className="card-img-top bg-light p-3"
                          alt={item.name}
                          style={{ objectFit: 'contain', height: '200px' }}
                        />
                        <div className="card-body">
                          <h6 className="card-title text-truncate">{item.name}</h6>
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <strong className="text-danger">{formatPrice(price)}</strong>
                            {item.percent_off > 0 && (
                              <small className="text-muted text-decoration-line-through">
                                {formatPrice(item.price)}
                              </small>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default ProductDetail;
