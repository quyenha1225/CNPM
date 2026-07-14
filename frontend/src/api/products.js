export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api";

function normalizeProduct(product) {
  const imageUrl =
    product.image_url && !String(product.image_url).includes("example.com")
      ? product.image_url
      : null;

  return {
    ...product,
    id: Number(product.id),
    price: Number(product.price) || 0,
    percent_off: Number(product.percent_off) || 0,
    image_url: imageUrl,
  };
}

export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);

  if (!response.ok) {
    throw new Error("Cannot load products from backend");
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  const productsById = new Map();
  data.forEach((product) => {
    const normalizedProduct = normalizeProduct(product);
    productsById.set(String(normalizedProduct.id), normalizedProduct);
  });

  return Array.from(productsById.values());
}

export async function getProductById(id) {
  const products = await getProducts();
  return products.find((product) => String(product.id) === String(id)) || null;
}
