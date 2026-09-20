'use client';

import React, { useState } from 'react';
import { ChevronDown, MessageCircle, ArrowRight } from 'lucide-react';
import { FAQS } from '@/lib/products';

export default function GalleryAndFAQ({ navigate }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const galleryImages = [
    'https://images.unsplash.com/photo-1642102903918-b97c37955bbf?crop=entropy&cs=srgb&fm=jpg&q=85&w=800',
    'https://images.unsplash.com/photo-1590785069874-a283f2c8d420?crop=entropy&cs=srgb&fm=jpg&q=85&w=800',
    'https://images.unsplash.com/photo-1641291361624-38b69b86b1cf?crop=entropy&cs=srgb&fm=jpg&q=85&w=800',
    'https://images.unsplash.com/photo-1502825751399-28baa9b81efe?crop=entropy&cs=srgb&fm=jpg&q=85&w=800',
    'https://images.unsplash.com/photo-1543158181-1274e5362710?crop=entropy&cs=srgb&fm=jpg&q=85&w=800',
    'https://images.unsplash.com/photo-1600189020840-e9918c25269d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800',
  ];

  return (
    <>
      {/* Gallery Section */}
      <section className="container py-16 sm:py-20">
        <div className="rn-fade-up text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C49A4A] font-bold">
            Gallery
          </span>
          <h2 className="mt-2 font-serif-display text-3xl sm:text-4xl font-bold text-[#173B2A]">
            A Feast for the Senses
          </h2>
          <p className="mt-2 text-sm text-[#6B4432]">
            Naturally sun-ripened, meticulously hand-selected produce.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
          {galleryImages.map((src, i) => (
            <div
              key={i}
              className={`rn-fade-up overflow-hidden rounded-2xl group shadow-sm bg-[#F7F1E5] ${
                i === 0 ? 'md:row-span-2' : ''
              }`}
            >
              <img
                src={src}
                alt={`Real & Natural Gallery ${i + 1}`}
                className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="bg-[#EFE6D2] py-16 sm:py-20">
        <div className="container max-w-3xl">
          <div className="rn-fade-up text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C49A4A] font-bold">
              FAQ
            </span>
            <h2 className="mt-2 font-serif-display text-3xl sm:text-4xl font-bold text-[#173B2A]">
              Questions? Answered.
            </h2>
            <p className="mt-2 text-sm text-[#6B4432]">
              Everything you need to know about our products and shipping.
            </p>
          </div>

          <div className="rn-fade-up mt-10 space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-[#173B2A]/8 overflow-hidden transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-[#173B2A] text-sm sm:text-base hover:text-[#C49A4A] transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 text-[#C49A4A] ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-[#6B4432] leading-relaxed border-t border-[#173B2A]/5 pt-3 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section id="contact" className="bg-[#173B2A] text-[#F7F1E5] py-16 sm:py-20 text-center scroll-mt-20">
        <div className="container max-w-2xl">
          <div className="rn-fade-up">
            <h2 className="font-serif-display text-3xl sm:text-5xl font-bold leading-tight">
              Bring Natural Goodness Home.
            </h2>
            <p className="mt-4 text-[#F7F1E5]/80 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Premium raisins and dry fruits, delivered fresh to your doorstep across India.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <button
                onClick={() => {
                  navigate('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F7F1E5] text-[#173B2A] hover:bg-white px-8 h-12 text-sm font-semibold shadow-lg transition active:scale-95"
              >
                SHOP NOW <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="https://wa.me/917745835883?text=Hi%20Real%20%26%20Natural!%20I%20would%20like%20to%20place%20an%20order."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1EBE5A] text-white px-8 h-12 text-sm font-semibold shadow-lg transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                ORDER ON WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
