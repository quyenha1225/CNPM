import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ScrollToTopOnMount from "../../template/ScrollToTopOnMount";
import { addProductToCart } from "../../cart/cartStorage";
import { menuCategories, mockProductsFromMySQL } from "../ProductList";
import { getProductImage } from "../productImages";
import Image from "../../nillkin-case-1.jpg";
import RelatedProduct from "./RelatedProduct";
import Ratings from "react-ratings-declarative";
import { Link, useHistory } from "react-router-dom";
import ScrollToTopOnMount from "../../template/ScrollToTopOnMount";
import { useState } from "react";
import { useCart } from "../../context/CartContext";

const priceFormatter = new Intl.NumberFormat("vi-VN");

function formatCurrency(value) {
  return `${priceFormatter.format(Math.round(value))} đ`;
}

  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const { addToCart } = useCart();
  const history = useHistory();

  function changeRating(newRating) {}

  const handleAddToCart = () => {
    const product = {
      id: 1,
      name: "Nillkin iPhone X cover",
      price: 10000,
      image: Image,
    };
    addToCart(product, quantity);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    history.push("/cart");
  };

  return (
    <div className="container mt-5 py-4 px-xl-5">
      <ScrollToTopOnMount/>
      
      {showNotification && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          Đã thêm vào giỏ hàng!
          <button type="button" className="btn-close" onClick={() => setShowNotification(false)}></button>
        </div>
      )}
      
      <nav aria-label="breadcrumb" className="bg-custom-light rounded mb-4">
        <ol className="breadcrumb p-3">
          <li className="breadcrumb-item">
            <Link className="text-decoration-none link-secondary" to="/products">
              All Prodcuts
            </Link>
            
          </li>
          <li className="breadcrumb-item">
            <a className="text-decoration-none link-secondary" href="!#">
              Cases &amp; Covers
            </a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Nillkin iPhone X cover
          </li>
        </ol>
      </nav>
      <div className="row mb-4">
        <div className="d-none d-lg-block col-lg-1">
          <div className="image-vertical-scroller">
            <div className="d-flex flex-column">
              {Array.from({ length: 10 }, (_, i) => {
                let selected = i !== 1 ? "opacity-6" : "";
                return (
                  <a key={i} href="!#">
                    <img
                      className={"rounded mb-2 ratio " + selected}
                      alt=""
                      src={Image}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="row">
            <div className="col-12 mb-4">
              <img
                className="border rounded ratio ratio-1x1"
                alt=""
                src={Image}
              />
            </div>
          </div>

          {/* <div className="row mt-2">
            <div className="col-12">
              <div
                className="d-flex flex-nowrap"
                style={{ overflowX: "scroll" }}
              >
                {Array.from({ length: 8 }, (_, i) => {
                  return (
                    <a key={i} href="!#">
                      <img
                        className="cover rounded mb-2 me-2"
                        width="70"
                        height="70"
                        alt=""
                        src={Image}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          </div> */}
        </div>

        <div className="col-lg-5">
          <div className="d-flex flex-column h-100">
            <h2 className="mb-1">Nillkin iPhone X cover</h2>
            <h4 className="text-muted mb-4">10,000 đ</h4>

            <div className="mb-3">
              <label className="form-label">Số lượng</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                style={{ width: "100px" }}
              />
            </div>

            <div className="row g-3 mb-4">
              <div className="col">
                <button 
                  className="btn btn-outline-dark py-2 w-100"
                  onClick={handleAddToCart}
                >
                  Add to cart
                </button>
              </div>
              <div className="col">
                <button 
                  className="btn btn-dark py-2 w-100"
                  onClick={handleBuyNow}
                >
                  Buy now
                </button>
              </div>
            </div>

            <h4 className="mb-0">Details</h4>
            <hr />
            <dl className="row">
              <dt className="col-sm-4">Code</dt>
              <dd className="col-sm-8 mb-3">C0001</dd>

              <dt className="col-sm-4">Category</dt>
              <dd className="col-sm-8 mb-3">Cases & Covers</dd>

              <dt className="col-sm-4">Brand</dt>
              <dd className="col-sm-8 mb-3">iPhone X</dd>

              <dt className="col-sm-4">Manufacturer</dt>
              <dd className="col-sm-8 mb-3">Nillkin</dd>

              <dt className="col-sm-4">Color</dt>
              <dd className="col-sm-8 mb-3">Red, Green, Blue, Pink</dd>

              <dt className="col-sm-4">Status</dt>
              <dd className="col-sm-8 mb-3">Instock</dd>

              <dt className="col-sm-4">Rating</dt>
              <dd className="col-sm-8 mb-3">
                <Ratings
                  rating={4.5}
                  widgetRatedColors="rgb(253, 204, 13)"
                  changeRating={changeRating}
                  widgetSpacings="2px"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    return (
                      <Ratings.Widget
                        key={i}
                        widgetDimension="20px"
                        svgIconViewBox="0 0 19 20"
                        svgIconPath={iconPath}
                        widgetHoverColor="rgb(253, 204, 13)"
                      />
                    );
                  })}
                </Ratings>
              </dd>
            </dl>

            <h4 className="mb-0">Description</h4>
            <hr />
            <p className="lead flex-shrink-0">
              <small>
                Nature (TPU case) use environmental non-toxic TPU, silky smooth
                and ultrathin. Glittering and translucent, arbitrary rue
                reserved volume button cutouts, easy to operate. Side frosted
                texture anti-slipping, details show its concern; transparent
                frosted logo shows its taste. The release of self, the flavor of
                life. Nillkin launched Nature transparent soft cover, only to
                retain the original phone style. Subverting tradition,
                redefinition. Thinner design Environmental texture better hand
                feeling.
              </small>
            </p>
>>>>>>> hoangii
          </div>
        </div>
      </div>
    );
  }

  const hasSale = product.percent_off > 0;
  const salePrice = hasSale ? product.price - (product.percent_off * product.price) / 100 : product.price;

  function handleAddToCart() {
    addProductToCart(product);
    setCartMessage("Đã thêm sản phẩm vào giỏ hàng.");
  }

  function handleBuyNow() {
    addProductToCart(product);
    navigate("/cart");
  }

  return (
    <div className="product-detail-page">
      <ScrollToTopOnMount />
      <div className="container">
        <Link to="/products" className="product-detail-back">
          <FontAwesomeIcon icon={["fas", "arrow-left"]} />
          Quay lại danh sách
        </Link>

        <section className="product-detail-shell">
          <div className="product-detail-media">
            {hasSale && <span className="product-detail-sale">-{product.percent_off}%</span>}
            <img
              src={getProductImage(product)}
              alt={product.name}
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="product-detail-info">
            <span className="product-detail-kicker">{categoryName}</span>
            <h1>{product.name}</h1>

            <div className="product-detail-price">
              <strong>{formatCurrency(salePrice)}</strong>
              {hasSale && <del>{formatCurrency(product.price)}</del>}
            </div>

            <div className="product-detail-tags">
              <span>{product.brand || "Gearxin"}</span>
              <span>Còn hàng</span>
              <span>Bảo hành chính hãng</span>
            </div>

            <p className="product-detail-description">
              Cấu hình được chọn cho nhu cầu học tập, làm việc, gaming và nâng cấp góc máy.
              Gearxin hỗ trợ tư vấn linh kiện tương thích, tối ưu ngân sách và kiểm tra trước khi giao.
            </p>

            <div className="product-detail-specs">
              <div>
                <span>Danh mục</span>
                <strong>{categoryName}</strong>
              </div>
              <div>
                <span>Thương hiệu</span>
                <strong>{product.brand || "Khác"}</strong>
              </div>
              <div>
                <span>Ưu đãi</span>
                <strong>{hasSale ? `${product.percent_off}%` : "Giá tốt"}</strong>
              </div>
            </div>

            <div className="product-detail-actions">
              <button type="button" className="product-detail-primary-btn" onClick={handleAddToCart}>
                <FontAwesomeIcon icon={["fas", "cart-plus"]} />
                Thêm vào giỏ
              </button>
              <button type="button" className="product-detail-secondary-btn" onClick={handleBuyNow}>
                <FontAwesomeIcon icon={["fas", "shopping-bag"]} />
                Mua ngay
              </button>
            </div>

            {cartMessage && (
              <div className="product-detail-cart-note" role="status">
                <FontAwesomeIcon icon={["fas", "check-circle"]} />
                <span>{cartMessage}</span>
                <Link to="/cart">Xem giỏ hàng</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProductDetail;
