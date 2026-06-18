import Image from "../nillkin-case.webp";
import ImageAlt from "../nillkin-case-1.jpg";
import ImageDark from "../nillkin-case.jpg";
import { Link } from "react-router-dom";

const featuredProducts = [
  {
    name: "Laptop Asus Vivobook 14",
    price: "14.290.000 đ",
    type: "Laptop",
    image: ImageAlt,
    to: "/category/laptop",
  },
  {
    name: "PC Gaming Shark RTX 4060",
    price: "18.500.000 đ",
    type: "PC gaming",
    image: ImageDark,
    to: "/products",
  },
  {
    name: "Màn hình MSI Gaming 24 inch",
    price: "3.290.000 đ",
    type: "Màn hình",
    image: Image,
    to: "/category/man-hinh",
  },
  {
    name: "CPU Intel Core i5-14600K",
    price: "8.490.000 đ",
    type: "Linh kiện",
    image: ImageDark,
    to: "/category/linh-kien-pc",
  },
  {
    name: "Chuột Logitech không dây",
    price: "790.000 đ",
    type: "Phụ kiện",
    image: Image,
    to: "/category/phu-kien",
  },
  {
    name: "RAM Corsair Vengeance 32GB",
    price: "3.250.000 đ",
    type: "Linh kiện",
    image: ImageAlt,
    to: "/category/linh-kien-pc",
  },
];

function FeatureProduct({ index = 0 }) {
  const product = featuredProducts[index % featuredProducts.length];

  return (
    <div className="col">
      <div className="card shadow-sm home-feature-product">
        <img
          className="card-img-top bg-dark cover responsive-product-image"
          alt={product.name}
          src={product.image}
        />
        <div className="card-body">
          <div className="home-product-meta">
            <span>{product.type}</span>
            <strong>{product.price}</strong>
          </div>
          <h5 className="card-title fw-bold">{product.name}</h5>
          <div className="d-grid gap-2">
            <Link to={product.to} className="btn btn-outline-dark">
              Xem ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureProduct;
