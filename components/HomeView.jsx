'use client';

import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Hero from './Hero';
import TrustBar from './TrustBar';
import ProductCard from './ProductCard';
import BestSellerSpotlight from './BestSellerSpotlight';
import WhyUs from './WhyUs';
import FarmToHome from './FarmToHome';
import BenefitsAndReviews from './BenefitsAndReviews';
import GalleryAndFAQ from './GalleryAndFAQ';

export default function HomeView({
  products,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  navigate,
}) {
  const featuredProduct = products.find((p) => p.slug === 'golden-raisins-kishmish') || products[0];

  return (
    <>
      <Hero navigate={navigate} />
      <TrustBar />

      {/* Collection Preview Section */}
      <section id="collection" className="container py-16 sm:py-20 scroll-mt-20">
        <div className="rn-fade-up text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C49A4A] font-bold">
            Our Collection
          </span>
          <h2 className="mt-2 font-serif-display text-3xl sm:text-4xl font-bold text-[#173B2A]">
            Handpicked Natural Goodness
          </h2>
          <p className="mt-3 text-[#6B4432]">
            Premium raisins and dry fruits, selected and packed with care.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <div key={product.id} className="rn-fade-up">
              <ProductCard
                product={product}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => {
              navigate('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#173B2A]/25 bg-white/70 hover:bg-[#173B2A] text-[#173B2A] hover:text-[#F7F1E5] px-8 h-12 text-sm font-semibold transition active:scale-95 shadow-sm"
          >
            View All Products <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </section>

      {/* Featured Spotlight */}
      <BestSellerSpotlight
        product={featuredProduct}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
      />

      {/* Value Proposition */}
      <WhyUs />

      {/* 5-step Farm to Home */}
      <FarmToHome />

      {/* Benefits & Customer Reviews */}
      <BenefitsAndReviews />

      {/* Gallery, FAQ and Final CTA */}
      <GalleryAndFAQ navigate={navigate} />
    </>
  );
}
