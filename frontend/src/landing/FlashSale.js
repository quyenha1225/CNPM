import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Thay thế hàm formatVND cũ bằng hàm này
function formatVND(value) {
  if (typeof value !== "number") {
    value = Number(value) || 0;
  }
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
  const [flashItems, setFlashItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu sản phẩm thật từ Database cho Flash Sale
  useEffect(() => {
    fetch("http://localhost:3001/api/products")
      .then((res) => res.json())
      .then((data) => {
        // Lấy ra 4 sản phẩm đầu tiên làm dữ liệu mẫu giờ vàng
        const selectedProducts = data.slice(0, 4).map((item, index) => {
          // Tạo giả lập giá cũ (bằng giá gốc + 15% làm ưu đãi giờ vàng)
          const oldPrice = Math.round((item.price * 1.15) / 10000) * 10000;

          // Giả lập số lượng đã bán ngẫu nhiên theo ID để không bị thay đổi mỗi lần F5
          const soldValue = ((item.id * 7) % 45) + 30;

          return {
            id: item.id,
            name: item.name,
            price: item.price,
            oldPrice: oldPrice,
            sold: soldValue,
            stock: 100,
            image: item.image || item.image_url, // Lấy đúng trường ảnh từ DB
            to: `/products/${item.id}`,
          };
        });
        setFlashItems(selectedProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy sản phẩm Flash Sale:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flash-sale text-center py-4">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2 text-muted">Đang tải khung giờ vàng...</p>
      </div>
    );
  }

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

        <div
          className="flash-sale-countdown"
          aria-label="Thời gian kết thúc ưu đãi"
        >
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
            ((item.oldPrice - item.price) / item.oldPrice) * 100,
          );
          const soldPercent = Math.min(
            Math.round((item.sold / item.stock) * 100),
            100,
          );

          return (
            <Link
              to={item.to}
              key={item.id}
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
