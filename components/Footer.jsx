'use client';

import React from 'react';
import { Instagram, Facebook, Twitter, Phone, Mail, MessageCircle } from 'lucide-react';

export default function Footer({ navigate }) {
  return (
    <>
      <footer className="bg-[#0F2A1D] text-[#F7F1E5]/80">
        <div className="container py-14 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          
          {/* Col 1: Brand */}
          <div>
            <div className="font-serif-display text-2xl font-bold text-[#F7F1E5]">
              REAL <span className="text-[#C49A4A]">&amp;</span> NATURAL
            </div>
            <p className="mt-3 text-sm leading-relaxed max-w-xs text-[#F7F1E5]/75">
              Premium, natural and hygienically packed raisins &amp; dry fruits, sourced and packed with care for everyday goodness.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C49A4A] hover:text-white transition"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C49A4A] hover:text-white transition"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C49A4A] hover:text-white transition"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Shop links */}
          <div>
            <h4 className="text-[#F7F1E5] font-semibold mb-3 text-sm tracking-wide uppercase">
              Shop
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => {
                    navigate('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#C49A4A] transition"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate('shop', { category: 'Raisins' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#C49A4A] transition"
                >
                  Natural Raisins
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate('shop', { category: 'Nuts' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#C49A4A] transition"
                >
                  Almonds &amp; Cashews (Nuts)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h4 className="text-[#F7F1E5] font-semibold mb-3 text-sm tracking-wide uppercase">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-[#F7F1E5]/75">
              <li>Free shipping on orders above ₹999</li>
              <li>Hygienic vacuum sealed packaging</li>
              <li>Dispatched within 24-48 hours</li>
              <li>Pan-India courier coverage</li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-[#F7F1E5] font-semibold mb-3 text-sm tracking-wide uppercase">
              Contact
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C49A4A]" />
                <a href="tel:+917745835883" className="hover:text-[#C49A4A] transition">
                  +91 77458 35883
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C49A4A]" />
                <a href="mailto:rohtinikam365@gmail.com" className="hover:text-[#C49A4A] transition">
                  rohtinikam365@gmail.com
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="https://wa.me/917745835883?text=Hi%20Real%20%26%20Natural!"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-4 py-2 text-xs font-semibold shadow hover:bg-[#1EBE5A] transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10">
          <div className="container py-5 text-xs text-center text-[#F7F1E5]/50">
            © {new Date().getFullYear()} Real &amp; Natural. All rights reserved. • Made with care in India.
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Action Button */}
      <a
        href="https://wa.me/917745835883?text=Hi%20Real%20%26%20Natural!%20I%20have%20a%20question."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 h-13 w-13 rounded-full bg-[#25D366] shadow-xl flex items-center justify-center text-white hover:scale-110 transition active:scale-95"
        style={{ width: '52px', height: '52px' }}
        aria-label="Chat on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </>
  );
}
