'use client';

import React from 'react';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, MessageCircle, Truck } from 'lucide-react';

export default function CartView({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  navigate,
  onProceedToCheckout,
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const savings = mrpTotal - subtotal;
  const freeShippingThreshold = 999;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping || cart.length === 0 ? 0 : 49;
  const grandTotal = subtotal + shippingFee;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Generate WhatsApp message for instant order
  const generateWhatsAppLink = () => {
    const lines = [
      'Hello Real & Natural!',
      'I would like to place an order for:',
      ...cart.map(
        (i) => `• ${i.name} (${i.pack}) x ${i.quantity} = ₹${i.price * i.quantity}`
      ),
      `Total: ₹${grandTotal}`,
    ];
    return `https://wa.me/917745835883?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  if (cart.length === 0) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-[#173B2A]/10 text-[#173B2A] flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-10 h-10 text-[#C49A4A]" />
        </div>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#173B2A]">
          Your Cart is Empty
        </h2>
        <p className="mt-3 text-sm text-[#6B4432] leading-relaxed">
          Looks like you haven’t added any natural goodies to your bag yet.
        </p>
        <button
          onClick={() => {
            navigate('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] px-8 h-12 text-sm font-semibold shadow-lg transition active:scale-95"
        >
          Start Shopping <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="container py-12 sm:py-16 max-w-5xl">
      <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#173B2A] mb-8">
        Your Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
      </h1>

      {/* Free Shipping Progress Meter */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#173B2A]/10 shadow-sm mb-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#173B2A]">
          <Truck className="w-4 h-4 text-[#C49A4A] shrink-0" />
          {isFreeShipping ? (
            <span className="text-emerald-800">
              🎉 Congratulations! You have unlocked <strong>FREE Delivery</strong> across India!
            </span>
          ) : (
            <span>
              Add <strong className="text-[#C49A4A]">₹{freeShippingThreshold - subtotal}</strong> more for <strong>FREE Delivery</strong> (Above ₹999)
            </span>
          )}
        </div>
        <div className="mt-3 w-full bg-[#F7F1E5] h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isFreeShipping ? 'bg-emerald-600' : 'bg-[#C49A4A]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#173B2A]/10 shadow-sm flex items-center gap-4 sm:gap-6"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-[#F7F1E5] shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-serif-display font-bold text-base sm:text-lg text-[#173B2A] truncate">
                  {item.name}
                </h3>
                <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#173B2A]/10 text-[#173B2A] mt-1">
                  {item.pack}
                </span>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-bold text-[#173B2A]">
                    ₹{item.price}
                  </span>
                  <span className="text-xs text-[#6B4432]/60 line-through">
                    ₹{item.mrp}
                  </span>
                </div>
              </div>

              {/* Quantity Stepper & Subtotal */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="flex items-center rounded-full border border-[#173B2A]/20 bg-white">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 hover:text-[#C49A4A] transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-[#173B2A]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 hover:text-[#C49A4A] transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm sm:text-base font-bold text-[#173B2A]">
                    ₹{item.price * item.quantity}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-[#6B4432]/60 hover:text-red-600 transition p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <button
              onClick={() => {
                navigate('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs sm:text-sm font-semibold text-[#173B2A] hover:text-[#C49A4A] transition"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-2xl p-6 border border-[#173B2A]/10 shadow-sm sticky top-24">
          <h2 className="font-serif-display text-xl font-bold text-[#173B2A] mb-4">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm text-[#6B4432] pb-4 border-b border-[#173B2A]/10">
            <div className="flex justify-between">
              <span>Items Total (MRP)</span>
              <span>₹{mrpTotal}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Product Savings</span>
                <span>- ₹{savings}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#173B2A]">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-700 font-semibold uppercase text-xs">
                    Free
                  </span>
                ) : (
                  `₹${shippingFee}`
                )}
              </span>
            </div>
          </div>

          <div className="pt-4 pb-6 flex justify-between items-baseline text-lg font-bold text-[#173B2A]">
            <span>Total Amount</span>
            <span className="text-2xl text-[#173B2A]">₹{grandTotal}</span>
          </div>

          <div className="space-y-3">
            <button
              onClick={onProceedToCheckout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] h-12 text-sm font-semibold shadow-lg shadow-[#173B2A]/20 transition active:scale-95"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1EBE5A] text-white h-11 text-xs font-semibold shadow transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              Order on WhatsApp
            </a>
          </div>

          <div className="mt-5 text-center text-[11px] text-[#6B4432]/70 leading-normal">
            🛡️ 100% Secure Checkout • Hygienically Packed • Authentic Produce
          </div>
        </div>

      </div>
    </div>
  );
}
