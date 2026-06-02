import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AppContext = createContext();

// Load service URLs from Vite env variables with default local fallbacks
export const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:5001';
export const PRODUCT_SERVICE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://localhost:5002';
export const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:5003';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initialize state from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('cloudcart_user');
    const savedToken = localStorage.getItem('cloudcart_token');
    const savedCart = localStorage.getItem('cloudcart_cart');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cloudcart_cart', JSON.stringify(cart));
  }, [cart]);

  // Auth Actions
  const loginAction = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('cloudcart_user', JSON.stringify(userData));
    localStorage.setItem('cloudcart_token', jwtToken);
  };

  const logoutAction = () => {
    setUser(null);
    setToken(null);
    setCart([]);
    localStorage.removeItem('cloudcart_user');
    localStorage.removeItem('cloudcart_token');
    localStorage.removeItem('cloudcart_cart');
  };

  // Cart Actions
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.product.id === product.id);
      
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout Action (communicates with order-service)
  const checkout = async () => {
    if (!token) {
      throw new Error('Please login to place an order.');
    }

    if (cart.length === 0) {
      throw new Error('Your cart is empty.');
    }

    // Format items as expected by order-service
    const orderItems = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity
    }));

    try {
      const response = await axios.post(
        `${ORDER_SERVICE_URL}/api/orders`,
        { items: orderItems },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      clearCart();
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || 'Failed to complete order';
      throw new Error(errMsg);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.product.price) * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        cart,
        isCartOpen,
        setIsCartOpen,
        loginAction,
        logoutAction,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkout,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
