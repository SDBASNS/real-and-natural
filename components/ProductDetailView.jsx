'use client';

import React, { useState } from 'react';
import { Star, Check, Plus, Minus, ShoppingCart, Zap, ArrowLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { PRODUCTS } from '@/lib/products';
import ProductCard from './ProductCard';

export default function ProductDetailView({
  product,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
  navigate,
}) {
  if (!product) return null;

  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const currentPack = product.packs[selectedPackIndex] || product.packs[0];
  const discountPercent = Math.round(((currentPack.mrp - currentPack.price) / currentPack.mrp) * 100);

  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    onAddToCart({
      id: `${product.id}-${currentPack.size}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      pack: currentPack.size,
      price: currentPack.price,
      mrp: currentPack.mrp,
      quantity,
    });
  };

  const handleBuy = () => {
    onBuyNow({
      id: `${product.id}-${currentPack.size}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      pack: currentPack.size,
      price: currentPack.price,
      mrp: currentPack.mrp,
      quantity,
    });
  };

  return (
    <div className="container py-10 sm:py-14">
      {/* Breadcrumb / Back button */}
      <button
        onClick={() => navigate('shop')}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#173B2A] hover:text-[#C49A4A] transition mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </button>

      {/* Main Product Showcase Grid */}
      <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 items-start">
        
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-[#173B2A]/10 shadow-lg">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.bestSeller && (
              <span className="absolute top-4 left-4 bg-[#C49A4A] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                Best Seller
              </span>
            )}
            {discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-[#173B2A] text-[#F7F1E5] text-xs font-bold px-3 py-1 rounded-full shadow">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail list */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 bg-white ${
                    activeImage === img
                      ? 'border-[#173B2A] shadow-md'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#C49A4A] font-bold">
            {product.category}
          </span>

          <h1 className="mt-2 font-serif-display text-3xl sm:text-4xl font-bold text-[#173B2A] leading-tight">
            {product.name}
          </h1>

          {/* Star rating */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-[#C49A4A] text-[#C49A4A]'
                      : 'text-[#C49A4A]/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-[#6B4432] font-semibold">
              {product.rating} ({product.reviewCount} customer reviews)
            </span>
          </div>

          <p className="mt-4 text-sm sm:text-base text-[#6B4432] leading-relaxed">
            {product.description}
          </p>

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#173B2A]">
              ₹{currentPack.price * quantity}
            </span>
            <span className="text-lg text-[#6B4432]/60 line-through">
              ₹{currentPack.mrp * quantity}
            </span>
            <span className="text-xs bg-[#173B2A] text-[#F7F1E5] px-2.5 py-0.5 rounded-full font-bold">
              Save ₹{(currentPack.mrp - currentPack.price) * quantity}
            </span>
          </div>

          {/* Pack Selection */}
          <div className="mt-6">
            <label className="block text-xs font-bold text-[#173B2A] uppercase tracking-wider mb-2">
              Select Pack Size
            </label>
            <div className="flex gap-2.5">
              {product.packs.map((p, idx) => (
                <button
                  key={p.size}
                  onClick={() => setSelectedPackIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                    selectedPackIndex === idx
                      ? 'bg-[#173B2A] border-[#173B2A] text-[#F7F1E5] shadow'
                      : 'border-[#173B2A]/20 text-[#173B2A] hover:border-[#173B2A]/60 bg-white'
                  }`}
                >
                  {p.size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Stepper & Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-xl border border-[#173B2A]/25 bg-white h-12 px-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 text-[#173B2A] hover:text-[#C49A4A] transition"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-[#173B2A]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 text-[#173B2A] hover:text-[#C49A4A] transition"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 rounded-full border border-[#173B2A] text-[#173B2A] hover:bg-[#173B2A] hover:text-[#F7F1E5] h-12 text-sm font-semibold shadow-sm transition active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>

            <button
              onClick={handleBuy}
              className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 rounded-full bg-[#C49A4A] hover:bg-[#A87F30] text-white h-12 text-sm font-semibold shadow-md transition active:scale-95"
            >
              <Zap className="w-4 h-4" />
              Buy Now
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 grid grid-cols-3 gap-2 pt-6 border-t border-[#173B2A]/10 text-center">
            <div className="flex flex-col items-center gap-1 text-[11px] text-[#6B4432] font-medium">
              <ShieldCheck className="w-5 h-5 text-[#C49A4A]" />
              <span>100% Natural</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[11px] text-[#6B4432] font-medium">
              <Truck className="w-5 h-5 text-[#C49A4A]" />
              <span>Free Delivery &gt;₹999</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[11px] text-[#6B4432] font-medium">
              <RefreshCw className="w-5 h-5 text-[#C49A4A]" />
              <span>Fresh Batch Sorted</span>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="mt-8 border-t border-[#173B2A]/10 pt-6">
            <div className="flex gap-4 border-b border-[#173B2A]/10 pb-2">
              <button
                onClick={() => setActiveTab('description')}
                className={`text-xs uppercase font-bold tracking-wider pb-1 transition ${
                  activeTab === 'description'
                    ? 'text-[#173B2A] border-b-2 border-[#173B2A]'
                    : 'text-[#6B4432]/60 hover:text-[#173B2A]'
                }`}
              >
                Ingredients &amp; Benefits
              </button>
              <button
                onClick={() => setActiveTab('storage')}
                className={`text-xs uppercase font-bold tracking-wider pb-1 transition ${
                  activeTab === 'storage'
                    ? 'text-[#173B2A] border-b-2 border-[#173B2A]'
                    : 'text-[#6B4432]/60 hover:text-[#173B2A]'
                }`}
              >
                Storage Advice
              </button>
            </div>

            <div className="pt-4 text-xs sm:text-sm text-[#6B4432] leading-relaxed">
              {activeTab === 'description' ? (
                <div className="space-y-3">
                  <p>
                    <strong className="text-[#173B2A]">Ingredients: </strong>
                    {product.ingredients}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {product.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#C49A4A] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>
                  Store in a cool, dry place in an airtight container away from direct sunlight. After opening, keep refrigerated to retain the highest natural moisture, sweetness, and plump texture for up to 9 months.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Related Products Showcase */}
      <div className="mt-20 pt-12 border-t border-[#173B2A]/10">
        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#173B2A] mb-8">
          You May Also Like
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {relatedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
