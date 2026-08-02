import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "gearxin-cart";

function toPositiveInteger(value, fallback = 1) {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createLineKey(product) {
  if (product?.lineKey) return String(product.lineKey);

  const productId = Number(product?.id ?? product?.productId ?? 0);
  const variantId =
    product?.variantId ?? product?.variant_id ?? product?.variant?.id ?? "default";

  return `${productId}:${variantId ?? "default"}`;
}

function normalizeCartItem(product, quantity = 1) {
  const stock = Math.max(Number(product?.stock ?? product?.stock_quantity ?? 0), 0);
  const requestedQuantity = toPositiveInteger(quantity, 1);
  const safeQuantity = stock > 0 ? Math.min(requestedQuantity, stock) : requestedQuantity;

  return {
    ...product,
    id: Number(product?.id ?? product?.productId ?? 0),
    variantId: product?.variantId ?? product?.variant_id ?? null,
    lineKey: createLineKey(product),
    quantity: safeQuantity,
    stock,
    price: Number(product?.price ?? 0),
    originalPrice: Number(product?.originalPrice ?? product?.price ?? 0),
  };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.map((item) => normalizeCartItem(item, item.quantity))
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    const incoming = normalizeCartItem(product, quantity);

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.lineKey === incoming.lineKey,
      );

      if (!existingItem) {
        return [...currentItems, incoming];
      }

      return currentItems.map((item) => {
        if (item.lineKey !== incoming.lineKey) return item;

        const nextQuantity = item.quantity + incoming.quantity;
        const limitedQuantity =
          item.stock > 0 ? Math.min(nextQuantity, item.stock) : nextQuantity;

        return {
          ...item,
          ...incoming,
          quantity: limitedQuantity,
        };
      });
    });
  }, []);

  const removeFromCart = useCallback((lineKey) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.lineKey !== String(lineKey)),
    );
  }, []);

  const updateQuantity = useCallback((lineKey, quantity) => {
    const requestedQuantity = Math.floor(Number(quantity));

    if (!Number.isFinite(requestedQuantity)) return;

    if (requestedQuantity <= 0) {
      setCartItems((currentItems) =>
        currentItems.filter((item) => item.lineKey !== String(lineKey)),
      );
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.lineKey !== String(lineKey)) return item;

        const limitedQuantity =
          item.stock > 0
            ? Math.min(requestedQuantity, item.stock)
            : requestedQuantity;

        return {
          ...item,
          quantity: Math.max(limitedQuantity, 1),
        };
      }),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartItem = useCallback(
    (productId, variantId = null) => {
      const lineKey = `${Number(productId)}:${variantId ?? "default"}`;
      return cartItems.find((item) => item.lineKey === lineKey);
    },
    [cartItems],
  );

  const getTotalItems = useCallback(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const getTotalPrice = useCallback(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.price || 0) * item.quantity,
        0,
      ),
    [cartItems],
  );

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartItem,
      getTotalItems,
      getTotalPrice,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartItem,
      getTotalItems,
      getTotalPrice,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart phải được dùng bên trong CartProvider");
  }

  return context;
}
