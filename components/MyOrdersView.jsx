'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  MessageCircle, 
  ArrowRight, 
  RefreshCw, 
  ChevronRight, 
  ShoppingBag,
  Printer,
  ShieldCheck,
  User,
  AlertCircle
} from 'lucide-react';

export default function MyOrdersView({ customer, onOpenAuth, onAddToCart, navigate }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);

  // Auto-fetch orders if customer is logged in
  useEffect(() => {
    if (customer?.rawPhone || customer?.phone || customer?.email) {
      fetchCustomerOrders({
        phone: customer.rawPhone || customer.phone?.replace('+91', ''),
        email: customer.email,
      });
    }
  }, [customer]);

  const fetchCustomerOrders = async ({ phone, email, orderId }) => {
    setIsLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (phone) params.append('phone', phone);
      if (email) params.append('email', email);
      if (orderId) params.append('orderId', orderId);

      const res = await fetch(`/api/customer/orders?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.error || 'Failed to find orders');
        setOrders([]);
      }
    } catch (err) {
      console.error('Error loading customer orders:', err);
      toast.error('Network error loading orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      toast.error('Please enter a mobile number or Order ID');
      return;
    }

    if (q.toUpperCase().startsWith('RN-') || q.length === 6) {
      // Order ID search
      fetchCustomerOrders({ orderId: q });
    } else if (/^\d{10}$/.test(q.replace(/\D/g, '').slice(-10))) {
      // 10-digit Phone search
      fetchCustomerOrders({ phone: q.replace(/\D/g, '').slice(-10) });
    } else if (q.includes('@')) {
      // Email search
      fetchCustomerOrders({ email: q });
    } else {
      fetchCustomerOrders({ phone: q, orderId: q });
    }
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((item) => {
      onAddToCart(item);
    });
    toast.success(`Added ${order.items.length} item(s) to your cart!`);
    navigate('cart');
  };

  const getStatusStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'shipped') return 2;
    if (s === 'confirmed') return 1;
    return 0; // 'pending'
  };

  const statusSteps = [
    { label: 'Order Placed', desc: 'Order received & logged' },
    { label: 'Confirmed & Packed', desc: 'Hygienically vacuum sealed' },
    { label: 'Shipped / In Transit', desc: 'Handed to courier partner' },
    { label: 'Delivered', desc: 'Arrived at your doorstep' },
  ];

  return (
    <div className="container py-8 sm:py-14 max-w-5xl">
      {/* Header Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#C49A4A] font-bold mb-1">
            Customer Dashboard
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#173B2A]">
            My Orders &amp; Tracking
          </h1>
        </div>

        {customer ? (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#173B2A]/10 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-[#173B2A]/10 text-[#173B2A] flex items-center justify-center font-bold text-sm">
              {customer.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-xs">
              <div className="font-semibold text-[#173B2A]">{customer.name}</div>
              <div className="text-[#6B4432]/80">{customer.phone || customer.email}</div>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] text-xs font-semibold shadow-sm transition"
          >
            <User className="w-4 h-4" />
            <span>Login for One-Tap Orders</span>
          </button>
        )}
      </div>

      {/* Guest or Alternate Order Tracking Lookup Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#173B2A]/10 shadow-sm mb-8">
        <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#173B2A]/40 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Track by 10-digit Mobile Number or Order ID (e.g. RN-100001)..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#173B2A]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#173B2A]/30"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="h-11 px-6 rounded-xl bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Find Orders</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {!customer && (
          <p className="text-[11px] text-[#6B4432] mt-2.5">
            💡 Tip:{' '}
            <button
              type="button"
              onClick={onOpenAuth}
              className="text-[#173B2A] font-semibold underline underline-offset-2 hover:text-[#C49A4A]"
            >
              Log in to your account
            </button>{' '}
            to view all your orders automatically without searching each time.
          </p>
        )}
      </div>

      {/* Orders List Section */}
      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#173B2A]/10 shadow-sm">
          <RefreshCw className="w-8 h-8 text-[#C49A4A] animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#173B2A]">Loading your orders...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = getStatusStepIndex(order.status);
            const waTrackLink = `https://wa.me/917745835883?text=${encodeURIComponent(
              `Hi Real & Natural! I would like a delivery update for my Order #${order.id}.`
            )}`;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#173B2A]/10 shadow-sm overflow-hidden transition hover:shadow-md"
              >
                {/* Order Top Bar */}
                <div className="bg-[#F7F1E5]/70 p-4 sm:p-5 border-b border-[#173B2A]/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#173B2A]/10 text-[#173B2A] flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm sm:text-base text-[#173B2A]">
                          {order.id}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.status === 'Shipped'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : order.status === 'Confirmed'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6B4432]/80 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-[#6B4432]">Total Amount</div>
                    <div className="font-serif-display text-lg sm:text-xl font-bold text-[#173B2A]">
                      ₹{order.total}
                    </div>
                    <div className="text-[10px] text-[#6B4432]/80">
                      Paid via: <strong className="text-[#173B2A]">{order.paymentMethod}</strong>
                    </div>
                  </div>
                </div>

                {/* Live Stepper Tracker */}
                <div className="p-4 sm:p-6 border-b border-[#173B2A]/10 bg-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#6B4432] mb-4">
                    Delivery Status
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                    {statusSteps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition ${
                            isCurrent
                              ? 'border-[#173B2A] bg-[#173B2A]/5'
                              : isCompleted
                              ? 'border-emerald-200 bg-emerald-50/50'
                              : 'border-[#173B2A]/10 opacity-50 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-[#6B4432]/40 shrink-0" />
                            )}
                            <span className="font-semibold text-xs text-[#173B2A]">
                              {step.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#6B4432] leading-tight">
                            {step.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items in Order & Delivery Address */}
                <div className="p-4 sm:p-6 grid md:grid-cols-3 gap-6">
                  {/* Items Column */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#6B4432]">
                      Items Ordered ({order.items?.length || 0})
                    </div>
                    <div className="divide-y divide-[#173B2A]/10 max-h-48 overflow-y-auto pr-1">
                      {order.items?.map((item, i) => (
                        <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-[#173B2A]">{item.name}</div>
                            <div className="text-[#6B4432]">
                              Pack: {item.pack} • Qty: {item.quantity}
                            </div>
                          </div>
                          <div className="font-bold text-[#173B2A]">
                            ₹{item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address Column */}
                  <div className="bg-[#F7F1E5]/40 p-4 rounded-xl border border-[#173B2A]/10 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B4432]">
                      <MapPin className="w-3.5 h-3.5 text-[#C49A4A]" /> Delivery Address
                    </div>
                    <div className="font-semibold text-[#173B2A]">
                      {order.customer?.name}
                    </div>
                    <div className="text-[#6B4432] leading-relaxed">
                      {order.customer?.address}, {order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}
                    </div>
                    <div className="text-[#6B4432] pt-1">
                      📱 Phone: <span className="font-mono text-[#173B2A]">{order.customer?.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Order Card Actions */}
                <div className="bg-[#F7F1E5]/50 px-4 sm:px-6 py-3 border-t border-[#173B2A]/10 flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={waTrackLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 px-3.5 py-1.5 rounded-full transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Track on WhatsApp</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#173B2A] bg-white border border-[#173B2A]/20 hover:bg-[#173B2A]/5 px-3.5 py-1.5 rounded-full transition cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C49A4A]" />
                      <span>Buy Again</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#173B2A] bg-white border border-[#173B2A]/20 hover:bg-[#173B2A]/5 px-3.5 py-1.5 rounded-full transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#6B4432]" />
                      <span>Print Receipt</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : searched ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#173B2A]/10 shadow-sm p-6">
          <div className="w-16 h-16 rounded-full bg-[#173B2A]/10 text-[#173B2A] flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[#C49A4A]" />
          </div>
          <h3 className="font-serif-display text-xl font-bold text-[#173B2A]">
            No Orders Found
          </h3>
          <p className="text-xs sm:text-sm text-[#6B4432] mt-1.5 max-w-sm mx-auto">
            We couldn&apos;t find any orders matching that phone number or Order ID. Double check the digits or place a fresh order!
          </p>
          <button
            onClick={() => navigate('shop')}
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] text-xs font-semibold transition shadow-md"
          >
            <span>Explore Fresh Raisins</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Empty State before search if no customer logged in */
        <div className="text-center py-16 bg-white rounded-3xl border border-[#173B2A]/10 shadow-sm p-6">
          <div className="w-16 h-16 rounded-full bg-[#173B2A]/10 text-[#173B2A] flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[#C49A4A]" />
          </div>
          <h3 className="font-serif-display text-xl font-bold text-[#173B2A]">
            Track Your Dry Fruit Order
          </h3>
          <p className="text-xs sm:text-sm text-[#6B4432] mt-1.5 max-w-sm mx-auto">
            Enter your mobile number or Order ID above to see real-time updates and delivery status.
          </p>
        </div>
      )}
    </div>
  );
}
