import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import "./AiSearchResult.css";

const API_ORIGIN = (
  process.env.REACT_APP_API_URL ||
  "http://localhost:3001/api"
).replace(/\/api\/?$/, "");

const FALLBACK_IMAGE =
  `${process.env.PUBLIC_URL || ""}/logo512.png`;

function formatPrice(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(
    Number.isFinite(amount)
      ? amount
      : 0,
  );
}

function resolveImageUrl(value) {
  if (!value) {
    return FALLBACK_IMAGE;
  }

  const imageUrl = String(value).trim();

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${API_ORIGIN}${imageUrl}`;
  }

  return `${API_ORIGIN}/${imageUrl}`;
}

function normalizeScore(value) {
  const score = Number(value ?? 0);

  if (!Number.isFinite(score)) {
    return 0;
  }

  const percentage =
    score > 0 && score <= 1
      ? score * 100
      : score;

  return Math.min(
    Math.max(
      Math.round(percentage),
      0,
    ),
    100,
  );
}

function normalizeReasons(product) {
  const reasons =
    product.matchReasons ??
    product.match_reasons ??
    product.reasons ??
    product.reason ??
    [];

  if (Array.isArray(reasons)) {
    return reasons
      .map((reason) =>
        String(reason).trim(),
      )
      .filter(Boolean);
  }

  if (typeof reasons === "string") {
    return reasons
      .split(/[•;\n]/)
      .map((reason) => reason.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeProduct(
  product = {},
  index = 0,
) {
  const id = Number(
    product.productId ??
      product.product_id ??
      product.id ??
      0,
  );

  const stock = Math.max(
    Number(
      product.stockQuantity ??
        product.stock_quantity ??
        product.availableQuantity ??
        product.available_quantity ??
        product.current_stock ??
        product.stock ??
        0,
    ),
    0,
  );

  return {
    id,

    rank:
      Number(
        product.rank ??
          product.ranking ??
          index + 1,
      ) || index + 1,

    name:
      product.productName ??
      product.product_name ??
      product.name ??
      "Sản phẩm Gearxin",

    brand:
      product.brandName ??
      product.brand_name ??
      product.brand ??
      "Gearxin",

    category:
      product.categoryName ??
      product.category_name ??
      product.category ??
      "Công nghệ",

    image: resolveImageUrl(
      product.imageUrl ??
        product.image_url ??
        product.thumbnailUrl ??
        product.thumbnail_url ??
        product.thumbnail ??
        product.image,
    ),

    price: Number(
      product.basePrice ??
        product.base_price ??
        product.price ??
        0,
    ),

    stock,

    score: normalizeScore(
      product.matchScore ??
        product.match_score ??
        product.score ??
        product.relevanceScore ??
        product.relevance_score,
    ),

    description:
      product.description ??
      product.productDescription ??
      product.product_description ??
      "",

    reasons: normalizeReasons(product),
  };
}

function readStoredResult(location) {
  const stateResult =
    location.state?.result ??
    location.state?.aiSearchResult ??
    location.state?.data;

  if (stateResult) {
    return stateResult;
  }

  const searchKey =
    new URLSearchParams(
      location.search,
    ).get("search");

  const storageKeys = [
    searchKey
      ? `aiSearchResult:${searchKey}`
      : null,

    searchKey,

    "aiSearchResult",

    "lastAiSearchResult",
  ].filter(Boolean);

  for (const key of storageKeys) {
    try {
      const rawValue =
        sessionStorage.getItem(key);

      if (rawValue) {
        return JSON.parse(rawValue);
      }
    } catch (error) {
      console.warn(
        "Không thể đọc kết quả AI:",
        error,
      );
    }
  }

  return null;
}

function AiProductCard({
  product,
}) {
  const [imageFailed, setImageFailed] =
    useState(false);

  const detailUrl = product.id
    ? `/products/${product.id}`
    : "/products";

  const reasons =
    product.reasons.length > 0
      ? product.reasons.slice(0, 3)
      : [
          product.description ||
            "Phù hợp với nhu cầu tìm kiếm đã mô tả.",
        ];

  return (
    <article className="gx-ai-v2-card">
      <Link
        to={detailUrl}
        className="gx-ai-v2-card__media"
        aria-label={`Xem ${product.name}`}
      >
        <img
          src={
            imageFailed
              ? FALLBACK_IMAGE
              : product.image
          }
          alt={product.name}
          loading={
            product.rank <= 3
              ? "eager"
              : "lazy"
          }
          decoding="async"
          onError={() =>
            setImageFailed(true)
          }
        />

        <span className="gx-ai-v2-card__rank">
          #{product.rank}
        </span>

        <span className="gx-ai-v2-card__score">
          {product.score}% phù hợp
        </span>
      </Link>

      <div className="gx-ai-v2-card__body">
        <div className="gx-ai-v2-card__meta">
          <span className="gx-ai-v2-card__brand">
            {product.brand}
          </span>

          <span
            className={
              product.stock > 0
                ? "gx-ai-v2-card__stock is-available"
                : "gx-ai-v2-card__stock is-empty"
            }
          >
            {product.stock > 0
              ? `Còn ${product.stock}`
              : "Hết hàng"}
          </span>
        </div>

        <h2 className="gx-ai-v2-card__title">
          <Link to={detailUrl}>
            {product.name}
          </Link>
        </h2>

        <span className="gx-ai-v2-card__category">
          {product.category}
        </span>

        <div className="gx-ai-v2-card__reasons">
          {reasons.map(
            (reason, index) => (
              <div
                key={`${product.id}-${index}`}
                className="gx-ai-v2-card__reason"
              >
                <span>✓</span>
                <p>{reason}</p>
              </div>
            ),
          )}
        </div>

        <div className="gx-ai-v2-card__footer">
          <strong className="gx-ai-v2-card__price">
            {formatPrice(product.price)}
          </strong>

          <div
            className="gx-ai-v2-card__progress"
            aria-label={`${product.score}% phù hợp`}
          >
            <span
              style={{
                width: `${product.score}%`,
              }}
            />
          </div>

          <Link
            to={detailUrl}
            className="gx-ai-v2-card__button"
          >
            Xem cấu hình
            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function AiSearchResult() {
  const location = useLocation();

  const result = useMemo(
    () => readStoredResult(location),
    [location],
  );

  const rawProducts = useMemo(() => {
    const possibleProducts =
      result?.products ??
      result?.recommendations ??
      result?.recommendedProducts ??
      result?.recommended_products ??
      result?.items ??
      result?.data?.products ??
      [];

    return Array.isArray(
      possibleProducts,
    )
      ? possibleProducts
      : [];
  }, [result]);

  const products = useMemo(
    () =>
      rawProducts.map(
        normalizeProduct,
      ),
    [rawProducts],
  );

  const query =
    result?.query ??
    result?.queryText ??
    result?.query_text ??
    result?.searchQuery ??
    result?.search_query ??
    location.state?.query ??
    "Nhu cầu tìm kiếm của bạn";

  const summary =
    result?.message ??
    result?.summary ??
    result?.aiMessage ??
    result?.ai_message ??
    `Đã tìm thấy ${products.length} sản phẩm phù hợp với nhu cầu của bạn.`;

  const availableCount =
    products.filter(
      (product) => product.stock > 0,
    ).length;

  const averageScore =
    products.length > 0
      ? Math.round(
          products.reduce(
            (total, product) =>
              total + product.score,
            0,
          ) / products.length,
        )
      : 0;

  if (!result) {
    return (
      <main className="gx-ai-v2-page">
        <div className="gx-ai-v2-container">
          <div className="gx-ai-v2-empty">
            <div className="gx-ai-v2-empty__icon">
              AI
            </div>

            <h1>
              Chưa có kết quả tìm kiếm
            </h1>

            <p>
              Hãy nhập nhu cầu, ngân sách,
              loại sản phẩm hoặc mục đích sử
              dụng vào thanh AI Search.
            </p>

            <Link to="/products">
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="gx-ai-v2-page">
      <section className="gx-ai-v2-hero">
        <div className="gx-ai-v2-container">
          <div className="gx-ai-v2-hero__content">
            <span className="gx-ai-v2-hero__eyebrow">
              AI SEARCH GEARXIN
            </span>

            <h1>
              Sản phẩm phù hợp
              <br />
              dành riêng cho bạn
            </h1>

            <p className="gx-ai-v2-hero__query">
              “{query}”
            </p>

            <p className="gx-ai-v2-hero__summary">
              {summary}
            </p>
          </div>

          <div className="gx-ai-v2-summary">
            <div>
              <strong>
                {products.length}
              </strong>
              <span>
                Sản phẩm đề xuất
              </span>
            </div>

            <div>
              <strong>
                {availableCount}
              </strong>
              <span>
                Sản phẩm còn hàng
              </span>
            </div>

            <div>
              <strong>
                {averageScore}%
              </strong>
              <span>
                Mức phù hợp trung bình
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="gx-ai-v2-results">
        <div className="gx-ai-v2-container">
          <header className="gx-ai-v2-results__header">
            <div>
              <span>
                KẾT QUẢ TƯ VẤN
              </span>

              <h2>
                Lựa chọn nổi bật
              </h2>

              <p>
                Sản phẩm được sắp xếp theo
                mức độ phù hợp với nhu cầu
                bạn đã cung cấp.
              </p>
            </div>

            <Link
              to="/products"
              className="gx-ai-v2-results__all"
            >
              Xem tất cả sản phẩm
            </Link>
          </header>

          {products.length > 0 ? (
            <div className="gx-ai-v2-grid">
              {products.map(
                (product) => (
                  <AiProductCard
                    key={
                      product.id ||
                      product.rank
                    }
                    product={product}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="gx-ai-v2-empty">
              <h2>
                Chưa tìm thấy sản phẩm phù hợp
              </h2>

              <p>
                Hãy bổ sung ngân sách, mục
                đích sử dụng, RAM, ổ cứng hoặc
                thương hiệu mong muốn.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default AiSearchResult;