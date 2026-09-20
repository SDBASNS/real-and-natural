'use client';

import React from 'react';
import { CheckCircle2, MessageCircle, ArrowRight, Package, MapPin } from 'lucide-react';

export default function SuccessView({ order, navigate }) {
  if (!order) {
    return (
      <div className="container py-20 text-center">
        <p className="text-sm text-[#6B4432]">No active order found.</p>
        <button
          onClick={() => navigate('home')}
          className="mt-4 px-6 py-2 rounded-full bg-[#173B2A] text-white text-xs font-semibold"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const waTrackLink = `https://wa.me/917745835883?text=${encodeURIComponent(
    `Hi Real & Natural! I would like an update on my Order #${order.id}.`
  )}`;

  return (
    <div className="container py-16 sm:py-24 max-w-2xl mx-auto text-center">
      <div className="rn-fade-up">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] text-[#C49A4A] font-bold">
          Order Confirmed
        </span>

        <h1 className="mt-2 font-serif-display text-3xl sm:text-4xl font-bold text-[#173B2A]">
          Thank You for Your Order!
        </h1>

        <p className="mt-3 text-sm sm:text-base text-[#6B4432] max-w-md mx-auto leading-relaxed">
          Your order has been placed successfully and is being freshly packed at our warehouse.
        </p>

        {/* Order Reference Pill */}
        <div className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#173B2A]/15 shadow-sm text-sm font-semibold text-[#173B2A]">
          <span>Order ID:</span>
          <span className="text-[#C49A4A] font-mono font-bold tracking-wider">
            {order.id}
          </span>
        </div>

        {/* Delivery & Items Summary Card */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-[#173B2A]/10 shadow-sm text-left space-y-5">
          <div className="flex items-start gap-3 pb-4 border-b border-[#173B2A]/10">
            <MapPin className="w-5 h-5 text-[#C49A4A] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-[#6B4432]">
              <div className="font-bold text-[#173B2A] text-sm sm:text-base">
                {order.customer.name} • {order.customer.phone}
              </div>
              <div className="mt-1">
                {order.customer.address}, {order.customer.city}, {order.customer.state} - {order.customer.pincode}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-[#173B2A] uppercase tracking-wider">
              Items Ordered
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs sm:text-sm text-[#6B4432]">
                <span>
                  {item.name} ({item.pack}) × {item.quantity}
                </span>
                <span className="font-semibold text-[#173B2A]">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#173B2A]/10 flex justify-between items-center">
            <div>
              <span className="text-xs text-[#6B4432]">Payment: </span>
              <span className="text-xs font-bold text-[#173B2A]">
                {order.paymentMethod === 'COD'
                  ? 'Cash on Delivery'
                  : order.paymentMethod === 'Direct UPI'
                  ? 'Direct UPI (QR / Apps)'
                  : 'Online Payment (Razorpay)'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6B4432] block">Total Amount</span>
              <span className="text-xl font-bold text-[#173B2A]">
                ₹{order.total}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <a
            href={waTrackLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1EBE5A] text-white px-7 h-12 text-sm font-semibold shadow-lg transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            Track on WhatsApp
          </a>

          <button
            onClick={() => {
              navigate('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] px-7 h-12 text-sm font-semibold shadow-lg transition active:scale-95"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
