'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, ArrowRight, Truck, CheckCircle2, MapPin, Loader2, Sparkles } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/products';
import { STATE_CITIES } from '@/lib/locations';

export default function CheckoutView({ cart, onOrderPlaced, navigate }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedBadge, setDetectedBadge] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const savings = mrpTotal - subtotal;
  const shippingFee = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shippingFee;

  const currentSuggestedCities = (form.state && STATE_CITIES[form.state]) ? STATE_CITIES[form.state] : [];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-detect City and State when 6-digit Pincode is entered
  const handlePincodeChange = async (val) => {
    const cleanVal = val.replace(/\D/g, '').slice(0, 6);
    handleChange('pincode', cleanVal);

    if (cleanVal.length === 6) {
      setIsDetecting(true);
      setDetectedBadge(null);
      try {
        const res = await fetch(`/api/pincode?pincode=${cleanVal}`);
        if (res.ok) {
          const data = await res.json();
          if (data.city || data.state) {
            setForm((prev) => ({
              ...prev,
              city: data.city || prev.city,
              state: data.state || prev.state,
            }));
            setDetectedBadge(`${data.city ? data.city + ', ' : ''}${data.state}`);
            toast.success(`Detected: ${data.city ? data.city + ', ' : ''}${data.state}`);
          }
        }
      } catch (err) {
        console.warn('Pincode lookup error:', err);
      } finally {
        setIsDetecting(false);
      }
    } else {
      setDetectedBadge(null);
    }
  };

  // When State changes, if city is empty or not in suggested list, optionally suggest or let user choose
  const handleStateChange = (newState) => {
    setForm((prev) => {
      // If current city is not related, keep it or allow user to pick
      return {
        ...prev,
        state: newState,
      };
    });
  };

  const handleSelectCityChip = (cityName) => {
    handleChange('city', cityName);
  };

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your full name';
    if (!/^\d{10}$/.test(form.phone.trim())) {
      return 'Please enter a valid 10-digit mobile number';
    }
    if (!form.address.trim()) return 'Please enter your complete delivery address';
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      return 'Please enter a valid 6-digit pincode';
    }
    if (!form.state.trim()) return 'Please select your state';
    if (!form.city.trim()) return 'Please enter your city';
    return null;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const saveOrderToBackend = async (payload) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to place order');
    }
    return data.order;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      payment: paymentMethod,
      items: cart,
      subtotal,
      discount: savings,
      shipping: shippingFee,
      total,
    };

    // 1. CASH ON DELIVERY
    if (paymentMethod === 'COD') {
      try {
        const order = await saveOrderToBackend(payload);
        toast.success('Order placed successfully!');
        onOrderPlaced(order);
      } catch (err) {
        toast.error(err.message || 'Something went wrong while placing your order.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 2. DIRECT UPI / ONLINE VIA RAZORPAY
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay payment SDK. Please check your internet connection.');
      }

      // Create Razorpay Order
      const rzpRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          receipt: `rcpt_${Date.now()}`,
          notes: {
            customer_name: form.name,
            phone: form.phone,
          },
        }),
      });

      const rzpOrder = await rzpRes.json();
      if (!rzpRes.ok) {
        throw new Error(rzpOrder.error || 'Failed to initialize payment gateway');
      }

      // If simulated/mock mode (placeholder keys)
      if (rzpOrder.isMock) {
        toast.info(rzpOrder.message);
        const order = await saveOrderToBackend({
          ...payload,
          paymentId: rzpOrder.id,
          paymentStatus: 'Paid (Simulated)',
        });
        toast.success('Payment simulated successfully! Order confirmed.');
        onOrderPlaced(order);
        setIsSubmitting(false);
        return;
      }

      // Open Razorpay Popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || 'INR',
        name: 'Real & Natural',
        description: 'Premium Natural Raisins & Dry Fruits',
        order_id: rzpOrder.id,
        prefill: {
          name: form.name,
          contact: form.phone,
          email: form.email || '',
        },
        theme: {
          color: '#173B2A',
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            toast.info('Payment was cancelled');
          },
        },
        handler: async (response) => {
          try {
            // Verify payment signature
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();

            if (!verifyData.verified) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            // Save verified order
            const order = await saveOrderToBackend({
              ...payload,
              paymentId: response.razorpay_payment_id,
              paymentOrderId: response.razorpay_order_id,
              paymentStatus: 'Paid',
            });

            toast.success('Payment successful! Order placed.');
            onOrderPlaced(order);
          } catch (verifyErr) {
            toast.error(verifyErr.message || 'Payment verification failed');
          } finally {
            setIsSubmitting(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setIsSubmitting(false);
        toast.error(resp.error?.description || 'Payment transaction failed');
      });
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Payment gateway failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12 sm:py-16 max-w-5xl">
      <div className="mb-8">
        <button
          onClick={() => navigate('cart')}
          className="text-xs sm:text-sm font-semibold text-[#173B2A] hover:text-[#C49A4A] transition"
        >
          ← Back to Shopping Cart
        </button>
        <h1 className="mt-2 font-serif-display text-3xl sm:text-4xl font-bold text-[#173B2A]">
          Complete Your Order
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* Shipping Address Box */}
          <div className="bg-white rounded-2xl p-6 border border-[#173B2A]/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#173B2A]/10">
              <h2 className="font-serif-display text-xl font-bold text-[#173B2A] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#C49A4A]" />
                Delivery Address
              </h2>
              <span className="text-[11px] text-[#6B4432] font-medium hidden sm:inline">
                Pan-India Express Shipping
              </span>
            </div>

            {/* Name & Phone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#173B2A] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#173B2A]/20 text-sm text-[#173B2A] focus:outline-none focus:border-[#173B2A] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173B2A] mb-1">
                  Mobile Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g. 7745835883"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#173B2A]/20 text-sm text-[#173B2A] focus:outline-none focus:border-[#173B2A] bg-white"
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-[#173B2A] mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="For instant invoice & tracking confirmation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#173B2A]/20 text-sm text-[#173B2A] focus:outline-none focus:border-[#173B2A] bg-white"
              />
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-xs font-semibold text-[#173B2A] mb-1">
                Flat / House No., Apartment, Street, Landmark *
              </label>
              <textarea
                rows={2}
                required
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Complete street address for smooth delivery"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#173B2A]/20 text-sm text-[#173B2A] focus:outline-none focus:border-[#173B2A] bg-white"
              />
            </div>

            {/* Pincode, State & City with Auto-fill Integration */}
            <div className="pt-2 border-t border-[#173B2A]/10 space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                
                {/* 1. PINCODE */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#173B2A]">
                      Pincode (6 Digits) *
                    </label>
                    {isDetecting && (
                      <span className="text-[10px] text-[#C49A4A] flex items-center gap-1 font-semibold animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> Detecting...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={form.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="e.g. 411001"
                      className="w-full px-3.5 py-2.5 pr-8 rounded-xl border border-[#173B2A]/20 text-sm text-[#173B2A] focus:outline-none focus:border-[#173B2A] font-mono bg-white"
                    />
                    <MapPin className="w-4 h-4 text-[#C49A4A] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* 2. STATE */}
                <div>
                  <label className="block text-xs font-semibold text-[#173B2A] mb-1">
                    State *
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#173B2A]/20 text-sm text-[#173B2A] focus:outline-none focus:border-[#173B2A] bg-white cursor-pointer"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. CITY */}
                <div>
                  <label className="block text-xs font-semibold text-[#173B2A] mb-1">
                    City / District *
                  </label>
                  <input
                    type="text"
                    required
                    list="city-suggestions"
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#173B2A]/20 text-sm text-[#173B2A] focus:outline-none focus:border-[#173B2A] bg-white"
                  />
                  <datalist id="city-suggestions">
                    {currentSuggestedCities.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Auto-detected notification badge */}
              {detectedBadge && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Auto-detected location: <strong>{detectedBadge}</strong> based on pincode <strong>{form.pincode}</strong>.
                  </span>
                </div>
              )}

              {/* Popular cities in selected State quick-chips */}
              {currentSuggestedCities.length > 0 && (
                <div className="pt-1">
                  <div className="text-[11px] font-semibold text-[#6B4432] mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#C49A4A]" /> Popular in {form.state}:
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {currentSuggestedCities.slice(0, 10).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleSelectCityChip(c)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border transition ${
                          form.city.toLowerCase() === c.toLowerCase()
                            ? 'bg-[#173B2A] text-white border-[#173B2A]'
                            : 'bg-[#F7F1E5] text-[#173B2A] border-[#173B2A]/15 hover:border-[#173B2A]/40'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl p-6 border border-[#173B2A]/10 shadow-sm space-y-4">
            <h2 className="font-serif-display text-xl font-bold text-[#173B2A] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C49A4A]" />
              Payment Mode
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'COD'
                    ? 'border-[#173B2A] bg-[#173B2A]/5'
                    : 'border-[#173B2A]/15 hover:border-[#173B2A]/30'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-0.5 accent-[#173B2A]"
                />
                <div>
                  <div className="font-semibold text-sm text-[#173B2A]">
                    Cash on Delivery (COD)
                  </div>
                  <div className="text-xs text-[#6B4432] mt-0.5">
                    Pay with cash or UPI on package delivery
                  </div>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'UPI'
                    ? 'border-[#173B2A] bg-[#173B2A]/5'
                    : 'border-[#173B2A]/15 hover:border-[#173B2A]/30'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="mt-0.5 accent-[#173B2A]"
                />
                <div>
                  <div className="font-semibold text-sm text-[#173B2A]">
                    Direct UPI / Online
                  </div>
                  <div className="text-xs text-[#6B4432] mt-0.5">
                    Pay via GPay, PhonePe, Paytm, or UPI ID
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] h-14 text-base font-semibold shadow-xl shadow-[#173B2A]/25 transition active:scale-[0.99] disabled:opacity-75"
          >
            {isSubmitting ? (
              <span>Placing Your Order...</span>
            ) : (
              <>
                Place Order (₹{total}) <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-2xl p-6 border border-[#173B2A]/10 shadow-sm sticky top-24">
          <h3 className="font-serif-display text-lg font-bold text-[#173B2A] mb-4">
            Items in Your Order ({cart.length})
          </h3>

          <div className="divide-y divide-[#173B2A]/10 max-h-60 overflow-y-auto pr-1 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="pr-2 min-w-0">
                  <div className="font-semibold text-[#173B2A] truncate">
                    {item.name}
                  </div>
                  <div className="text-[#6B4432]">
                    {item.pack} × {item.quantity}
                  </div>
                </div>
                <div className="font-bold text-[#173B2A] shrink-0">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-[#6B4432] pt-4 border-t border-[#173B2A]/10">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#173B2A]">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-700 font-bold uppercase">
                    Free
                  </span>
                ) : (
                  `₹${shippingFee}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#173B2A] pt-2 border-t border-[#173B2A]/10">
              <span>Total Payable</span>
              <span>₹{total}</span>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-[#F7F1E5] text-[11px] text-[#6B4432] space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[#173B2A]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C49A4A]" />
              Safe &amp; Fresh Guaranteed
            </div>
            <div>
              Orders are packaged in sanitary, vacuum-sealed bags and dispatched via express courier with real-time tracking.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
