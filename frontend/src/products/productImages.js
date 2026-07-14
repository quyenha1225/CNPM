import LaptopImage from "../nillkin-case-1.jpg";
import AccessoryImage from "../nillkin-case.webp";
import DarkProductImage from "../nillkin-case.jpg";

const productImageById = {
  1: DarkProductImage,
  21: LaptopImage,
  41: DarkProductImage,
  66: LaptopImage,
  71: AccessoryImage,
  89: AccessoryImage,
};

const productImageByCategory = {
  Laptop: LaptopImage,
  PC_Gaming: DarkProductImage,
  PC_VanPhong: DarkProductImage,
  PC_ChuyenDung: DarkProductImage,
  LinhKien: DarkProductImage,
  ManHinh: AccessoryImage,
  GamingGear: AccessoryImage,
  PhuKien: AccessoryImage,
};

export function getProductImage(product) {
  if (!product) return LaptopImage;

  return (
    product.image_url ||
    productImageById[product.id] ||
    productImageByCategory[product.category] ||
    LaptopImage
  );
}
