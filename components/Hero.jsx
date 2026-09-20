'use client';

import React from 'react';
import { Leaf, ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';

export default function Hero({ navigate }) {
  return (
    <section className="relative overflow-hidden bg-[#F7F1E5]">
      {/* Subtle background ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#C49A4A]/10 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-96 h-96 rounded-full bg-[#173B2A]/10 blur-3xl" />
      </div>

      <div className="container relative grid lg:grid-cols-2 gap-10 items-center py-14 sm:py-20">
        
        {/* Left Column: Typography & CTAs */}
        <div>
          <div className="rn-fade-up inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#173B2A]/10 px-4 py-1.5 text-xs font-medium text-[#173B2A] mb-6 shadow-sm">
            <Leaf className="w-3.5 h-3.5 text-[#C49A4A]" />
            <span>100% Natural • No Added Sugar</span>
          </div>

          <h1 className="rn-fade-up font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#173B2A] leading-[1.08]">
            Nature’s Sweetness,<br />
            <span className="text-[#C49A4A]">Delivered Pure.</span>
          </h1>

          <p className="rn-fade-up mt-5 text-base sm:text-lg text-[#6B4432] max-w-md leading-relaxed">
            Premium quality raisins carefully selected for natural sweetness, freshness and everyday goodness.
          </p>

          <div className="rn-fade-up mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => {
                navigate('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] px-7 h-12 text-sm font-semibold shadow-lg shadow-[#173B2A]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              SHOP NOW <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('collection');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#173B2A]/25 bg-white/60 hover:bg-white text-[#173B2A] px-7 h-12 text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              EXPLORE COLLECTION
            </button>
          </div>

          <div className="rn-fade-up mt-8 flex items-center gap-4">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#C49A4A] text-[#C49A4A]" />
              ))}
            </div>
            <span className="text-sm font-medium text-[#6B4432]">
              Loved by 10,000+ happy customers
            </span>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase */}
        <div className="rn-fade-up relative">
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-[#173B2A]/25 aspect-[4/5] max-w-md mx-auto border-4 border-white/40">
            <img
              src="https://images.unsplash.com/photo-1642102903918-b97c37955bbf?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
              alt="Premium Golden Raisins"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#173B2A]/30 via-transparent to-transparent" />
          </div>

          {/* Floating Badge 1: Quality Checked */}
          <div className="absolute -left-2 sm:-left-6 top-8 sm:top-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-3 flex items-center gap-2.5 border border-[#173B2A]/5 animate-bounce-slow">
            <div className="h-10 w-10 rounded-full bg-[#173B2A]/10 flex items-center justify-center text-[#173B2A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="pr-1">
              <p className="text-xs font-bold text-[#173B2A] leading-tight">Quality Checked</p>
              <p className="text-[10px] text-[#6B4432]">Every single batch</p>
            </div>
          </div>

          {/* Floating Badge 2: Free Delivery */}
          <div className="absolute -right-2 sm:-right-4 bottom-8 sm:bottom-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-3 flex items-center gap-2.5 border border-[#173B2A]/5">
            <div className="h-10 w-10 rounded-full bg-[#C49A4A]/15 flex items-center justify-center text-[#C49A4A]">
              <Truck className="w-5 h-5" />
            </div>
            <div className="pr-1">
              <p className="text-xs font-bold text-[#173B2A] leading-tight">Free Delivery</p>
              <p className="text-[10px] text-[#6B4432]">On orders above ₹999</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
