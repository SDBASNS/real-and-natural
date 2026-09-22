'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Menu, 
  X, 
  Search, 
  User, 
  ShoppingCart, 
  ShieldCheck, 
  Package, 
  LogOut, 
  ChevronDown,
  Heart
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  navigate, 
  cartCount = 0, 
  wishlistCount = 0,
  onOpenSearch,
  customer = null,
  onOpenAuth = () => {},
  onLogout = () => {},
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  // Close account dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (view, sectionId) => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    if (view === 'home' && sectionId) {
      if (currentView !== 'home') {
        navigate('home');
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#173B2A] text-[#F7F1E5] text-[11px] sm:text-xs tracking-wide">
        <div className="container flex items-center justify-center gap-2 py-2 text-center">
          <Sparkles className="w-3.5 h-3.5 text-[#C49A4A] shrink-0" />
          <span>Premium Natural Raisins • Carefully Selected • Delivered Across India</span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#F7F1E5]/90 backdrop-blur-md border-b border-[#173B2A]/10 transition-all">
        <div className="container flex items-center justify-between h-16 sm:h-20">
          
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-[#173B2A] hover:text-[#C49A4A] transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => handleNavClick('home')}
              className="flex flex-col leading-none text-left group"
            >
              <span className="font-serif-display text-lg sm:text-2xl font-bold tracking-tight text-[#173B2A] group-hover:text-[#0F2A1D] transition">
                REAL <span className="text-[#C49A4A]">&amp;</span> NATURAL
              </span>
              <span className="hidden sm:block text-[9px] tracking-[0.3em] text-[#6B4432]/80 uppercase mt-0.5">
                Premium Natural Raisins
              </span>
            </button>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-sm font-medium transition relative group ${
                currentView === 'home' ? 'text-[#173B2A] font-semibold' : 'text-[#173B2A]/80 hover:text-[#173B2A]'
              }`}
            >
              Home
              <span
                className={`absolute -bottom-1 left-0 h-[2px] bg-[#C49A4A] transition-all ${
                  currentView === 'home' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </button>

            <button
              onClick={() => handleNavClick('shop')}
              className={`text-sm font-medium transition relative group ${
                currentView === 'shop' ? 'text-[#173B2A] font-semibold' : 'text-[#173B2A]/80 hover:text-[#173B2A]'
              }`}
            >
              Shop
              <span
                className={`absolute -bottom-1 left-0 h-[2px] bg-[#C49A4A] transition-all ${
                  currentView === 'shop' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </button>

            <button
              onClick={() => handleNavClick('orders')}
              className={`text-sm font-medium transition relative group flex items-center gap-1.5 ${
                currentView === 'orders' ? 'text-[#173B2A] font-semibold' : 'text-[#173B2A]/80 hover:text-[#173B2A]'
              }`}
            >
              <Package className="w-4 h-4 text-[#C49A4A]" />
              <span>My Orders</span>
              <span
                className={`absolute -bottom-1 left-0 h-[2px] bg-[#C49A4A] transition-all ${
                  currentView === 'orders' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </button>

            <button
              onClick={() => handleNavClick('home', 'why-us')}
              className="text-sm font-medium text-[#173B2A]/80 hover:text-[#173B2A] transition relative group"
            >
              Why Us
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#C49A4A] transition-all group-hover:w-full" />
            </button>

            <button
              onClick={() => handleNavClick('home', 'contact')}
              className="text-sm font-medium text-[#173B2A]/80 hover:text-[#173B2A] transition relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#C49A4A] transition-all group-hover:w-full" />
            </button>
          </nav>

          {/* Right Actions: Search, Customer Account/Login, Admin, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#173B2A] hover:text-[#C49A4A] transition rounded-full hover:bg-white/60"
              aria-label="Search products"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Customer Account / Login */}
            {customer ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white border border-[#173B2A]/15 hover:border-[#173B2A]/30 text-xs font-semibold text-[#173B2A] transition shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-[#173B2A] text-[#F7F1E5] flex items-center justify-center text-[11px] font-bold">
                    {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[85px] truncate hidden sm:inline">
                    {customer.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B4432]/70" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#173B2A]/10 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-[#173B2A]/10 text-xs">
                      <div className="font-bold text-[#173B2A] truncate">{customer.name}</div>
                      <div className="text-[10px] text-[#6B4432] truncate">{customer.phone || customer.email}</div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleNavClick('account')}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-[#173B2A] hover:bg-[#F7F1E5] flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#C49A4A]" />
                      <span>My Account &amp; Addresses</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('orders')}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-[#173B2A] hover:bg-[#F7F1E5] flex items-center gap-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-[#C49A4A]" />
                      <span>My Orders &amp; Tracking</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('account')}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-[#173B2A] hover:bg-[#F7F1E5] flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                        <span>My Wishlist</span>
                      </div>
                      {wishlistCount > 0 && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </button>

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-white border border-[#173B2A]/15 hover:border-[#173B2A]/40 text-xs font-semibold text-[#173B2A] hover:bg-[#173B2A]/5 transition shadow-sm cursor-pointer"
              >
                <User className="w-4 h-4 text-[#C49A4A]" />
                <span>Login</span>
              </button>
            )}

            {/* Wishlist Header Icon */}
            <button
              onClick={() => handleNavClick('account')}
              className="relative p-2 text-[#173B2A] hover:text-rose-600 transition rounded-full hover:bg-white/60 cursor-pointer"
              aria-label="Saved Wishlist"
              title="Saved Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => handleNavClick('cart')}
              className="relative p-2 text-[#173B2A] hover:text-[#C49A4A] transition rounded-full hover:bg-white/60"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-[#C49A4A] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#173B2A]/10 bg-[#F7F1E5] px-5 py-4 space-y-3 shadow-xl">
            {customer ? (
              <div className="p-3 rounded-xl bg-white border border-[#173B2A]/10 mb-2 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#173B2A]">{customer.name}</div>
                  <div className="text-[10px] text-[#6B4432]">{customer.phone || customer.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="text-xs text-rose-600 font-semibold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#173B2A] text-[#F7F1E5] text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <User className="w-4 h-4 text-[#C49A4A]" />
                <span>Login / Create Account</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('home')}
              className="block w-full text-left py-2 font-medium text-[#173B2A] hover:text-[#C49A4A] text-base"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('shop')}
              className="block w-full text-left py-2 font-medium text-[#173B2A] hover:text-[#C49A4A] text-base"
            >
              Shop All Products
            </button>
            <button
              onClick={() => handleNavClick('orders')}
              className="block w-full text-left py-2 font-medium text-[#173B2A] hover:text-[#C49A4A] text-base flex items-center justify-between"
            >
              <span>My Orders &amp; Tracking</span>
              <Package className="w-4 h-4 text-[#C49A4A]" />
            </button>
            <button
              onClick={() => handleNavClick('home', 'why-us')}
              className="block w-full text-left py-2 font-medium text-[#173B2A] hover:text-[#C49A4A] text-base"
            >
              Why Real &amp; Natural
            </button>
            <button
              onClick={() => handleNavClick('home', 'contact')}
              className="block w-full text-left py-2 font-medium text-[#173B2A] hover:text-[#C49A4A] text-base"
            >
              Contact Us
            </button>

            <div className="pt-3 border-t border-[#173B2A]/10 flex items-center justify-between">
              <button
                onClick={() => handleNavClick('admin')}
                className="text-xs font-semibold text-[#173B2A]/70 hover:text-[#C49A4A] flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C49A4A]" />
                Merchant Admin
              </button>
              <button
                onClick={() => handleNavClick('cart')}
                className="text-xs font-semibold text-[#173B2A] hover:text-[#C49A4A] flex items-center gap-1"
              >
                Cart ({cartCount})
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
