'use client';

import React, { useState } from 'react';
import { Star, ShoppingCart, Zap, Heart } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onSelectProduct, 
  onAddToCart, 
  onBuyNow, 
  onToggleWishlist = () => {}, 
  isWishlisted = false 
}) {
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const currentPack = product.packs[selectedPackIndex] || product.packs[0];
  const discountPercent = Math.round(((currentPack.mrp - currentPack.price) / currentPack.mrp) * 100);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart({
      id: `${product.id}-${currentPack.size}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      pack: currentPack.size,
      price: currentPack.price,
      mrp: currentPack.mrp,
      quantity: 1,
    });
  };

  const handleBuy = (e) => {
    e.stopPropagation();
    onBuyNow({
      id: `${product.id}-${currentPack.size}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      pack: currentPack.size,
      price: currentPack.price,
      mrp: currentPack.mrp,
      quantity: 1,
    });
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onToggleWishlist({
      id: `${product.id}-${currentPack.size}`,
      productId: product.id,
      name: product.name,
      image: product.image,
      pack: currentPack.size,
      price: currentPack.price,
      mrp: currentPack.mrp,
    });
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#173B2A]/8 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
      {/* Product Image */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative aspect-square overflow-hidden cursor-pointer bg-[#F7F1E5]/40"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {product.bestSeller && (
          <span className="absolute top-3 left-3 bg-[#C49A4A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow z-10">
            Best Seller
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md text-rose-500 hover:scale-110 transition z-10 cursor-pointer"
          aria-label="Wishlist product"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[#C49A4A] font-bold">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-[#C49A4A] text-[#C49A4A]'
                      : 'text-[#C49A4A]/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#6B4432] font-medium">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelectProduct(product)}
          className="mt-1.5 font-serif-display text-lg font-bold text-[#173B2A] leading-tight cursor-pointer hover:text-[#C49A4A] transition"
        >
          {product.name}
        </h3>

        {/* Description */}
        <p className="mt-1 text-xs text-[#6B4432] line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>

        {/* Pack Size Pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.packs.map((pack, idx) => (
            <button
              key={pack.size}
              type="button"
              onClick={() => setSelectedPackIndex(idx)}
              className={`text-xs px-2.5 py-1 rounded-full border transition font-medium ${
                selectedPackIndex === idx
                  ? 'bg-[#173B2A] text-[#F7F1E5] border-[#173B2A]'
                  : 'bg-transparent text-[#173B2A] border-[#173B2A]/20 hover:border-[#173B2A]/50'
              }`}
            >
              {pack.size}
            </button>
          ))}
        </div>

        {/* Price Section */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-[#173B2A]">
            ₹{currentPack.price}
          </span>
          <span className="text-sm text-[#6B4432]/60 line-through">
            ₹{currentPack.mrp}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#173B2A]/25 text-[#173B2A] hover:bg-[#173B2A] hover:text-[#F7F1E5] h-9 text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleBuy}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#C49A4A] hover:bg-[#A87F30] text-white h-9 text-xs font-semibold transition active:scale-95 shadow"
          >
            <Zap className="w-3.5 h-3.5" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
