'use client';

import React, { useState } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ShopView({
  products,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  initialCategory = 'All',
  wishlist = [],
  onToggleWishlist = () => {},
}) {
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  const [selectedCategory, setSelectedCategory] = useState(
    categories.map((c) => c.toLowerCase()).includes((initialCategory || '').toLowerCase())
      ? initialCategory
      : 'All'
  );

  React.useEffect(() => {
    if (initialCategory && categories.map((c) => c.toLowerCase()).includes(initialCategory.toLowerCase())) {
      setSelectedCategory(initialCategory);
    } else {
      setSelectedCategory('All');
    }
  }, [initialCategory]);
  const [sortBy, setSortBy] = useState('featured');

  let filtered = [...products];

  if (selectedCategory !== 'All') {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.packs[0].price - b.packs[0].price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.packs[0].price - a.packs[0].price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="container py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C49A4A] font-bold">
          Our Full Collection
        </span>
        <h1 className="mt-2 font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#173B2A]">
          Handpicked Natural Goodness
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#6B4432]">
          Explore 100% natural, sun-ripened raisins and premium dry fruits packed hygienically for everyday health.
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-5 rounded-2xl bg-white border border-[#173B2A]/10 shadow-sm mb-10">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#173B2A] mr-2 flex items-center gap-1 hidden sm:flex">
            <Filter className="w-3.5 h-3.5 text-[#C49A4A]" /> Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-[#173B2A] text-[#F7F1E5] shadow'
                  : 'bg-[#F7F1E5]/70 text-[#173B2A] hover:bg-[#F7F1E5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#C49A4A]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold bg-[#F7F1E5]/70 text-[#173B2A] px-3 py-1.5 rounded-xl border-none focus:outline-none cursor-pointer"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
            onToggleWishlist={onToggleWishlist}
            isWishlisted={wishlist.some((w) => w.productId === product.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-sm text-[#6B4432]">
          No products found in this category.
        </div>
      )}
    </div>
  );
}
