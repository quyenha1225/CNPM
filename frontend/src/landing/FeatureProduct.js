import Image from "../nillkin-case.webp";
import ImageAlt from "../nillkin-case-1.jpg";
import ImageDark from "../nillkin-case.jpg";
import { Link } from "react-router-dom";

export const featuredProducts = [
  {
    name: "Laptop Asus Vivobook 14",
    price: "14.290.000 đ",
    type: "Laptop",
    badge: "Học tập",
    detail: "Mỏng nhẹ, màn hình đẹp, phù hợp học tập và văn phòng mỗi ngày.",
    specs: ["Intel Core i5", "14 inch", "SSD tốc độ cao"],
    image: ImageAlt,
    to: "/products/21",
  },
  {
    name: "PC Gaming Shark RTX 4060",
    price: "18.500.000 đ",
    type: "PC gaming",
    badge: "Bán chạy",
    detail: "Cấu hình cân game eSport, livestream và làm đồ họa cơ bản ổn định.",
    specs: ["RTX 4060", "16GB RAM", "Build tối ưu"],
    image: ImageDark,
    to: "/products/1",
  },
  {
    name: "Màn hình MSI Gaming 24 inch",
    price: "3.290.000 đ",
    type: "Màn hình",
    badge: "Setup",
    detail: "Tấm nền sắc nét, tần số quét mượt cho góc máy học tập và gaming.",
    specs: ["24 inch", "Gaming", "Viền mỏng"],
    image: Image,
    to: "/products/71",
  },
  {
    name: "CPU Intel Core i5-14600K",
    price: "8.490.000 đ",
    type: "Linh kiện",
    badge: "Nâng cấp",
    detail: "Hiệu năng mạnh cho build PC gaming, render nhẹ và đa nhiệm.",
    specs: ["Intel i5", "14 nhân", "Hiệu năng cao"],
    image: ImageDark,
    to: "/products/41",
  },
  {
    name: "Chuột Logitech không dây",
    price: "790.000 đ",
    type: "Phụ kiện",
    badge: "Gọn bàn",
    detail: "Kết nối ổn định, thao tác nhẹ, phù hợp làm việc và học online.",
    specs: ["Không dây", "Pin lâu", "Nhẹ tay"],
    image: Image,
    to: "/products/89",
  },
  {
    name: "RAM Corsair Vengeance 32GB",
    price: "3.250.000 đ",
    type: "Linh kiện",
    badge: "Hiệu năng",
    detail: "Dung lượng rộng cho gaming, thiết kế, lập trình và đa nhiệm nặng.",
    specs: ["32GB", "DDR5", "Tản nhiệt"],
    image: ImageAlt,
    to: "/products/66",
  },
  {
    name: "Laptop ROG Strix G16 RTX 4060",
    price: "34.990.000 đ",
    type: "Laptop gaming",
    badge: "Gaming",
    detail: "Màn hình lớn, hiệu năng mạnh cho game, đồ họa và học ngành kỹ thuật.",
    specs: ["Core i7", "RTX 4060", "Màn 16 inch"],
    image: ImageAlt,
    to: "/products/25",
  },
  {
    name: "MacBook Air M3 16GB 512GB",
    price: "32.490.000 đ",
    type: "Laptop",
    badge: "Mỏng nhẹ",
    detail: "Thiết kế gọn, pin lâu, phù hợp học tập, văn phòng và sáng tạo nội dung.",
    specs: ["Apple M3", "16GB RAM", "512GB SSD"],
    image: ImageAlt,
    to: "/products/32",
  },
  {
    name: "VGA ASUS Dual RTX 4060 8GB",
    price: "8.990.000 đ",
    type: "Linh kiện",
    badge: "Đồ họa",
    detail: "Nâng cấp FPS mượt hơn cho gaming Full HD, dựng video và stream cơ bản.",
    specs: ["RTX 4060", "8GB", "DLSS"],
    image: ImageDark,
    to: "/products/60",
  },
  {
    name: "Màn hình MSI G274F 27 inch",
    price: "4.690.000 đ",
    type: "Màn hình",
    badge: "180Hz",
    detail: "Không gian hiển thị rộng, tần số quét cao cho học tập và gaming.",
    specs: ["27 inch", "Fast IPS", "180Hz"],
    image: Image,
    to: "/products/72",
  },
  {
    name: "CPU AMD Ryzen 7 7800X3D",
    price: "10.500.000 đ",
    type: "Linh kiện",
    badge: "Vua game",
    detail: "Bộ nhớ đệm lớn, tối ưu cho dàn PC gaming hiệu năng cao.",
    specs: ["Ryzen 7", "3D V-Cache", "AM5"],
    image: ImageDark,
    to: "/products/49",
  },
  {
    name: "Chuột Logitech MX Master 3S",
    price: "2.350.000 đ",
    type: "Gaming Gear",
    badge: "Làm việc",
    detail: "Form cầm thoải mái, cuộn nhanh, phù hợp làm việc nhiều giờ.",
    specs: ["Không dây", "Ergonomic", "Pin lâu"],
    image: Image,
    to: "/products/86",
  },
  {
    name: "Bàn phím ASUS ROG Strix Scope RX",
    price: "3.150.000 đ",
    type: "Gaming Gear",
    badge: "Phím cơ",
    detail: "Cảm giác gõ chắc, đèn RGB nổi bật, hợp góc máy gaming.",
    specs: ["Red Switch", "RGB", "Chống nước"],
    image: Image,
    to: "/products/91",
  },
  {
    name: "SSD Samsung 990 PRO 1TB",
    price: "2.850.000 đ",
    type: "Linh kiện",
    badge: "Tốc độ",
    detail: "Tăng tốc khởi động máy, mở app và tải game với chuẩn NVMe Gen4.",
    specs: ["1TB", "NVMe", "PCIe Gen4"],
    image: ImageDark,
    to: "/products/69",
  },
  {
    name: "Samsung Odyssey G7 2K 240Hz",
    price: "11.990.000 đ",
    type: "Màn hình",
    badge: "Cao cấp",
    detail: "Màn gaming tốc độ cao, độ phân giải 2K cho trải nghiệm sắc nét.",
    specs: ["2K", "240Hz", "Gaming"],
    image: Image,
    to: "/products/80",
  },
  {
    name: "Nguồn Corsair RM850e 850W",
    price: "3.150.000 đ",
    type: "Linh kiện",
    badge: "Ổn định",
    detail: "Công suất dư dả cho PC gaming, hỗ trợ nâng cấp VGA sau này.",
    specs: ["850W", "80 Plus Gold", "ATX 3.0"],
    image: ImageDark,
    to: "/products/98",
  },
  {
    name: "Mainboard ASUS ROG B760-F WIFI",
    price: "5.890.000 đ",
    type: "Linh kiện",
    badge: "Build PC",
    detail: "Nền tảng mainboard mạnh, có WiFi, phù hợp build Intel gaming.",
    specs: ["B760", "WiFi", "ROG"],
    image: ImageDark,
    to: "/products/55",
  },
  {
    name: "Laptop Asus ExpertBook B1 i5",
    price: "13.990.000 đ",
    type: "Laptop",
    badge: "Văn phòng",
    detail: "Bền bỉ, gọn nhẹ, hợp sinh viên và nhân viên văn phòng cần máy ổn định.",
    specs: ["Core i5", "Gọn nhẹ", "Bền bỉ"],
    image: ImageAlt,
    to: "/products/29",
  },
];

