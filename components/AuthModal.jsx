'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { 
  X, 
  Mail, 
  Package, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  User
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [useEmail, setUseEmail] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  
  // OTP Step
  const [step, setStep] = useState('input'); // 'input' or 'otp'
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    setMode(initialMode);
    setStep('input');
  }, [initialMode, isOpen]);

  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(clean);
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    if (mode === 'signup' && !name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!useEmail) {
      if (phone.length !== 10) {
        toast.error('Please enter a valid 10-digit mobile number');
        return;
      }
    } else {
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
      setTimer(30);
      toast.success(
        useEmail 
          ? `OTP sent to ${email}` 
          : `OTP sent to +91 ${phone}`
      );
    }, 300);
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      toast.error('Please enter the 4-digit OTP');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const customerName = name.trim() || (phone ? `Customer (${phone.slice(-4)})` : email.split('@')[0]);
      const customerData = {
        id: `CUST-${Date.now().toString().slice(-6)}`,
        name: customerName,
        phone: phone ? `+91${phone}` : '',
        rawPhone: phone,
        email: email.trim(),
        city: city.trim(),
        loggedInAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('rn_customer', JSON.stringify(customerData));
      } catch (_) {}

      toast.success(`Welcome to Real & Natural, ${customerName}!`);
      onLogin(customerData);
      onClose();
    }, 400);
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    setTimer(30);
    setOtp(['', '', '', '']);
    toast.success('New OTP has been sent!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#173B2A]/10 flex flex-col md:flex-row transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#173B2A]/5 hover:bg-[#173B2A]/10 text-[#173B2A] transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Flipkart-style Brand Highlight */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#173B2A] to-[#0A1D13] text-[#F7F1E5] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#C49A4A]/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-1.5 text-[#C49A4A] text-xs uppercase tracking-wider font-bold mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Real &amp; Natural</span>
            </div>

            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold leading-tight">
              {mode === 'login' ? 'Login' : 'Create Account'}
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-[#F7F1E5]/80 leading-relaxed">
              {mode === 'login'
                ? 'Get access to your Orders, Live Tracking and Fast Checkout.'
                : 'Sign up to track orders, save multiple addresses and enjoy member benefits.'}
            </p>
          </div>

          <div className="my-6 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-[#F7F1E5]/90">
              <div className="w-6 h-6 rounded-full bg-[#C49A4A]/20 flex items-center justify-center text-[#C49A4A] shrink-0">
                <Package className="w-3.5 h-3.5" />
              </div>
              <span>Track all your raisin orders live</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#F7F1E5]/90">
              <div className="w-6 h-6 rounded-full bg-[#C49A4A]/20 flex items-center justify-center text-[#C49A4A] shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>100% Verified Farm-Direct Products</span>
            </div>
          </div>

          <div className="text-[11px] text-[#F7F1E5]/60 pt-4 border-t border-white/10">
            🔒 Safe &amp; Secure 256-Bit Encrypted
          </div>
        </div>

        {/* Right Side: Form Inputs */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between bg-white">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center border-b border-[#173B2A]/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStep('input');
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold transition relative ${
                mode === 'login'
                  ? 'text-[#173B2A]'
                  : 'text-[#6B4432]/60 hover:text-[#173B2A]'
              }`}
            >
              Log In
              {mode === 'login' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#173B2A]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setStep('input');
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold transition relative ${
                mode === 'signup'
                  ? 'text-[#173B2A]'
                  : 'text-[#6B4432]/60 hover:text-[#173B2A]'
              }`}
            >
              Sign Up
              {mode === 'signup' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#173B2A]" />
              )}
            </button>
          </div>

          {step === 'input' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <p className="text-xs text-[#6B4432] mb-3">
                  {mode === 'login'
                    ? 'Log in for the best experience & order history:'
                    : 'Create your customer account in seconds:'}
                </p>

                {mode === 'signup' && (
                  <div className="mb-3.5">
                    <label className="block text-[11px] font-semibold text-[#173B2A] mb-1 uppercase tracking-wide">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#173B2A]/40 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#173B2A]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#173B2A]/30"
                      />
                    </div>
                  </div>
                )}

                {/* Mobile or Email Field */}
                {!useEmail ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#173B2A] mb-1 uppercase tracking-wide">
                      Mobile Number *
                    </label>
                    <div className="flex rounded-xl border border-[#173B2A]/20 overflow-hidden focus-within:ring-2 focus-within:ring-[#173B2A]/30">
                      <span className="bg-[#F7F1E5] px-3.5 flex items-center text-xs font-semibold text-[#173B2A] border-r border-[#173B2A]/20 select-none">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        required
                        autoFocus
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="Enter 10 digit number"
                        className="flex-1 h-11 px-3 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#173B2A] mb-1 uppercase tracking-wide">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#173B2A]/40 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#173B2A]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#173B2A]/30"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle Between Email and Phone */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setUseEmail(!useEmail)}
                  className="text-xs font-semibold text-[#173B2A] hover:text-[#C49A4A] transition underline underline-offset-2 cursor-pointer"
                >
                  {useEmail ? 'Use Mobile Number' : 'Use Email-ID'}
                </button>
              </div>

              <div className="text-[11px] text-[#6B4432]/80 leading-relaxed">
                By continuing, you agree to Real &amp; Natural&apos;s{' '}
                <span className="text-[#173B2A] font-semibold">Terms of Use</span> and{' '}
                <span className="text-[#173B2A] font-semibold">Privacy Policy</span>.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] text-sm font-semibold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: OTP Verification */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <div className="text-xs text-[#6B4432]">
                  Please enter the 4-digit verification code sent to:
                </div>
                <div className="font-semibold text-sm text-[#173B2A] mt-0.5 flex items-center justify-between">
                  <span>{useEmail ? email : `+91 ${phone}`}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('input');
                      setOtp(['', '', '', '']);
                    }}
                    className="text-xs text-[#C49A4A] hover:underline font-normal cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* 4 Digit Boxes */}
              <div className="flex justify-center gap-3 my-4">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-13 text-center text-xl font-bold font-mono rounded-xl border border-[#173B2A]/30 focus:border-[#173B2A] focus:ring-2 focus:ring-[#173B2A]/30 focus:outline-none bg-[#F7F1E5]/30"
                  />
                ))}
              </div>

              {/* Instant Verification Hint */}
              <div className="text-center p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200/80">
                ✨ Demo Code: Enter <span className="font-mono font-bold">1234</span> (or any 4 digits) to verify.
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B4432]">
                <span>
                  {timer > 0 ? (
                    `Resend OTP in ${timer}s`
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-semibold text-[#173B2A] hover:text-[#C49A4A] cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  )}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-full bg-[#173B2A] hover:bg-[#0F2A1D] text-[#F7F1E5] text-sm font-semibold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify &amp; Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Switcher */}
          <div className="mt-6 pt-4 border-t border-[#173B2A]/10 text-center text-xs text-[#6B4432]">
            {mode === 'login' ? (
              <span>
                New to Real &amp; Natural?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setStep('input');
                  }}
                  className="font-bold text-[#173B2A] hover:text-[#C49A4A] transition underline underline-offset-2 cursor-pointer"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Existing User?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setStep('input');
                  }}
                  className="font-bold text-[#173B2A] hover:text-[#C49A4A] transition underline underline-offset-2 cursor-pointer"
                >
                  Log In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
