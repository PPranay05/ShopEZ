import React, { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Load cart and wishlist from LocalStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('shopez-cart');
    const storedWishlist = localStorage.getItem('shopez-wishlist');

    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error('Error parsing stored cart:', e);
      }
    }

    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch (e) {
        console.error('Error parsing stored wishlist:', e);
      }
    }
  }, []);

  // Sync cart to LocalStorage
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('shopez-cart', JSON.stringify(items));
  };

  // Sync wishlist to LocalStorage
  const saveWishlist = (items) => {
    setWishlist(items);
    localStorage.setItem('shopez-wishlist', JSON.stringify(items));
  };

  // Add item to cart
  const addToCart = (product, qty = 1) => {
    const existItem = cartItems.find((x) => x.product === product._id);

    let newCartItems;
    if (existItem) {
      // Check stock limit
      const newQty = existItem.qty + qty;
      if (newQty > product.stockQuantity) {
        return { success: false, message: `Only ${product.stockQuantity} items in stock.` };
      }
      newCartItems = cartItems.map((x) =>
        x.product === product._id ? { ...x, qty: newQty } : x
      );
    } else {
      if (qty > product.stockQuantity) {
        return { success: false, message: `Only ${product.stockQuantity} items in stock.` };
      }
      newCartItems = [
        ...cartItems,
        {
          product: product._id,
          name: product.name,
          image: product.images[0] || '/images/placeholder.jpg',
          price: product.price,
          qty: qty,
          stockQuantity: product.stockQuantity,
        },
      ];
    }

    saveCart(newCartItems);
    return { success: true };
  };

  // Modify item quantity in cart
  const changeQuantity = (productId, qty) => {
    const item = cartItems.find((x) => x.product === productId);
    if (!item) return;

    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (qty > item.stockQuantity) {
      return { success: false, message: `Only ${item.stockQuantity} items in stock.` };
    }

    const newCartItems = cartItems.map((x) =>
      x.product === productId ? { ...x, qty } : x
    );
    saveCart(newCartItems);
    return { success: true };
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    const newCartItems = cartItems.filter((x) => x.product !== productId);
    saveCart(newCartItems);
  };

  // Clear cart
  const clearCart = () => {
    saveCart([]);
  };

  // Toggle wishlist item
  const toggleWishlist = (product) => {
    const exists = wishlist.find((x) => x._id === product._id);
    let newWishlist;
    
    if (exists) {
      newWishlist = wishlist.filter((x) => x._id !== product._id);
      saveWishlist(newWishlist);
      return { added: false };
    } else {
      newWishlist = [...wishlist, product];
      saveWishlist(newWishlist);
      return { added: true };
    }
  };

  // Pricing calculations
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 9.99;
  const taxPrice = itemsPrice * 0.08; // 8% sales tax
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlist,
        addToCart,
        changeQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };
export default CartContext;
