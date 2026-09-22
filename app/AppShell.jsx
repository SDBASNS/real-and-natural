'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeView from '@/components/HomeView';
import ShopView from '@/components/ShopView';
import ProductDetailView from '@/components/ProductDetailView';
import CartView from '@/components/CartView';
import CheckoutView from '@/components/CheckoutView';
import SuccessView from '@/components/SuccessView';
import AdminView from '@/components/AdminView';
import SearchOverlay from '@/components/SearchOverlay';
import AuthModal from '@/components/AuthModal';
import MyOrdersView from '@/components/MyOrdersView';
import MyAccountView from '@/components/MyAccountView';

export default function AppShell({ initialProducts }) {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState('All');

  // Customer Account & Authentication State
  const [customer, setCustomer] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Load cart, wishlist & customer from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('rn_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem('rn_wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
      const savedCustomer = localStorage.getItem('rn_customer');
      if (savedCustomer) {
        setCustomer(JSON.parse(savedCustomer));
      }
    } catch (err) {
      console.error('Failed to load storage data:', err);
    }
  }, []);

  const handleToggleWishlist = (item) => {
    const exists = wishlist.some((w) => w.productId === item.productId || w.id === item.id);
    let updated;
    if (exists) {
      updated = wishlist.filter((w) => w.productId !== item.productId && w.id !== item.id);
      toast.info(`Removed ${item.name} from wishlist`);
    } else {
      updated = [...wishlist, item];
      toast.success(`Saved ${item.name} to wishlist ❤️`);
    }
    setWishlist(updated);
    try {
      localStorage.setItem('rn_wishlist', JSON.stringify(updated));
    } catch (_) {}
  };

  // Sync cart with localStorage
  const updateCartAndPersist = (newCart) => {
    setCart(newCart);
    try {
      localStorage.setItem('rn_cart', JSON.stringify(newCart));
    } catch (err) {
      console.error('Failed to persist cart:', err);
    }
  };

  const handleAddToCart = (item) => {
    const existingIndex = cart.findIndex((i) => i.id === item.id);
    let updated;
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex].quantity += item.quantity;
    } else {
      updated = [...cart, item];
    }
    updateCartAndPersist(updated);
    toast.success(`Added ${item.name} (${item.pack}) to your bag`, {
      description: `Qty: ${item.quantity} • ₹${item.price * item.quantity}`,
    });
  };

  const handleBuyNow = (item) => {
    handleAddToCart(item);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    const updated = cart.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i));
    updateCartAndPersist(updated);
  };

  const handleRemoveItem = (itemId) => {
    const updated = cart.filter((i) => i.id !== itemId);
    updateCartAndPersist(updated);
    toast.info('Item removed from cart');
  };

  const handleOrderPlaced = (order) => {
    setPlacedOrder(order);
    updateCartAndPersist([]);
    setCurrentView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = (view, options = {}) => {
    if (options.category) {
      setShopCategory(options.category);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Handlers
  const handleLogin = (customerData) => {
    setCustomer(customerData);
    try {
      localStorage.setItem('rn_customer', JSON.stringify(customerData));
    } catch (_) {}
  };

  const handleLogout = () => {
    setCustomer(null);
    try {
      localStorage.removeItem('rn_customer');
    } catch (_) {}
    toast.info('You have logged out successfully');
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const totalCartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F1E5] text-[#173B2A]">
      <Navbar
        currentView={currentView}
        navigate={navigate}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenSearch={() => setIsSearchOpen(true)}
        customer={customer}
        onOpenAuth={() => openAuth('login')}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={initialProducts}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            navigate={navigate}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {currentView === 'shop' && (
          <ShopView
            products={initialProducts}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            initialCategory={shopCategory}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {currentView === 'product' && (
          <ProductDetailView
            product={selectedProduct || initialProducts[0]}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSelectProduct={handleSelectProduct}
            navigate={navigate}
          />
        )}

        {currentView === 'account' && (
          <MyAccountView
            customer={customer}
            onLogout={handleLogout}
            navigate={navigate}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onOpenAuth={() => openAuth('login')}
          />
        )}

        {currentView === 'orders' && (
          <MyOrdersView
            customer={customer}
            onOpenAuth={() => openAuth('login')}
            onAddToCart={handleAddToCart}
            navigate={navigate}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            navigate={navigate}
            onProceedToCheckout={() => {
              setCurrentView('checkout');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            cart={cart}
            customer={customer}
            onOpenAuth={() => openAuth('login')}
            onOrderPlaced={handleOrderPlaced}
            navigate={navigate}
          />
        )}

        {currentView === 'success' && (
          <SuccessView
            order={placedOrder}
            navigate={navigate}
          />
        )}

        {currentView === 'admin' && (
          <AdminView navigate={navigate} />
        )}
      </main>

      <Footer navigate={navigate} />

      {/* Global Search Overlay Modal */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
      />

      {/* Flipkart-style Customer Login & Create Account Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        initialMode={authMode}
      />
    </div>
  );
}
