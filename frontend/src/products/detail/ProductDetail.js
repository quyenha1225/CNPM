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

// Cac chieu cau hinh co the chon mua (khop voi cot trong product_variants).
// Chi hien selector cho chieu nao co >= 2 gia tri khac nhau giua cac variant.
const VARIANT_DIMENSIONS = [
  { key: "cpu_option", label: "CPU" },
  { key: "ram_size", label: "RAM" },
  { key: "storage_size", label: "Ổ cứng" },
  { key: "gpu_option", label: "Card đồ họa" },
  { key: "color", label: "Màu sắc" },
];

// Icon rieng cho 1 vai thong so hay gap, con lai dung icon mac dinh.
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

  // Cau hinh dang duoc chon: { ram_size, storage_size, cpu_option, gpu_option, color }
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    setLoading(true);

    fetch("http://localhost:3001/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải sản phẩm");
        return res.json();
      })
      .then((products) => {
        const found = products.find(
          (item) => String(item.id) === id
        );

        if (!found)
          throw new Error("Không tìm thấy sản phẩm");

        setProduct(found);
        setLoading(false);

        fetch(
          "http://localhost:3001/api/products/log-view",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: 1,
              productId: Number(id),
            }),
          }
        ).catch(() => {});

        fetch(
          `http://localhost:3001/api/products/recommend/${id}`
        )
          .then((res) => res.json())
          .then((data) =>
            setRecommendations(data)
          )
          .catch(() => {});
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Khi san pham (hoac cac variant cua no) da tai xong, chon san
  // cau hinh mac dinh (is_default = true, hoac variant dau tien).
  useEffect(() => {
    if (!product) return;

    const variants = product.variants || [];

    if (variants.length === 0) {
      setSelectedOptions({});
      return;
    }

    const defaultVariant =
      variants.find((v) => v.is_default) || variants[0];

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

        <p className="mt-3">
          Đang tải sản phẩm...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container text-center mt-5">

        <h2 className="text-danger">
          Không tìm thấy sản phẩm
        </h2>

        <p>{error}</p>

        <Link
          to="/products"
          className="btn btn-dark"
        >
          Quay lại
        </Link>

      </div>
    );
  }

  const image = product.image_url || fallbackImage;

  const specifications = product.specifications || [];
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  // Chi giu lai cac chieu cau hinh thuc su co nhieu hon 1 lua chon
  const activeDimensions = VARIANT_DIMENSIONS.filter((dim) => {
    const distinctValues = new Set(
      variants.map((v) => v[dim.key]).filter(Boolean)
    );
    return distinctValues.size > 1;
  });

  // 1 gia tri cua 1 chieu con "chon duoc" neu ton tai it nhat 1 variant
  // khop voi gia tri do VA khop voi cac lua chon hien tai o cac chieu khac
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
        activeDimensions.every(
          (dim) => v[dim.key] === selectedOptions[dim.key]
        )
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
  // Luu y: % giam gia hien chi ap dung tren gia goc cua san pham,
  // phan phu thu cua cau hinh (additional_price) duoc cong them sau,
  // KHONG bi giam gia. Neu can giam ca phan phu thu, sua o day.
  const finalPrice = basePriceAfterDiscount + variantExtra;

  const stock = hasVariants
    ? matchedVariant?.stock_quantity ?? 0
    : product.stock_quantity ?? 0;

  const rating = product.average_rating ?? 0;

  const reviewCount = product.review_count ?? 0;

  // Thong so noi bat hien thi dang icon dau trang: uu tien is_highlight,
  // neu khong co thong so nao duoc danh dau thi lay tam 4 thong so dau
  const highlightSpecs =
    specifications.filter((s) => s.is_highlight).length > 0
      ? specifications.filter((s) => s.is_highlight)
      : [...specifications]
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .slice(0, 4);

  // Gom thong so theo spec_group de hien bang day du gon gang hon
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

        <Link
          to="/products"
          className="back-link"
        >
          ← Quay lại danh sách
        </Link>

        <div className="row product-detail-card">

          <div className="col-lg-5 product-image-box">

            <img
              src={image}
              alt={product.name}
            />

          </div>

          <div className="col-lg-7 product-info">

            <h1 className="product-title">
              {product.name}
            </h1>

            <div className="badge-area">

              {product.percent_off > 0 && (

                <span className="badge bg-danger">

                  -{product.percent_off}%

                </span>

              )}

              <span className="badge bg-secondary">

                {product.category}

              </span>

              {stock > 0 ? (

                <span className="badge bg-success">

                  Còn hàng

                </span>

              ) : (

                <span className="badge bg-danger">

                  Hết hàng

                </span>

              )}

            </div>

            {highlightSpecs.length > 0 && (

              <div className="quick-specs">

                {highlightSpecs.map((spec) => (

                  <div className="quick-spec-item" key={spec.attribute_id}>

                    <span className="quick-spec-icon">
                      {getSpecIcon(spec.attribute_name)}
                    </span>

                    <div>
                      <div className="quick-spec-label">
                        {spec.attribute_name}
                      </div>
                      <div className="quick-spec-value">
                        {formatSpecValue(spec)}
                      </div>
                    </div>

                  </div>

                ))}

              </div>

            )}

            <div className="product-price">

              {formatPrice(finalPrice)}

            </div>

            {product.percent_off > 0 && (

              <div className="old-price">

                <del>
                  {formatPrice(product.price + variantExtra)}
                </del>

              </div>

            )}

            {hasVariants && activeDimensions.length > 0 && (

              <div className="variant-selector">

                {activeDimensions.map((dim) => {

                  const values = [
                    ...new Set(
                      variants.map((v) => v[dim.key]).filter(Boolean)
                    ),
                  ];

                  return (

                    <div className="variant-group" key={dim.key}>

                      <div className="variant-group-label">
                        {dim.label}
                      </div>

                      <div className="variant-options">

                        {values.map((value) => {

                          const isSelected =
                            selectedOptions[dim.key] === value;
                          const available = isOptionAvailable(
                            dim.key,
                            value
                          );

                          return (

                            <button
                              type="button"
                              key={value}
                              className={
                                "variant-option-btn" +
                                (isSelected ? " active" : "") +
                                (!available ? " disabled" : "")
                              }
                              disabled={!available}
                              onClick={() =>
                                handleSelectOption(dim.key, value)
                              }
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

                  <p className="variant-unavailable">
                    Cấu hình này hiện chưa có sẵn.
                  </p>

                )}

              </div>

            )}

            <div className="product-meta">

              <p>

                ⭐ <strong>{rating}</strong>/5

                <span className="ms-2">

                  ({reviewCount} đánh giá)

                </span>

              </p>

              <p>

                Thương hiệu:

                <strong className="ms-2">

                  {product.brand}

                </strong>

              </p>

              <p>

                Danh mục:

                <strong className="ms-2">

                  {product.category}

                </strong>

              </p>

              <p>

                Kho còn:

                <strong className="ms-2">

                  {stock}

                </strong>

              </p>

            </div>

            <div className="description-box">

              <h5>Mô tả sản phẩm</h5>

              <p>

                {product.description ||

                  "Sản phẩm chưa có mô tả chi tiết."}

              </p>

            </div>

            <div className="action-box">

              <button
                className="btn btn-dark btn-lg add-cart-btn"
                disabled={stock <= 0 || (hasVariants && !matchedVariant)}
                onClick={handleAddToCart}
              >
                🛒 {stock > 0
                  ? "Thêm vào giỏ hàng"
                  : "Hết hàng"}
              </button>

              <button
                className="btn btn-outline-dark btn-lg"
              >
                ❤️ Yêu thích
              </button>

            </div>

          </div>

        </div>

        {specifications.length > 0 && (

          <div className="spec-section">

            <h3>Thông số kỹ thuật</h3>

            <div className="spec-table">

              {specGroupNames.map((groupName) => (

                <div className="spec-group" key={groupName}>

                  <h5 className="spec-group-title">{groupName}</h5>

                  <table className="table spec-group-table">
                    <tbody>

                      {groupedSpecs[groupName].map((spec) => (

                        <tr key={spec.attribute_id}>
                          <td className="spec-name">
                            {spec.attribute_name}
                          </td>
                          <td className="spec-value">
                            {formatSpecValue(spec)}
                          </td>
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

          <div className="related-section">

            <div className="section-header">

              <h3>Sản phẩm liên quan</h3>

              <span>Có thể bạn cũng thích</span>

            </div>

            <div className="row g-4">

              {recommendations.map((item) => {

                const price =
                  item.percent_off
                    ? item.price -
                      (item.percent_off * item.price) / 100
                    : item.price;

                return (

                  <div
                    className="col-lg-3 col-md-4 col-sm-6"
                    key={item.id}
                  >

                    <div className="related-card">

                      <Link
                        to={`/products/${item.id}`}
                        className="text-decoration-none"
                      >

                        <div className="related-image">

                          <img
                            src={
                              item.image_url ||
                              fallbackImage
                            }
                            alt={item.name}
                          />

                        </div>

                        <div className="related-body">

                          <h6>{item.name}</h6>

                          <div className="related-price">

                            <span className="price">

                              {formatPrice(price)}

                            </span>

                            {item.percent_off > 0 && (

                              <small>

                                <del>

                                  {formatPrice(item.price)}

                                </del>

                              </small>

                            )}

                          </div>

                          <div className="related-rating">

                            ⭐ {item.average_rating || 5}

                            <span>

                              ({item.review_count || 0})

                            </span>

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