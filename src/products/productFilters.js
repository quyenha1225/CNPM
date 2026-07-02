import Image from "../nillkin-case-1.jpg";

const PRODUCT_IMAGE_STORAGE_KEY = "electroshop_product_images";

function readStoredProductImages() {
  try {
    const stored = window.localStorage.getItem(PRODUCT_IMAGE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveProductImage(productId, imageData) {
  const stored = readStoredProductImages();
  stored[productId] = imageData;
  window.localStorage.setItem(PRODUCT_IMAGE_STORAGE_KEY, JSON.stringify(stored));
}

export function getProductImage(product) {
  const stored = readStoredProductImages();
  return stored[product.id] || product.image || Image;
}

export const PRODUCT_DATA = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    category: 'Phones & Tablets',
    brand: 'Apple',
    manufacturer: 'Apple',
    price: 28990000,
    tag: 'new',
    image: Image,
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    category: 'Phones & Tablets',
    brand: 'Samsung',
    manufacturer: 'Samsung',
    price: 21990000,
    tag: 'featured',
    image: Image,
  },
  {
    id: 3,
    name: 'Dell XPS 13',
    category: 'Laptops',
    brand: 'Dell',
    manufacturer: 'Dell',
    price: 32990000,
    tag: 'sale',
    image: Image,
  },
  {
    id: 4,
    name: 'iPhone 14',
    category: 'Phones & Tablets',
    brand: 'Apple',
    manufacturer: 'Apple',
    price: 17990000,
    tag: 'featured',
    image: Image,
  },
  {
    id: 5,
    name: 'Baseus Cable 100W',
    category: 'Cables & Chargers',
    brand: 'Baseus',
    manufacturer: 'Baseus',
    price: 590000,
    tag: 'sale',
    image: Image,
  },
];

export function filterProducts(products, filters) {
  const searchTerm = (filters.searchTerm || '').toLowerCase().trim();
  const selectedCategory = filters.selectedCategory || 'All Products';
  const selectedBrands = filters.selectedBrands || [];
  const selectedManufacturers = filters.selectedManufacturers || [];
  const minPrice = Number(filters.minPrice || 0);
  const maxPrice = Number(filters.maxPrice || Number.MAX_SAFE_INTEGER);

  return products.filter((product) => {
    const matchesSearch =
      searchTerm.length === 0 ||
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === 'All Products' || product.category === selectedCategory;

    const matchesBrand =
      selectedBrands.length === 0 || selectedBrands.includes(product.brand);

    const matchesManufacturer =
      selectedManufacturers.length === 0 ||
      selectedManufacturers.includes(product.manufacturer);

    const matchesPrice =
      product.price >= minPrice && product.price <= maxPrice;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand &&
      matchesManufacturer &&
      matchesPrice
    );
  });
}
