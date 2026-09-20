'use client';

import React, { useState } from 'react';
import { Star, Check, Plus, Minus, ShoppingCart, Zap } from 'lucide-react';

export default function BestSellerSpotlight({ product, onAddToCart, onBuyNow }) {
  if (!product) return null;

  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const pack = product.packs[selectedPackIndex] || product.packs[0];
  const discountPercent = Math.round(((pack.mrp - pack.price) / pack.mrp) * 100);

  const handleAdd = () => {
    onAddToCart({
      id: `${product.id}-${pack.size}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      pack: pack.size,
      price: pack.price,
      mrp: pack.mrp,
      quantity,
    });
  };

  const handleBuy = () => {
    onBuyNow({
      id: `${product.id}-${pack.size}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      pack: pack.size,
      price: pack.price,
      mrp: pack.mrp,
      quantity,
    });
  };

  return (
    <section className="bg-[#173B2A] text-[#F7F1E5]">
      <div className="container py-16 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
        
        {/* Left: Showcase Image */}
        <div className="rn-fade-up">
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] border border-white/10">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="inline-flex items-center px-3 py-1 text-xs font-semibold shadow absolute top-4 left-4 bg-[#C49A4A] text-white rounded-full">
              ⭐ Best Seller
            </div>
          </div>
        </div>

        {/* Right: Info & Selectors */}
        <div className="rn-fade-up">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C49A4A] font-bold">
            Featured Product
          </span>
          
          <h2 className="mt-2 font-serif-display text-3xl sm:text-4xl font-bold">
            {product.name}
          </h2>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#C49A4A] text-[#C49A4A]" />
              ))}
            </div>
            <span className="text-sm text-[#F7F1E5]/80 font-medium">
              {product.rating} ({product.reviewCount} verified reviews)
            </span>
          </div>

          <p className="mt-4 text-[#F7F1E5]/85 leading-relaxed text-sm sm:text-base">
            {product.description}
          </p>

          {/* Benefits Grid */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 max-w-sm">
            {product.benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#F7F1E5]/90">
                <Check className="w-4 h-4 text-[#C49A4A] shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">
              ₹{pack.price * quantity}
            </span>
            <span className="text-lg text-[#F7F1E5]/50 line-through">
              ₹{pack.mrp * quantity}
            </span>
            <span className="text-xs bg-[#C49A4A] text-white px-2.5 py-0.5 rounded-full font-bold">
              {discountPercent}% OFF
            </span>
          </div>

          {/* Pack & Quantity Selection */}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              {product.packs.map((p, idx) => (
                <button
                  key={p.size}
                  onClick={() => setSelectedPackIndex(idx)}
                  className={`text-sm px-3.5 py-1.5 rounded-full border transition font-medium ${
                    selectedPackIndex === idx
                      ? 'bg-[#C49A4A] border-[#C49A4A] text-white shadow'
                      : 'border-[#F7F1E5]/30 text-[#F7F1E5] hover:border-[#F7F1E5]'
                  }`}
                >
                  {p.size}
                </button>
              ))}
            </div>

            {/* Stepper */}
            <div className="flex items-center rounded-full border border-[#F7F1E5]/30 bg-white/5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:text-[#C49A4A] transition"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:text-[#C49A4A] transition"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F7F1E5] text-[#173B2A] hover:bg-white px-7 h-12 text-sm font-semibold shadow-lg transition active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={handleBuy}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C49A4A] hover:bg-[#A87F30] text-white px-7 h-12 text-sm font-semibold shadow-lg transition active:scale-95"
            >
              <Zap className="w-4 h-4" />
              Buy Now
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