const categoryLabels = {
  "dien-thoai": "Điện thoại",
  laptop: "Laptop",
  "phu-kien": "Phụ kiện",
  "linh-kien-pc": "Linh kiện PC",
  "man-hinh": "Màn hình",
};

const categoryImages = {
  "dien-thoai": Image,
  laptop: ImageAlt,
  "phu-kien": Image,
  "linh-kien-pc": ImageDark,
  "man-hinh": Image,
};

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(Number(price) || 0) + " đ";
}

function mapProductToFeatureCard(product) {
  const categoryName = categoryLabels[product.category] || product.category || "Sản phẩm";
  const image =
    product.image ||
    product.image_url ||
    categoryImages[product.category] ||
    ImageAlt;

  return {
    name: product.name,
    price: typeof product.price === "number" ? formatPrice(product.price) : product.price,
    type: product.type || categoryName,
    badge: product.badge || product.brand || "Nổi bật",
    detail:
      product.detail ||
      `Sản phẩm ${categoryName.toLowerCase()} đang có tại Gearxin Store.`,
    specs: product.specs || [product.brand, categoryName, "Còn hàng"].filter(Boolean).slice(0, 3),
    image,
    to: product.to || `/products/${product.id}`,
  };
}

function FeatureProduct({ product, index = 0 }) {
  const selectedProduct = mapProductToFeatureCard(
    product || featuredProducts[index % featuredProducts.length]
  );

  return (
    <div className="col">
      <article className="home-feature-product">
        <Link to={selectedProduct.to} className="home-feature-media">
          <span className="home-feature-badge">{selectedProduct.badge}</span>
          <img
            className="responsive-product-image"
            alt={selectedProduct.name}
            src={selectedProduct.image}
            loading="lazy"
            decoding="async"
          />
        </Link>
        <div className="home-feature-body">
          <div className="home-product-meta">
            <span>{selectedProduct.type}</span>
            <strong>{selectedProduct.price}</strong>
          </div>
          <h5>{selectedProduct.name}</h5>
          <p>{selectedProduct.detail}</p>
          <div className="home-feature-specs">
            {selectedProduct.specs.map((spec) => (
              <span key={spec}>{spec}</span>
            ))}
          </div>
          <Link to={selectedProduct.to} className="home-feature-link">
            Xem chi tiết
          </Link>
        </div>
      </article>
    </div>
  );
}

export default FeatureProduct;
