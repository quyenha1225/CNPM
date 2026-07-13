import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ScrollToTopOnMount from "../../template/ScrollToTopOnMount";
import { useCart } from "../../context/CartContext";
import { toast } from "../../utils/Toast";
import fallbackImage from "../../nillkin-case-1.jpg";
import { mockProductsFromMySQL } from "../ProductList";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3001/api/products");
        if (!response.ok) {
          throw new Error("API unavailable");
        }

        const data = await response.json();
        const foundProduct = Array.isArray(data)
          ? data.find((item) => String(item.id) === String(id))
          : null;

        if (isMounted) {
          setProduct(foundProduct || mockProductsFromMySQL.find((item) => String(item.id) === String(id)) || null);
        }
      } catch (error) {
        if (isMounted) {
          setProduct(mockProductsFromMySQL.find((item) => String(item.id) === String(id)) || null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <>
        <ScrollToTopOnMount />
        <div className="container mt-5 text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Đang tải thông tin sản phẩm...</p>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <ScrollToTopOnMount />
        <div className="container mt-5 text-center">
          <h2 className="text-danger mb-4">Sản phẩm không tồn tại!</h2>
          <Link to="/products" className="btn btn-outline-dark px-4 py-2">
            Quay lại danh sách
          </Link>
        </div>
      </>
    );
  }

  let productImage = fallbackImage;
  if (product.image_url) {
    productImage = product.image_url.startsWith("/")
      ? process.env.PUBLIC_URL + product.image_url
      : product.image_url;
  }
  const finalPrice = getDiscountedPrice(product);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: productImage,
      quantity: 1,
    });
    toast.success("✓ Sản phẩm đã được thêm vào giỏ hàng!", 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
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

            <p className="fs-4 text-danger fw-bold mb-3">{formatPrice(finalPrice)}</p>

            {product.percent_off > 0 && (
              <p className="text-muted mb-3">
                Giá gốc: <del>{formatPrice(product.price)}</del>
              </p>
            )}

            <p className="text-muted lh-lg mb-4 border-top pt-3">
              <strong>Đặc điểm nổi bật:</strong> Sản phẩm công nghệ thuộc nhóm {product.category}, phù hợp để nâng cấp góc làm việc, học tập và giải trí hằng ngày.
            </p>

            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-dark px-4" onClick={handleAddToCart}>
                Thêm vào giỏ hàng
              </button>
              <button className="btn btn-outline-dark px-4" onClick={handleBuyNow}>
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetail;
            <div className="d-flex gap-3 mt-auto">
              <button
                type="button"
                className="btn btn-dark btn-lg flex-grow-1 py-3 rounded-1"
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-lg flex-grow-1 py-3 rounded-1"
                onClick={handleBuyNow}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetail;
