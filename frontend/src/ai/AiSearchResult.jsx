import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router-dom";

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function AiSearchResult() {
  const location = useLocation();

  const result = useMemo(() => {
    if (location.state?.result) {
      return location.state.result;
    }

    try {
      return JSON.parse(sessionStorage.getItem("aiSearchResult") || "null");
    } catch {
      return null;
    }
  }, [location.state]);

  const products = Array.isArray(result?.products) ? result.products : [];

  if (!result) {
    return (
      <main className="ai-result-page">
        <div className="container">
          <div className="ai-empty-state">
            <FontAwesomeIcon icon={["fas", "robot"]} />
            <h1>Chưa có kết quả AI Search</h1>
            <p>Hãy nhập nhu cầu ở ô tìm kiếm AI trên thanh đầu trang.</p>
            <Link to="/products">Khám phá sản phẩm</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="ai-result-page">
      <section className="ai-result-hero">
        <div className="container">
          <span className="ai-result-kicker">
            <FontAwesomeIcon icon={["fas", "magic"]} />
            AI Product Consultant
          </span>
          <h1>Kết quả tư vấn sản phẩm</h1>
          <p className="ai-result-query">
            “{result.query || location.state?.query}”
          </p>

          <div className="ai-result-message">
            <FontAwesomeIcon icon={["fas", "robot"]} />
            <p>{result.message || "Đây là các sản phẩm phù hợp nhất."}</p>
          </div>

          <div className="ai-result-meta">
            <span>
              <FontAwesomeIcon icon={["fas", "database"]} />
              {products.length} kết quả từ database
            </span>
            <span>
              <FontAwesomeIcon icon={["fas", "brain"]} />
              Gemini có fallback rule-based
            </span>
            {result.logId && (
              <span>
                <FontAwesomeIcon icon={["fas", "history"]} />
                Mã tìm kiếm #{result.logId}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="container ai-result-content">
        {products.length ? (
          <div className="ai-result-grid">
            {products.map((product, index) => {
              const id = product.id || product.productId || product.product_id;
              const image =
                product.image ||
                product.image_url ||
                "https://via.placeholder.com/600x450?text=ElectroShop";

              return (
                <article className="ai-product-card" key={`${id}-${index}`}>
                  <Link to={`/products/${id}`} className="ai-product-media">
                    <img src={image} alt={product.name || product.product_name} />
                    <span>#{index + 1} phù hợp</span>
                  </Link>

                  <div className="ai-product-body">
                    <small>
                      {product.brand || product.brand_name || "ElectroShop"}
                    </small>
                    <h2>{product.name || product.product_name}</h2>
                    <p>
                      {product.reason ||
                        product.matchReason ||
                        "Phù hợp với nhu cầu tìm kiếm đã mô tả."}
                    </p>
                    <strong>
                      {formatPrice(product.price || product.base_price)}
                    </strong>
                    <Link to={`/products/${id}`}>Xem chi tiết</Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="ai-empty-state">
            <h2>AI chưa tìm thấy sản phẩm phù hợp</h2>
            <p>Hãy mô tả rõ ngân sách, mục đích sử dụng và loại sản phẩm.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default AiSearchResult;
