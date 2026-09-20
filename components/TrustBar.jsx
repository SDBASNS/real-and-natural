'use client';

import React from 'react';
import { Leaf, ShieldCheck, Package, Truck } from 'lucide-react';

export default function TrustBar() {
  const points = [
    { icon: Leaf, label: '100% Natural' },
    { icon: ShieldCheck, label: 'Quality Checked' },
    { icon: Package, label: 'Hygienically Packed' },
    { icon: Truck, label: 'Fast Delivery' },
  ];

  return (
    <div className="bg-[#173B2A] text-[#F7F1E5] border-y border-[#173B2A]/20">
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
        {points.map((pt, i) => {
          const Icon = pt.icon;
          return (
            <div key={i} className="flex items-center justify-center gap-2.5 text-center">
              <Icon className="w-5 h-5 text-[#C49A4A] shrink-0" />
              <span className="text-xs sm:text-sm font-medium tracking-wide">{pt.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
