import { Link, useLocation } from "react-router-dom";

function AiSearchResult() {
  const location = useLocation();

  let storedData = null;

  try {
    const savedResult =
      sessionStorage.getItem("aiSearchResult");

    storedData = savedResult
      ? JSON.parse(savedResult)
      : null;
  } catch {
    storedData = null;
  }

  const data =
    location.state?.aiSearchResult || storedData;

  if (!data) {
    return (
      <div className="container ai-search-page text-center">
        <h2>Chưa có kết quả tìm kiếm AI</h2>

        <p>
          Hãy nhập nhu cầu của bạn vào thanh tìm kiếm.
        </p>

        <Link to="/" className="btn btn-primary">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div
      className="container ai-search-page"
      key={location.state?.searchedAt || data.searchLogId}
    >
      <div className="ai-search-summary">
        <h2>Kết quả tìm kiếm AI</h2>

        <p>
          <strong>Yêu cầu:</strong> {data.query}
        </p>

        <p>{data.message}</p>

        {data.exactBudgetMatch === false && (
          <div className="alert alert-warning">
            Không có sản phẩm đúng hoàn toàn ngân sách.
            Hệ thống đang hiển thị lựa chọn gần nhất.
          </div>
        )}
      </div>

      {data.products?.length > 0 ? (
        <div className="row">
          {data.products.map((product) => (
            <div
              key={product.productId}
              className="col-lg-4 col-md-6 mb-4"
            >
              <div className="ai-search-card">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.productName}
                    className="ai-search-card-image"
                  />
                )}

                <div className="ai-search-card-body">
                  <h5 className="ai-search-card-title">
                    {product.productName}
                  </h5>

                  <p className="ai-search-price">
                    {Number(product.price).toLocaleString(
                      "vi-VN"
                    )}
                    đ
                  </p>

                  <p>
                    <strong>Danh mục:</strong>{" "}
                    {product.category}
                  </p>

                  <p>
                    <strong>Tồn kho:</strong>{" "}
                    {product.stockQuantity}
                  </p>

                  <div className="ai-search-score">
                    Phù hợp {product.matchScore}%
                  </div>

                  {product.matchReasons?.length > 0 && (
                    <div>
                      <strong>Lý do phù hợp:</strong>

                      <ul className="ai-search-reasons">
                        {product.matchReasons.map(
                          (reason, index) => (
                            <li
                              key={`${product.productId}-${index}`}
                            >
                              {reason}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  <Link
                    to={`/products/${product.productId}`}
                    className="btn btn-primary ai-search-detail-button"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-warning">
          Không tìm thấy sản phẩm phù hợp.
        </div>
      )}
    </div>
  );
}

export default AiSearchResult;