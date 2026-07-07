export const CART_UPDATED_EVENT = "gearxin-cart-updated";
const CART_STORAGE_KEY = "gearxin-cart-items";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizeCartItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      id: Number(item.id),
      quantity: Math.max(1, Number(item.quantity) || 1),
    }))
    .filter((item) => Number.isFinite(item.id));
}

function notifyCartChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}

export function getCartItems() {
  if (!canUseStorage()) return [];

  try {
    return normalizeCartItems(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)));
  } catch (error) {
    return [];
  }
}

export function saveCartItems(items) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeCartItems(items)));
  notifyCartChanged();
}

export function addProductToCart(product, quantity = 1) {
  if (!product?.id) return [];

  const cartItems = getCartItems();
  const productId = Number(product.id);
  const nextQuantity = Math.max(1, Number(quantity) || 1);
  const existingItem = cartItems.find((item) => item.id === productId);

  const nextItems = existingItem
    ? cartItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + nextQuantity }
          : item
      )
    : [...cartItems, { id: productId, quantity: nextQuantity }];

  saveCartItems(nextItems);
  return nextItems;
}

export function getCartCount() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}
