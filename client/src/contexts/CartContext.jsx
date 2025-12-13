// client/src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Lấy giỏ hàng từ LocalStorage nếu có (để F5 không mất)
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Lưu vào LocalStorage mỗi khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Hàm thêm vào giỏ
  const addToCart = (product, variant, quantity = 1) => {
    setCartItems((prev) => {
      // Kiểm tra xem sản phẩm với biến thể này (SKU) đã có trong giỏ chưa
      const existingItem = prev.find((item) => item.sku === variant.sku);

      if (existingItem) {
        // Nếu có rồi thì tăng số lượng
        return prev.map((item) =>
          item.sku === variant.sku
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Nếu chưa thì thêm mới
        return [
          ...prev,
          {
            ...variant, // Lưu thông tin biến thể (giá, màu, sku)
            productName: product.name,
            productSlug: product.slug,
            productImage: product.image, // Ảnh gốc fallback
            quantity,
          },
        ];
      }
    });
  };

  // Hàm xóa khỏi giỏ
  const removeFromCart = (sku) => {
    setCartItems((prev) => prev.filter((item) => item.sku !== sku));
  };

  // Hàm cập nhật số lượng
  const updateQuantity = (sku, num) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, quantity: Math.max(1, num) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]); // Xóa sạch state
    localStorage.removeItem('cartItems'); // Xóa sạch local storage
  };


  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook để dùng nhanh ở các component khác
export const useCart = () => useContext(CartContext);