import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "../nillkin-case.webp";
import ImageAlt from "../nillkin-case-1.jpg";
import ImageDark from "../nillkin-case.jpg";

const flashItems = [
  {
    name: "PC Gaming Shark RTX 4060",
    price: 18500000,
    oldPrice: 21900000,
    sold: 82,
    stock: 100,
    image: ImageDark,
    to: "/products/1",
  },
  {
    name: "Laptop Asus Vivobook 14",
    price: 14290000,
    oldPrice: 16990000,
    sold: 64,
    stock: 100,
    image: ImageAlt,
    to: "/products/21",
  },
  {
    name: "Màn hình MSI Gaming 24 inch",
    price: 3290000,
    oldPrice: 3990000,
    sold: 91,
    stock: 100,
    image: Image,
    to: "/products/71",
  },
  {
    name: "CPU Intel Core i5-14600K",
    price: 8490000,
    oldPrice: 9990000,
    sold: 47,
    stock: 100,
    image: ImageDark,
    to: "/products/41",
  },
];

function formatVND(value) {
  return value.toLocaleString("vi-VN") + " đ";
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function getEndOfDay(from) {
  const end = new Date(from);
  end.setHours(23, 59, 59, 999);
  if (end <= from) {
    end.setDate(end.getDate() + 1);
  }
  return end;
}

function useCountdown() {
  const [remainingMs, setRemainingMs] = useState(() => {
    const now = new Date();
    return getEndOfDay(now) - now;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        const next = prev - 1000;
        if (next > 0) return next;

        const now = new Date();
        return getEndOfDay(now) - now;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const totalSeconds = Math.max(Math.floor(remainingMs / 1000), 0);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function FlashSale() {
  const { hours, minutes, seconds } = useCountdown();

  return (
    <div className="flash-sale">
      <div className="flash-sale-head">
        <div className="flash-sale-title">
          <span className="flash-sale-icon">
            <FontAwesomeIcon icon={["fas", "bolt"]} />
          </span>
          <div>
            <strong>Khung giờ vàng</strong>
            <p>Giá sốc mỗi ngày, số lượng ưu đãi có hạn</p>
          </div>
        </div>

        <div className="flash-sale-countdown" aria-label="Thời gian kết thúc ưu đãi">
          <span>
            <FontAwesomeIcon icon={["fas", "clock"]} /> Kết thúc trong
          </span>
          <div className="flash-sale-clock">
            <span className="flash-sale-clock-box">{pad(hours)}</span>
            <b>:</b>
            <span className="flash-sale-clock-box">{pad(minutes)}</span>
            <b>:</b>
            <span className="flash-sale-clock-box">{pad(seconds)}</span>
          </div>
        </div>
      </div>

      <div className="flash-sale-grid">
        {flashItems.map((item, index) => {
          const percentOff = Math.round(
            ((item.oldPrice - item.price) / item.oldPrice) * 100
          );
          const soldPercent = Math.min(
            Math.round((item.sold / item.stock) * 100),
            100
          );

          return (
            <Link
              to={item.to}
              key={item.to}
              className="flash-sale-card"
              style={{ "--item-index": index }}
            >
              <div className="flash-sale-media">
                <span className="flash-sale-discount">-{percentOff}%</span>
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="flash-sale-body">
                <h5>{item.name}</h5>

                <div className="flash-sale-price">
                  <strong>{formatVND(item.price)}</strong>
                  <span>{formatVND(item.oldPrice)}</span>
                </div>

                <div className="flash-sale-progress">
                  <div className="flash-sale-progress-bar">
                    <span style={{ width: `${soldPercent}%` }} />
                  </div>
                  <small>
                    Đã bán {item.sold}/{item.stock}
                  </small>
                </div>

                <span className="flash-sale-cta">Mua ngay</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default FlashSale;
