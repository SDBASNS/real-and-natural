'use client';

import React from 'react';
import { Leaf, ShieldCheck, Package, Truck } from 'lucide-react';

export default function WhyUs() {
  const cards = [
    {
      icon: Leaf,
      title: 'Natural Selection',
      description: 'Carefully selected for natural sweetness and premium quality.',
    },
    {
      icon: ShieldCheck,
      title: 'Quality Checked',
      description: 'Every batch is sorted and inspected before it reaches you.',
    },
    {
      icon: Package,
      title: 'Hygienic Packaging',
      description: 'Sealed with care to preserve freshness and purity.',
    },
    {
      icon: Truck,
      title: 'Delivered Fresh',
      description: 'Fast, reliable delivery across India with care.',
    },
  ];

  return (
    <section id="why-us" className="container py-16 sm:py-20 scroll-mt-20">
      <div className="rn-fade-up text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C49A4A] font-bold">
          Why Real &amp; Natural?
        </span>
        <h2 className="mt-2 font-serif-display text-3xl sm:text-4xl font-bold text-[#173B2A]">
          Goodness You Can Trust
        </h2>
        <p className="mt-3 text-[#6B4432]">
          We take pride in bringing you unadulterated, wholesome goodness straight from nature’s lap.
        </p>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="rn-fade-up bg-white rounded-2xl border border-[#173B2A]/8 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center"
            >
              <div className="h-14 w-14 rounded-2xl bg-[#173B2A]/5 flex items-center justify-center text-[#173B2A] mb-4">
                <Icon className="w-7 h-7 text-[#173B2A]" />
              </div>
              <h3 className="font-serif-display text-lg font-bold text-[#173B2A]">
                {card.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#6B4432] leading-relaxed">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
