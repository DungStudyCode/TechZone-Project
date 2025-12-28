// client/src/contexts/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // 1. Khởi tạo giỏ hàng từ LocalStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. Tự động lưu vào LocalStorage mỗi khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- HÀM THÊM VÀO GIỎ ---
  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      // Kiểm tra xem sản phẩm đã có trong giỏ chưa
      const existItem = prevItems.find((item) => item._id === product._id);

      if (existItem) {
        // Nếu có rồi -> Cộng dồn số lượng
        return prevItems.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + qty } : item
        );
      } else {
        // Nếu chưa -> Thêm mới (Chỉ lấy các trường cần thiết để nhẹ bộ nhớ)
        return [
          ...prevItems,
          {
            _id: product._id,
            name: product.name,
            image: product.image,       // <-- QUAN TRỌNG: Lấy đúng trường image
            price: product.price,       // <-- QUAN TRỌNG: Lấy đúng trường price
            slug: product.slug,
            brand: product.brand,
            countInStock: product.countInStock,
            qty: qty,
          },
        ];
      }
    });
  };

  // --- HÀM XÓA KHỎI GIỎ ---
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
  };

  // --- HÀM CẬP NHẬT SỐ LƯỢNG ---
  const updateCartQty = (id, qty) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === id ? { ...item, qty: Math.max(1, qty) } : item
      )
    );
  };

  // --- HÀM XÓA SẠCH GIỎ (Dùng sau khi thanh toán) ---
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);