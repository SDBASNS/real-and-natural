'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  ArrowRight, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Loader2, 
  Sparkles,
  Smartphone,
  CreditCard,
  Banknote,
  Copy,
  Check,
  QrCode
} from 'lucide-react';
import { INDIAN_STATES } from '@/lib/products';
import { STATE_CITIES } from '@/lib/locations';

export default function CheckoutView({ cart, customer, onOpenAuth, onOrderPlaced, navigate }) {
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.rawPhone || (customer?.phone ? customer.phone.replace('+91', '') : ''),
    email: customer?.email || '',
    address: '',
    city: customer?.city || '',
    state: 'Maharashtra',
    pincode: '',
  });

  // Sync when customer logs in
  useEffect(() => {
    if (customer) {
      setForm((prev) => ({
        ...prev,
        name: customer.name || prev.name,
        phone: customer.rawPhone || (customer.phone ? customer.phone.replace('+91', '') : prev.phone),
        email: customer.email || prev.email,
        city: customer.city || prev.city,
      }));
    }
  }, [customer]);

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedBadge, setDetectedBadge] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const savings = mrpTotal - subtotal;
  const shippingFee = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shippingFee;

  const [upiRef, setUpiRef] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || '7745835883@ybl';
  const upiPayLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent('Real and Natural')}&am=${total}&cu=INR&tn=${encodeURIComponent('Real and Natural Order')}`;
  const upiQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=1&data=${encodeURIComponent(upiPayLink)}`;

  const handleCopyUpi = () => {
    try {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      toast.success(`Copied UPI ID: ${upiId}`);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch (_) {
      toast.info(`UPI ID: ${upiId}`);
    }
  };

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
        const order = await saveOrderToBackend({
          ...payload,
          payment: 'COD',
          paymentStatus: 'Pending',
        });
        toast.success('Order placed successfully with Cash on Delivery!');
        onOrderPlaced(order);
      } catch (err) {
        toast.error(err.message || 'Something went wrong while placing your order.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 2. DIRECT UPI (QR Code & UPI Apps)
    if (paymentMethod === 'UPI') {
      try {
        const order = await saveOrderToBackend({
          ...payload,
          payment: 'Direct UPI',
          paymentStatus: 'Pending Verification',
          notes: upiRef.trim() ? `UPI UTR / Ref: ${upiRef.trim()}` : 'Direct UPI QR Scan & Pay',
        });
        toast.success('UPI Order placed successfully! We will confirm your payment shortly.');
        onOrderPlaced(order);
      } catch (err) {
        toast.error(err.message || 'Something went wrong while placing your order.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 3. ONLINE PAYMENT GATEWAY (Razorpay: Cards, Netbanking, Wallets, UPI)
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

      // Open Razorpay Popup with explicit UPI sequence
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
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI',
                instruments: [{ method: 'upi' }],
              },
              other: {
                name: 'Cards, Netbanking & Wallets',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' },
                ],
              },
            },
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: true,
            },
          },
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
          {/* Customer Login / Autofill Banner */}
          {customer ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Logged in as <strong>{customer.name}</strong> ({customer.phone || customer.email})
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full hidden sm:inline">
                Details Auto-filled
              </span>
            </div>
          ) : (
            <div className="p-4 bg-white border border-[#173B2A]/15 rounded-2xl flex items-center justify-between text-xs shadow-sm">
              <div>
                <div className="font-semibold text-[#173B2A] text-sm">
                  Already have an account?
                </div>
                <div className="text-[#6B4432] mt-0.5">
                  Log in for 1-click checkout and instant order tracking.
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-full bg-[#173B2A] text-[#F7F1E5] font-semibold text-xs hover:bg-[#0F2A1D] transition cursor-pointer shrink-0 ml-3"
              >
                Log In
              </button>
            </div>
          )}

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
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-xl font-bold text-[#173B2A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C49A4A]" />
                Payment Method
              </h2>
              <span className="text-[11px] font-medium text-[#173B2A]/70 bg-[#173B2A]/5 px-2.5 py-1 rounded-full">
                🔒 100% Safe &amp; Verified
              </span>
            </div>

            {/* 3 Payment Options */}
            <div className="grid sm:grid-cols-3 gap-3">
              {/* Option 1: Direct UPI */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-3 relative ${
                  paymentMethod === 'UPI'
                    ? 'border-[#173B2A] bg-[#173B2A]/5 ring-1 ring-[#173B2A]'
                    : 'border-[#173B2A]/15 hover:border-[#173B2A]/30 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#173B2A]/10 flex items-center justify-center text-[#173B2A]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="mt-1 accent-[#173B2A]"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm text-[#173B2A]">
                      UPI / QR Code
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#C49A4A]/20 text-[#845E1B]">
                      Fastest
                    </span>
                  </div>
                  <div className="text-xs text-[#6B4432] mt-1 leading-snug">
                    GPay, PhonePe, Paytm, BHIM &amp; QR Scan
                  </div>
                </div>
              </label>

              {/* Option 2: Cards / Netbanking */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-3 relative ${
                  paymentMethod === 'ONLINE'
                    ? 'border-[#173B2A] bg-[#173B2A]/5 ring-1 ring-[#173B2A]'
                    : 'border-[#173B2A]/15 hover:border-[#173B2A]/30 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#173B2A]/10 flex items-center justify-center text-[#173B2A]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={() => setPaymentMethod('ONLINE')}
                    className="mt-1 accent-[#173B2A]"
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#173B2A]">
                    Cards &amp; Netbanking
                  </div>
                  <div className="text-xs text-[#6B4432] mt-1 leading-snug">
                    Debit / Credit Cards &amp; Netbanking
                  </div>
                </div>
              </label>

              {/* Option 3: COD */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-3 relative ${
                  paymentMethod === 'COD'
                    ? 'border-[#173B2A] bg-[#173B2A]/5 ring-1 ring-[#173B2A]'
                    : 'border-[#173B2A]/15 hover:border-[#173B2A]/30 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#173B2A]/10 flex items-center justify-center text-[#173B2A]">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 accent-[#173B2A]"
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#173B2A]">
                    Cash on Delivery
                  </div>
                  <div className="text-xs text-[#6B4432] mt-1 leading-snug">
                    Pay with cash or UPI upon package delivery
                  </div>
                </div>
              </label>
            </div>

            {/* Direct UPI Interactive Payment Box */}
            {paymentMethod === 'UPI' && (
              <div className="mt-4 p-5 rounded-2xl bg-gradient-to-b from-[#F7F1E5]/80 to-[#F7F1E5]/30 border border-[#C49A4A]/30 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* QR Code Container */}
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#173B2A]/15 shrink-0 text-center">
                    <img
                      src={upiQrCodeUrl}
                      alt="Scan to Pay via UPI"
                      width={160}
                      height={160}
                      className="rounded-lg mx-auto block"
                    />
                    <div className="text-[11px] font-semibold text-[#173B2A] mt-2 flex items-center justify-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-[#C49A4A]" /> Scan with Any UPI App
                    </div>
                  </div>

                  {/* UPI Details & Deep Link */}
                  <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                    <div>
                      <span className="text-[11px] font-semibold text-[#6B4432] uppercase tracking-wider">
                        Amount to Pay
                      </span>
                      <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[#173B2A]">
                        ₹{total}
                      </div>
                    </div>

                    {/* Payee UPI ID Pill */}
                    <div>
                      <div className="text-xs text-[#6B4432] mb-1 font-medium">
                        Payee UPI ID:
                      </div>
                      <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#173B2A]/15 shadow-sm">
                        <span className="font-mono text-sm font-semibold text-[#173B2A]">
                          {upiId}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-2 py-0.5 rounded-lg text-[#173B2A] hover:bg-[#173B2A]/10 transition flex items-center gap-1 text-xs font-semibold"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#C49A4A]" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mobile UPI Deep Link */}
                    <div className="pt-1">
                      <a
                        href={upiPayLink}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#173B2A] text-[#F7F1E5] text-xs font-semibold hover:bg-[#0F2A1D] transition shadow-md w-full sm:w-auto"
                      >
                        <Smartphone className="w-4 h-4 text-[#C49A4A]" />
                        Open UPI App on Mobile (GPay / PhonePe / Paytm)
                      </a>
                    </div>
                  </div>
                </div>

                {/* Optional UTR / Reference No */}
                <div className="pt-3 border-t border-[#173B2A]/10">
                  <label className="block text-xs font-semibold text-[#173B2A] mb-1">
                    UPI Transaction / UTR Ref No. <span className="font-normal text-[#6B4432]">(Optional, for instant verification)</span>
                  </label>
                  <input
                    type="text"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    placeholder="e.g. 428192849182 (12-digit UTR from Google Pay / PhonePe)"
                    className="w-full h-10 px-3 rounded-lg border border-[#173B2A]/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#173B2A]/30 font-mono"
                  />
                  <p className="text-[11px] text-[#6B4432] mt-1.5">
                    💡 After completing payment in your UPI app, click <strong>"Confirm UPI Order"</strong> below.
                  </p>
                </div>
              </div>
            )}

            {/* Online Gateway Info */}
            {paymentMethod === 'ONLINE' && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#173B2A]/5 border border-[#173B2A]/15 text-xs text-[#173B2A] flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-[#C49A4A] shrink-0" />
                <span>
                  Secure online payment via Razorpay. Supports all major Visa, Mastercard, RuPay cards, Netbanking (50+ banks), and digital wallets.
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] h-14 text-base font-semibold shadow-xl shadow-[#173B2A]/25 transition active:scale-[0.99] disabled:opacity-75 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Placing Your Order...</span>
            ) : paymentMethod === 'UPI' ? (
              <>
                Confirm UPI Order (₹{total}) <ArrowRight className="w-5 h-5 ml-1" />
              </>
            ) : paymentMethod === 'ONLINE' ? (
              <>
                Proceed to Pay Online (₹{total}) <ArrowRight className="w-5 h-5 ml-1" />
              </>
            ) : (
              <>
                Place Order with COD (₹{total}) <ArrowRight className="w-5 h-5 ml-1" />
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
