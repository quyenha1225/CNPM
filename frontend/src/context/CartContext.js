import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext();

const CART_STORAGE_KEY = "gearxin-cart";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // =========================
  // Thêm sản phẩm
  // =========================
  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity,
        },
      ];
    });
  }, []);

  // =========================
  // Xóa sản phẩm
  // =========================
  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // =========================
  // Cập nhật số lượng
  // =========================
  const updateQuantity = useCallback(
    (id, quantity) => {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity,
              }
            : item
        )
      );
    },
    [removeFromCart]
  );

  // =========================
  // Xóa toàn bộ giỏ
  // =========================
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // =========================
  // Lấy 1 sản phẩm trong giỏ
  // =========================
  const getCartItem = useCallback(
    (id) => cartItems.find((item) => item.id === id),
    [cartItems]
  );

  // =========================
  // Tổng số lượng
  // =========================
  const getTotalItems = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // =========================
  // Tổng tiền
  // =========================
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

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
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};