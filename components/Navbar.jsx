'use client';

import React, { useState } from 'react';
import { Sparkles, Menu, X, Search, User, ShoppingCart, ShieldCheck } from 'lucide-react';

export default function Navbar({ currentView, navigate, cartCount = 0, onOpenSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view, sectionId) => {
    setMobileMenuOpen(false);
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
          <nav className="hidden md:flex items-center gap-8">
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
              onClick={() => handleNavClick('home', 'why-us')}
              className="text-sm font-medium text-[#173B2A]/80 hover:text-[#173B2A] transition relative group"
            >
              Why Us
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#C49A4A] transition-all group-hover:w-full" />
            </button>

            <button
              onClick={() => handleNavClick('home', 'farm-to-home')}
              className="text-sm font-medium text-[#173B2A]/80 hover:text-[#173B2A] transition relative group"
            >
              Our Process
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

          {/* Right Actions: Search, Admin, Cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#173B2A] hover:text-[#C49A4A] transition rounded-full hover:bg-white/60"
              aria-label="Search products"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className={`p-2 transition rounded-full hover:bg-white/60 hidden sm:flex items-center gap-1 text-xs font-semibold ${
                currentView === 'admin' ? 'text-[#C49A4A]' : 'text-[#173B2A] hover:text-[#C49A4A]'
              }`}
              aria-label="Admin Dashboard"
              title="Admin Portal"
            >
              <User className="w-5 h-5" />
              <span className="hidden lg:inline">Admin</span>
            </button>

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
              onClick={() => handleNavClick('home', 'why-us')}
              className="block w-full text-left py-2 font-medium text-[#173B2A] hover:text-[#C49A4A] text-base"
            >
              Why Real &amp; Natural
            </button>
            <button
              onClick={() => handleNavClick('home', 'farm-to-home')}
              className="block w-full text-left py-2 font-medium text-[#173B2A] hover:text-[#C49A4A] text-base"
            >
              Farm to Home Process
            </button>
            <button
              onClick={() => handleNavClick('home', 'contact')}
              className="block w-full text-left py-2 font-medium text-[#173B2A] hover:text-[#C49A4A] text-base"
            >
              Contact Us
            </button>
            <div className="pt-2 border-t border-[#173B2A]/10 flex items-center justify-between">
              <button
                onClick={() => handleNavClick('admin')}
                className="text-xs font-semibold text-[#173B2A] hover:text-[#C49A4A] flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-[#C49A4A]" />
                Store Admin Portal
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
