'use client';

import React from 'react';
import { Sprout, Boxes, ClipboardCheck, Package, Truck } from 'lucide-react';

export default function FarmToHome() {
  const steps = [
    {
      num: 'STEP 1',
      icon: Sprout,
      title: 'Select',
      description: 'Hand-picked from trusted premium vineyards and farms.',
    },
    {
      num: 'STEP 2',
      icon: Boxes,
      title: 'Process',
      description: 'Gently cleaned, sorted, and sun-dried naturally.',
    },
    {
      num: 'STEP 3',
      icon: ClipboardCheck,
      title: 'Quality Check',
      description: 'Multiple grade checks for uniform plumpness and taste.',
    },
    {
      num: 'STEP 4',
      icon: Package,
      title: 'Pack',
      description: 'Sealed in food-grade, airtight resealable pouches.',
    },
    {
      num: 'STEP 5',
      icon: Truck,
      title: 'Deliver',
      description: 'Shipped fresh to your doorstep with express tracking.',
    },
  ];

  return (
    <section id="farm-to-home" className="bg-[#EFE6D2] py-16 sm:py-20 scroll-mt-20">
      <div className="container">
        <div className="rn-fade-up text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C49A4A] font-bold">
            Farm to Home
          </span>
          <h2 className="mt-2 font-serif-display text-3xl sm:text-4xl font-bold text-[#173B2A]">
            From Nature, With Care
          </h2>
          <p className="mt-3 text-[#6B4432]">
            Every pack follows a careful, uncompromising journey before it reaches your home.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="rn-fade-up bg-white rounded-2xl p-5 text-center border border-[#173B2A]/8 hover:shadow-lg transition duration-300 flex flex-col items-center"
              >
                <div className="h-12 w-12 rounded-full bg-[#173B2A] text-[#C49A4A] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold text-[#C49A4A] tracking-wider mb-1">
                  {step.num}
                </div>
                <h3 className="font-serif-display text-lg font-bold text-[#173B2A]">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs text-[#6B4432] leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
