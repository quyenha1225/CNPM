import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

function formatPrice(value) {
  const numberValue = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

function normalizeProduct(product = {}) {
  return {
    id: product.id ?? product.product_id ?? null,

    name:
      product.name ??
      product.product_name ??
      "Sản phẩm công nghệ",

    image:
      product.image ??
      product.image_url ??
      product.thumbnail_url ??
      product.thumbnail ??
      "",

    brand:
      product.brand ??
      product.brand_name ??
      "Gearxin",

    price:
      product.price ??
      product.base_price ??
      product.min_price ??
      0,

    sold:
      product.sold_count ??
      product.totalSold ??
      product.total_sold ??
      product.soldQuantity ??
      product.sold_quantity ??
      0,
  };
}

function Banner({ topSelling = [], loading = false }) {
  const videoRef = useRef(null);
  const heroRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isTurning, setIsTurning] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const products = useMemo(() => {
    if (!Array.isArray(topSelling)) {
      return [];
    }

    return topSelling
      .map(normalizeProduct)
      .filter((product) => product.id !== null)
      .slice(0, 10);
  }, [topSelling]);

  const currentProduct = products[activeIndex] ?? null;

  const nextIndex =
    products.length > 0
      ? (activeIndex + 1) % products.length
      : 0;

  const nextProduct = products[nextIndex] ?? currentProduct;

  const publicUrl = process.env.PUBLIC_URL || "";
  const videoUrl = `${publicUrl}/videos/tech-hero.mp4`;

  useEffect(() => {
    const heroElement = heroRef.current;

    if (
      !heroElement ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
      },
    );

    observer.observe(heroElement);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement || videoFailed) {
      return undefined;
    }

    function updateVideoState() {
      const canPlay =
        heroVisible &&
        document.visibilityState === "visible";

      if (canPlay) {
        const playPromise = videoElement.play();

        if (playPromise?.catch) {
          playPromise.catch(() => {});
        }
      } else {
        videoElement.pause();
      }
    }

    updateVideoState();

    document.addEventListener(
      "visibilitychange",
      updateVideoState,
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        updateVideoState,
      );

      videoElement.pause();
    };
  }, [heroVisible, videoFailed]);

  useEffect(() => {
    if (
      products.length <= 1 ||
      !heroVisible ||
      isTurning
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIsTurning(true);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [products.length, heroVisible, isTurning]);

  function completeCubeTurn() {
    if (!isTurning || products.length <= 1) {
      return;
    }

    setActiveIndex(nextIndex);
    setIsTurning(false);
  }

  function selectProduct(index) {
    if (
      index === activeIndex ||
      isTurning ||
      !products[index]
    ) {
      return;
    }

    setActiveIndex(index);
  }

  const currentUrl = currentProduct?.id
    ? `/products/${currentProduct.id}`
    : "/products";

  return (
    <section
      ref={heroRef}
      className={`gx3-hero ${
        videoReady ? "is-video-ready" : ""
      } ${videoFailed ? "is-video-failed" : ""}`}
    >
      {!videoFailed && (
        <video
          ref={videoRef}
          className="gx3-hero__video"
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onLoadedData={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      <div className="gx3-hero__overlay" />

      <div className="container px-lg-5 gx3-hero__container">
        <div className="gx3-hero__layout">
          <div className="gx3-hero__content">
            <span className="gx3-hero__eyebrow">
              Sản phẩm bán chạy
            </span>

            <h1>
              Công nghệ phù hợp
              <br />
              cho mọi nhu cầu
            </h1>

            <p>
              Khám phá các thiết bị nổi bật dành cho học tập,
              làm việc, sáng tạo và giải trí.
            </p>

            <div className="gx3-hero__actions">
              <Link
                to={currentUrl}
                className="gx3-button gx3-button--primary"
              >
                Xem sản phẩm nổi bật
              </Link>

              <Link
                to="/products"
                className="gx3-button gx3-button--secondary"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          </div>

          <div
            className={`gx3-cubes ${
              isTurning ? "is-turning" : ""
            }`}
          >
            {loading ? (
              <>
                <div className="gx3-cube-loading" />
                <div className="gx3-cube-loading" />
              </>
            ) : currentProduct && nextProduct ? (
              <>
                {/* KHỐI LẬP PHƯƠNG SẢN PHẨM */}
                <div className="gx3-cube-scene">
                  <div
                    className="gx3-cube gx3-cube--product"
                    onAnimationEnd={completeCubeTurn}
                  >
                    <div className="gx3-cube__face gx3-cube__face--front">
                      <ProductFace product={currentProduct} />
                    </div>

                    <div className="gx3-cube__face gx3-cube__face--top">
                      <ProductFace product={nextProduct} />
                    </div>

                    <div className="gx3-cube__face gx3-cube__face--right gx3-cube__side">
                      GEARXIN
                    </div>

                    <div className="gx3-cube__face gx3-cube__face--left gx3-cube__side">
                      TECHNOLOGY
                    </div>

                    <div className="gx3-cube__face gx3-cube__face--back gx3-cube__side">
                      PRODUCT
                    </div>

                    <div className="gx3-cube__face gx3-cube__face--bottom gx3-cube__side">
                      STORE
                    </div>
                  </div>
                </div>

                {/* KHỐI LẬP PHƯƠNG GIÁ */}
                <div className="gx3-cube-scene">
                  <div className="gx3-cube gx3-cube--price">
                    <div className="gx3-cube__face gx3-cube__face--front">
                      <PriceFace product={currentProduct} />
                    </div>

                    <div className="gx3-cube__face gx3-cube__face--bottom">
                      <PriceFace product={nextProduct} />
                    </div>

                    <div className="gx3-cube__face gx3-cube__face--right gx3-cube__side">
                      PRICE
                    </div>

                    <div className="gx3-cube__face gx3-cube__face--left gx3-cube__side">
                      GEARXIN
                    </div>

                    <div className="gx3-cube__face gx3-cube__face--back gx3-cube__side">
                      TECHNOLOGY
                    </div>

                    <div className="gx3-cube__face gx3-cube__face--top gx3-cube__side">
                      STORE
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="gx3-hero__empty">
                <strong>Khám phá sản phẩm công nghệ</strong>
                <p>
                  Xem các sản phẩm nổi bật đang có tại cửa hàng.
                </p>

                <Link to="/products">
                  Xem danh sách sản phẩm
                </Link>
              </div>
            )}
          </div>
        </div>

        {products.length > 1 && (
          <div className="gx3-hero__dots">
            {products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                className={
                  index === activeIndex ? "is-active" : ""
                }
                onClick={() => selectProduct(index)}
                aria-label={`Hiển thị ${product.name}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProductFace({ product }) {
  return (
    <div className="gx3-product-face">
      <span className="gx3-cube-label">Sản phẩm</span>

      <div className="gx3-product-face__image">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            decoding="async"
          />
        ) : (
          <strong>GEARXIN</strong>
        )}
      </div>

      <div className="gx3-product-face__content">
        <small>{product.brand}</small>
        <h2>{product.name}</h2>

        {Number(product.sold) > 0 && (
          <p>
            Đã bán{" "}
            {Number(product.sold).toLocaleString("vi-VN")} sản
            phẩm
          </p>
        )}
      </div>
    </div>
  );
}

function PriceFace({ product }) {
  const productUrl = product.id
    ? `/products/${product.id}`
    : "/products";

  return (
    <div className="gx3-price-face">
      <span className="gx3-cube-label">Giá hiện tại</span>

      <strong className="gx3-price-face__value">
        {formatPrice(product.price)}
      </strong>

      <p>
        Giá niêm yết hiện tại của sản phẩm tại Gearxin.
      </p>

      <Link
        to={productUrl}
        className="gx3-price-face__button"
      >
        Xem chi tiết
      </Link>
    </div>
  );
}

export default Banner;