'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Phone, 
  Mail, 
  ChevronRight, 
  ArrowRight
} from 'lucide-react';

export default function MyAccountView({ 
  customer, 
  onLogout, 
  navigate, 
  wishlist = [], 
  onToggleWishlist, 
  onAddToCart, 
  onOpenAuth 
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'addresses', 'wishlist'
  const [profileData, setProfileData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
  });

  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    type: 'Home',
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    isDefault: true,
  });

  // Sync state with customer or localStorage
  useEffect(() => {
    if (customer) {
      setProfileData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
      });
    }

    try {
      const savedAddrs = localStorage.getItem('rn_saved_addresses');
      if (savedAddrs) {
        setAddresses(JSON.parse(savedAddrs));
      } else if (customer) {
        setAddresses([
          {
            id: 'addr_default',
            type: 'Home',
            name: customer.name || 'Valued Customer',
            phone: customer.phone || '',
            address: '123 Main Street, Near City Park',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001',
            isDefault: true,
          }
        ]);
      }
    } catch (_) {}
  }, [customer]);

  const saveAddressesToStorage = (updatedList) => {
    setAddresses(updatedList);
    try {
      localStorage.setItem('rn_saved_addresses', JSON.stringify(updatedList));
    } catch (_) {}
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...customer,
      name: profileData.name,
      phone: profileData.phone,
      email: profileData.email,
    };
    try {
      localStorage.setItem('rn_customer', JSON.stringify(updated));
    } catch (_) {}
    toast.success('Profile updated successfully!');
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.address || !newAddr.city || !newAddr.pincode) {
      toast.error('Please fill in all address fields');
      return;
    }
    const created = {
      ...newAddr,
      id: `addr_${Date.now()}`,
    };

    let updated = [...addresses];
    if (newAddr.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(created);
    saveAddressesToStorage(updated);
    setIsAddingAddress(false);
    toast.success('New delivery address saved!');
    setNewAddr({
      type: 'Home',
      name: customer?.name || '',
      phone: customer?.phone || '',
      address: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      isDefault: false,
    });
  };

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    saveAddressesToStorage(updated);
    toast.info('Address removed');
  };

  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    saveAddressesToStorage(updated);
    toast.success('Default delivery address updated');
  };

  if (!customer) {
    return (
      <div className="container py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-[#173B2A]/10 shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F7F1E5] text-[#173B2A] flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-[#C49A4A]" />
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-[#173B2A]">
            Log in to view your Account
          </h2>
          <p className="text-xs text-[#6B4432] leading-relaxed">
            Manage your orders, saved addresses, wishlist items, and personal details in one place.
          </p>
          <button
            onClick={onOpenAuth}
            className="w-full py-3 rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
          >
            Login / Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#173B2A] text-[#F7F1E5] flex items-center justify-center font-bold text-xl shadow">
          {customer.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#173B2A]">
            Hello, {customer.name}!
          </h1>
          <p className="text-xs text-[#6B4432]">
            {customer.phone || customer.email} • Real &amp; Natural Verified Customer
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Navigation Sidebar */}
        <div className="space-y-2">
          <div className="bg-white rounded-2xl border border-[#173B2A]/10 p-2 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition ${
                activeTab === 'profile'
                  ? 'bg-[#173B2A] text-[#F7F1E5]'
                  : 'text-[#173B2A] hover:bg-[#F7F1E5]'
              }`}
            >
              <User className="w-4 h-4 text-[#C49A4A]" />
              <span>Personal Profile</span>
            </button>

            <button
              onClick={() => navigate('orders')}
              className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between text-[#173B2A] hover:bg-[#F7F1E5] transition"
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-[#C49A4A]" />
                <span>My Orders</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition ${
                activeTab === 'addresses'
                  ? 'bg-[#173B2A] text-[#F7F1E5]'
                  : 'text-[#173B2A] hover:bg-[#F7F1E5]'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#C49A4A]" />
              <span>Saved Addresses ({addresses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition ${
                activeTab === 'wishlist'
                  ? 'bg-[#173B2A] text-[#F7F1E5]'
                  : 'text-[#173B2A] hover:bg-[#F7F1E5]'
              }`}
            >
              <Heart className="w-4 h-4 text-[#C49A4A]" />
              <span>Wishlist ({wishlist.length})</span>
            </button>

            <button
              onClick={() => navigate('cart')}
              className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between text-[#173B2A] hover:bg-[#F7F1E5] transition"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-[#C49A4A]" />
                <span>Shopping Cart</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-3 hover:bg-rose-100 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#173B2A]/10 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-serif-display text-xl font-bold text-[#173B2A]">
                    Personal Information
                  </h2>
                  <p className="text-xs text-[#6B4432]">Update your profile name, mobile number, and email address</p>
                </div>
                <ShieldCheck className="w-6 h-6 text-[#C49A4A]" />
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-[#173B2A] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#173B2A] focus:ring-1 focus:ring-[#173B2A] text-xs font-medium text-[#173B2A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173B2A] mb-1">Mobile Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+91 Mobile Number"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#173B2A] focus:ring-1 focus:ring-[#173B2A] text-xs font-medium text-[#173B2A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173B2A] mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#173B2A] focus:ring-1 focus:ring-[#173B2A] text-xs font-medium text-[#173B2A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#173B2A]/10 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-serif-display text-xl font-bold text-[#173B2A]">
                    Saved Delivery Addresses
                  </h2>
                  <p className="text-xs text-[#6B4432]">Manage delivery locations for faster 1-click checkout</p>
                </div>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="px-4 py-2 rounded-full bg-[#C49A4A] hover:bg-[#A87F30] text-white text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <form onSubmit={handleAddAddress} className="p-4 rounded-2xl bg-[#F7F1E5]/50 border border-[#173B2A]/10 space-y-4">
                  <h3 className="text-xs font-bold text-[#173B2A] uppercase tracking-wide">New Address Details</h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {['Home', 'Office', 'Other'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewAddr({ ...newAddr, type: t })}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          newAddr.type === t
                            ? 'bg-[#173B2A] text-[#F7F1E5] border-[#173B2A]'
                            : 'bg-white text-[#173B2A] border-gray-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Receiver Name"
                      required
                      value={newAddr.name}
                      onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Mobile Phone"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
                    />
                  </div>

                  <textarea
                    placeholder="Street Address, House/Flat No, Landmark"
                    rows={2}
                    required
                    value={newAddr.address}
                    onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      required
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs text-[#173B2A] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAddr.isDefault}
                        onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                        className="rounded text-[#173B2A] focus:ring-[#173B2A]"
                      />
                      <span>Set as default address</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-1.5 rounded-full border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-1.5 rounded-full bg-[#173B2A] text-[#F7F1E5] text-xs font-bold hover:bg-[#0F2A1D] cursor-pointer"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border transition relative ${
                      addr.isDefault
                        ? 'border-[#173B2A] bg-emerald-50/20'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#173B2A] text-[#F7F1E5] uppercase">
                        {addr.type}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Default
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-[#173B2A]">{addr.name}</h4>
                    <p className="text-xs text-[#6B4432] mt-1 leading-relaxed">
                      {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1 font-mono">📱 {addr.phone}</p>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs text-[#2874F0] hover:underline font-semibold cursor-pointer"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#173B2A]/10 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-serif-display text-xl font-bold text-[#173B2A]">
                    My Wishlist
                  </h2>
                  <p className="text-xs text-[#6B4432]">Items you saved to purchase later</p>
                </div>
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-xs text-[#6B4432]">Your wishlist is currently empty.</p>
                  <button
                    onClick={() => navigate('shop')}
                    className="px-5 py-2 rounded-full bg-[#173B2A] text-[#F7F1E5] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Browse Products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-gray-200 flex items-center gap-4 hover:shadow-md transition"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#173B2A] truncate">{item.name}</h4>
                        <div className="text-xs text-[#C49A4A] font-bold mt-0.5">₹{item.price}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              onAddToCart(item);
                              toast.success(`Moved ${item.name} to cart!`);
                            }}
                            className="px-3 py-1 rounded-full bg-[#173B2A] text-[#F7F1E5] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <ShoppingCart className="w-3 h-3" /> Add to Cart
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleWishlist(item)}
                            className="p-1 text-gray-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
