'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '@/lib/products';

export default function SearchOverlay({ isOpen, onClose, onSelectProduct }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(query.toLowerCase())
      )
    : PRODUCTS.slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#173B2A]/10 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-[#173B2A]/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#C49A4A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search raisins, kishmish, almonds, dry fruits..."
            className="w-full bg-transparent text-sm sm:text-base text-[#173B2A] placeholder-[#6B4432]/50 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#6B4432]/60 hover:text-[#173B2A]"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs font-semibold px-2.5 py-1 rounded bg-[#173B2A]/5 text-[#6B4432] hover:bg-[#173B2A]/10"
            >
              ESC
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          <div className="text-[11px] font-bold text-[#6B4432]/70 uppercase tracking-wider px-2 mb-2">
            {query.trim() ? `Search Results (${results.length})` : 'Popular Searches'}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-10 text-sm text-[#6B4432]/70">
              No products found matching “{query}”.
            </div>
          ) : (
            results.map((product) => {
              const pack = product.packs[0];
              return (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-[#F7F1E5] cursor-pointer transition group"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover bg-[#F7F1E5] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-[#C49A4A] uppercase">
                      {product.category}
                    </div>
                    <div className="font-semibold text-sm text-[#173B2A] group-hover:text-[#C49A4A] transition truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-[#6B4432]/70 truncate">
                      {product.shortDescription}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-[#173B2A]">
                      ₹{pack.price}
                    </div>
                    <div className="text-[11px] text-[#6B4432]/60">
                      {pack.size}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#173B2A]/30 group-hover:text-[#C49A4A] transition" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
