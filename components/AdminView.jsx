'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Package, TrendingUp, Clock, CheckCircle, RefreshCw, LogOut } from 'lucide-react';

export default function AdminView({ navigate }) {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async (authToken) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.status === 401) {
        toast.error('Invalid admin token');
        setIsAuthenticated(false);
        return;
      }

      const data = await res.json();
      setOrders(data.orders || []);
      setIsAuthenticated(true);
      toast.success('Admin authenticated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Please enter admin token');
      return;
    }
    fetchOrders(token.trim());
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order #${orderId} marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Status update failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-20 max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 border border-[#173B2A]/10 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#173B2A]/10 text-[#173B2A] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-[#C49A4A]" />
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-[#173B2A]">
            Store Administration
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#6B4432]">
            Enter your admin passkey to view and manage customer orders.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-[#173B2A] uppercase mb-1">
                Admin Passkey
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Default: admin123"
                className="w-full px-4 py-2.5 rounded-xl border border-[#173B2A]/20 text-sm text-[#173B2A] focus:outline-none focus:border-[#173B2A] bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] h-11 text-sm font-semibold transition shadow-md disabled:opacity-75"
            >
              {isLoading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#173B2A]/10 text-[11px] text-[#6B4432]/70">
            Hint: Default passkey is <code className="bg-[#173B2A]/5 px-1.5 py-0.5 rounded font-mono">admin123</code>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

  return (
    <div className="container py-10 sm:py-14 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C49A4A]">
            Admin Control Center
          </span>
          <h1 className="font-serif-display text-3xl font-bold text-[#173B2A]">
            Orders &amp; Fulfillment
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOrders(token)}
            disabled={isLoading}
            className="p-2 rounded-xl border border-[#173B2A]/20 hover:bg-white text-[#173B2A] transition"
            title="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#173B2A]/20 text-xs font-semibold text-[#173B2A] hover:bg-[#173B2A]/5 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-[#173B2A]/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#173B2A]/10 text-[#173B2A] flex items-center justify-center">
            <Package className="w-6 h-6 text-[#173B2A]" />
          </div>
          <div>
            <div className="text-xs text-[#6B4432] font-semibold">Total Orders</div>
            <div className="text-2xl font-bold text-[#173B2A]">{orders.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#173B2A]/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C49A4A]/15 text-[#C49A4A] flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#C49A4A]" />
          </div>
          <div>
            <div className="text-xs text-[#6B4432] font-semibold">Total Revenue</div>
            <div className="text-2xl font-bold text-[#173B2A]">₹{totalRevenue}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#173B2A]/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#6B4432] font-semibold">Pending Orders</div>
            <div className="text-2xl font-bold text-amber-800">{pendingOrders}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#173B2A]/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#6B4432] font-semibold">Delivered</div>
            <div className="text-2xl font-bold text-emerald-800">{deliveredOrders}</div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#173B2A]/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#173B2A]/10 font-bold text-base text-[#173B2A]">
          Recent Customer Orders ({orders.length})
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#6B4432]">
            No customer orders placed yet. Place a test order from the checkout!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7F1E5] text-[#173B2A] text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order ID &amp; Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#173B2A]/10 text-[#6B4432]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#F7F1E5]/40 transition">
                    <td className="py-4 px-4 font-mono font-bold text-[#173B2A]">
                      <div>{o.id}</div>
                      <div className="text-[11px] font-sans font-normal text-[#6B4432]/70">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-[#173B2A]">
                      <div>{o.customer.name}</div>
                      <div className="text-xs text-[#6B4432]/80">{o.customer.phone}</div>
                    </td>

                    <td className="py-4 px-4 text-xs max-w-xs">
                      {o.customer.address}, {o.customer.city}, {o.customer.state} ({o.customer.pincode})
                    </td>

                    <td className="py-4 px-4 text-xs">
                      {o.items?.map((item, i) => (
                        <div key={i}>
                          {item.name} ({item.pack}) × {item.quantity}
                        </div>
                      ))}
                    </td>

                    <td className="py-4 px-4 font-bold text-[#173B2A]">
                      <div>₹{o.total}</div>
                      <div className="text-[10px] font-normal text-[#6B4432]/70">
                        {o.paymentMethod}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : o.status === 'Shipped'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : o.status === 'Confirmed'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
