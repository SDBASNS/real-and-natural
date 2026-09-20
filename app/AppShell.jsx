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

export default function AppShell({ initialProducts }) {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState('All');

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rn_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load cart from storage:', err);
    }
  }, []);

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

  const totalCartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F1E5] text-[#173B2A]">
      <Navbar
        currentView={currentView}
        navigate={navigate}
        cartCount={totalCartCount}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={initialProducts}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            navigate={navigate}
          />
        )}

        {currentView === 'shop' && (
          <ShopView
            products={initialProducts}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            initialCategory={shopCategory}
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
    </div>
  );
}
