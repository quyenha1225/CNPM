import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ScrollToTopOnMount from "../../template/ScrollToTopOnMount";
import { useCart } from "../../context/CartContext";
import { toast } from "../../utils/Toast";
import fallbackImage from "../../nillkin-case-1.jpg";

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price) + " đ";
}

function getDiscountedPrice(product) {
  if (!product.percent_off) {
    return product.price;
  }
  return product.price - (product.percent_off * product.price) / 100;
}

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    // Bước 1: Lấy toàn bộ sản phẩm từ Backend để tìm sản phẩm hiện tại (vì Backend không có API getById)
    fetch("http://localhost:3001/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải thông tin sản phẩm!");
        return res.json();
      })
      .then((allProducts) => {
        const foundProduct = allProducts.find((item) => String(item.id) === id);
        if (!foundProduct) {
          throw new Error("Sản phẩm không tồn tại hệ thống!");
        }
        setProduct(foundProduct);
        setLoading(false);

        // Bước 2: Gọi API ghi nhận log view sản phẩm (mặc định userId tạm thời là 1 nếu chưa đăng nhập)
        fetch("http://localhost:3001/api/products/log-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: 1, productId: Number(id) }),
        }).catch((err) => console.log("Lỗi ghi log view:", err));

        // Bước 3: Gọi API lấy danh sách sản phẩm gợi ý
        fetch(`http://localhost:3001/api/products/recommend/${id}`)
          .then((res) => res.json())
          .then((recData) => setRecommendations(recData))
          .catch((err) => console.log("Lỗi tải gợi ý:", err));
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container text-center my-5 py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-2">Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <>
        <ScrollToTopOnMount />
        <div className="container mt-5 text-center">
          <h2 className="text-danger mb-4">Sản phẩm không tồn tại!</h2>
          <p className="text-muted">{error}</p>
          <Link to="/products" className="btn btn-outline-dark px-4 py-2">
            Quay lại danh sách
          </Link>
        </div>
      </>
    );
  }

  const productImage = product.image_url || fallbackImage;
  const finalPrice = getDiscountedPrice(product);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: product.price,
      brand: product.brand,
      category: product.category,
      image: productImage,
      quantity: 1,
    });
    toast.success("✓ Sản phẩm đã được thêm vào giỏ hàng!", 3000);
  };

  return (
    <>
      <ScrollToTopOnMount />

      <div className="container mt-5 mb-5">
        <Link
          to="/products"
          className="text-decoration-none text-dark mb-4 d-inline-block fw-bold"
        >
          ← Quay lại danh sách
        </Link>

        <div className="row bg-white shadow-sm rounded p-4">
          <div className="col-md-5 text-center mb-4 mb-md-0">
            <img
              src={productImage}
              alt={product.name}
              className="img-fluid rounded border p-2"
            />
          </div>

          <div className="col-md-7 d-flex flex-column justify-content-center px-lg-5">
            <h2 className="fw-bold mb-3">{product.name}</h2>

            <div className="mb-3">
              {product.percent_off > 0 && (
                <span className="badge bg-danger me-2">
                  Giảm {product.percent_off}%
                </span>
              )}
              <span className="badge bg-secondary me-2">
                Danh mục: {product.category}
              </span>
              <span className="badge bg-success">Còn hàng</span>
            </div>

            <p className="fs-4 text-danger fw-bold mb-3">
              {formatPrice(finalPrice)}
            </p>

            {product.percent_off > 0 && (
              <p className="text-muted mb-3">
                Giá gốc: <del>{formatPrice(product.price)}</del>
              </p>
            )}

            <p className="text-muted lh-lg mb-4 border-top pt-3">
              <strong>Đặc điểm nổi bật:</strong> Sản phẩm công nghệ thương hiệu{" "}
              {product.brand || "Khác"}, thuộc nhóm {product.category}, thiết kế
              tối ưu, hiệu năng cao và bền bỉ.
            </p>

            <div className="d-flex gap-3 mt-auto">
              <button
                type="button"
                className="btn btn-dark btn-lg flex-grow-1 py-3 rounded-1"
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>

        {/* PHẦN HIỂN THỊ SẢN PHẨM GỢI Ý (ĐỔ TỪ DB THẬT) */}
        {recommendations.length > 0 && (
          <div className="mt-5">
            <h3 className="fw-bold mb-4">
              Sản phẩm tương tự khách hàng cũng xem
            </h3>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
              {recommendations.map((item) => (
                <div className="col" key={item.id}>
                  <div className="card h-100 border-0 shadow-sm">
                    <Link to={`/products/${item.id}`}>
                      <img
                        src={item.image_url || fallbackImage}
                        className="card-img-top p-3"
                        alt={item.name}
                        style={{ height: "180px", objectFit: "contain" }}
                      />
                    </Link>
                    <div className="card-body d-flex flex-column">
                      <h6
                        className="card-title fw-bold text-truncate"
                        title={item.name}
                      >
                        {item.name}
                      </h6>
                      <p className="text-danger fw-bold mt-auto">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductDetail;
