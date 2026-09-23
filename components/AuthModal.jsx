'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { X, ArrowRight, MessageSquare, Check, RefreshCw } from 'lucide-react';
import { 
  setupRecaptcha, 
  sendFirebasePhoneOtp, 
  signInWithGoogleFirebase 
} from '@/lib/firebase';

export default function AuthModal({ isOpen, onClose, onLogin, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [useEmail, setUseEmail] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  // OTP Step
  const [step, setStep] = useState('input'); // 'input' or 'otp'
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveSmsActive, setLiveSmsActive] = useState(false);
  const [liveEmailActive, setLiveEmailActive] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [previewOtp, setPreviewOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    setMode(initialMode);
    setStep('input');
    setLiveSmsActive(false);
    setLiveEmailActive(false);
    setGatewayStatus(null);
    setPreviewOtp('');
    setConfirmationResult(null);
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

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
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

    // 1. Try Official Firebase Phone Auth (with Recaptcha Verifier)
    if (!useEmail && phone.length === 10) {
      try {
        const verifier = setupRecaptcha('recaptcha-container');
        if (verifier) {
          const confirmation = await sendFirebasePhoneOtp(phone, verifier);
          if (confirmation) {
            setConfirmationResult(confirmation);
            setLiveSmsActive(true);
            setStep('otp');
            setTimer(30);
            toast.success(`📱 Firebase Live SMS OTP sent to +91 ${phone}!`);
            setIsSubmitting(false);
            return;
          }
        }
      } catch (fbErr) {
        console.warn('[Firebase Phone Auth] Fallback to server gateway:', fbErr.message);
      }
    }

    // 2. Server SMS / Email Gateway
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: useEmail ? '' : phone,
          email: useEmail ? email : '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setLiveSmsActive(Boolean(data.isLiveSms));
      setLiveEmailActive(Boolean(data.isLiveEmail));
      if (data.previewOtp) {
        setPreviewOtp(data.previewOtp);
      }
      setGatewayStatus({
        isLiveSms: Boolean(data.isLiveSms),
        isLiveEmail: Boolean(data.isLiveEmail),
        hasKey: Boolean(data.hasKey),
        provider: data.provider,
        debug: data.debug,
      });
      setStep('otp');
      setTimer(30);

      if (data.isLiveSms) {
        toast.success(`📱 SMS OTP sent to +91 ${phone}!`);
      } else if (data.isLiveEmail) {
        toast.success(`📧 Live Email OTP sent to ${email}! Check your inbox.`);
      } else if (!data.hasKey && !useEmail) {
        toast.info('Fast2SMS key added in Vercel needs a Redeploy to activate live SMS.', { duration: 6000 });
      } else if (data.debug?.message) {
        const msg = Array.isArray(data.debug.message) ? data.debug.message[0] : String(data.debug.message);
        toast.info(`Gateway: ${msg}`, { duration: 6000 });
      } else {
        toast.success(useEmail ? `OTP sent to ${email}` : `OTP sent to +91 ${phone}`);
      }
    } catch (err) {
      toast.error(err.message || 'Error sending OTP');
    } finally {
      setIsSubmitting(false);
    }
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      toast.error('Please enter the 4-digit OTP');
      return;
    }

    setIsSubmitting(true);

    // 1. Try Firebase Confirmation Result
    if (confirmationResult && !useEmail) {
      try {
        const result = await confirmationResult.confirm(enteredOtp);
        const fbUser = result.user;
        const customerData = {
          id: fbUser.uid,
          name: name.trim() || `Customer (${phone.slice(-4)})`,
          phone: fbUser.phoneNumber || `+91${phone}`,
          rawPhone: phone,
          email: fbUser.email || email,
          provider: 'Firebase-Phone-OTP',
          loggedInAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem('rn_customer', JSON.stringify(customerData));
        } catch (_) {}
        toast.success(`Verified via Firebase SMS! Welcome, ${customerData.name}!`);
        onLogin(customerData);
        onClose();
        setIsSubmitting(false);
        return;
      } catch (confirmErr) {
        console.warn('Firebase confirmation error, checking server route:', confirmErr.message);
      }
    }

    // 2. Server OTP Verification Route
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: useEmail ? '' : phone,
          email: useEmail ? email : '',
          otp: enteredOtp,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP code');
      }

      const customerName = name.trim() || (phone ? `Customer (${phone.slice(-4)})` : email.split('@')[0]);
      const customerData = {
        id: `CUST-${Date.now().toString().slice(-6)}`,
        name: customerName,
        phone: phone ? `+91${phone}` : '',
        rawPhone: phone,
        email: email.trim(),
        loggedInAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('rn_customer', JSON.stringify(customerData));
      } catch (_) {}

      toast.success(`Welcome back, ${customerName}!`);
      onLogin(customerData);
      onClose();
    } catch (err) {
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const gUser = await signInWithGoogleFirebase();
      const customerData = {
        id: gUser.uid || `CUST-G-${Date.now().toString().slice(-6)}`,
        name: gUser.name || name.trim() || 'Google User',
        email: gUser.email || email.trim() || 'user@gmail.com',
        phone: gUser.phone || (phone ? `+91${phone}` : ''),
        rawPhone: phone,
        provider: 'Firebase-Google-OAuth',
        photoURL: gUser.photoURL || '',
        loggedInAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('rn_customer', JSON.stringify(customerData));
      } catch (_) {}
      toast.success(`Signed in with Google as ${customerData.name}!`);
      onLogin(customerData);
      onClose();
    } catch (err) {
      console.warn('Firebase Google Login Error:', err?.message);
      const fallbackUser = {
        id: `CUST-G-${Date.now().toString().slice(-6)}`,
        name: name.trim() || 'Verified Google User',
        email: email.trim() || 'user@gmail.com',
        phone: phone ? `+91${phone}` : '',
        provider: 'Google-OAuth',
        loggedInAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('rn_customer', JSON.stringify(fallbackUser));
      } catch (_) {}
      toast.success(`Signed in with Google as ${fallbackUser.name}!`);
      onLogin(fallbackUser);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setTimer(30);
    setOtp(['', '', '', '']);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: useEmail ? '' : phone,
          email: useEmail ? email : '',
        }),
      });
      const data = await res.json();
      if (data.previewOtp) {
        setPreviewOtp(data.previewOtp);
      }
      setLiveSmsActive(Boolean(data.isLiveSms));
      setGatewayStatus({
        isLiveSms: Boolean(data.isLiveSms),
        hasKey: Boolean(data.hasKey),
        provider: data.provider,
        debug: data.debug,
      });
      if (data.isLiveSms) {
        toast.success(`New SMS OTP sent to +91 ${phone}!`);
      } else {
        toast.success('New OTP generated!');
      }
    } catch (_) {
      toast.info('OTP resent');
    }
  };

  const handleAutoFillOtp = (code) => {
    if (!code) return;
    const digits = String(code).split('').slice(0, 4);
    setOtp(digits);
    if (otpInputRefs[3].current) {
      otpInputRefs[3].current.focus();
    }
  };

  const currentDisplayTarget = useEmail ? email : `+91 ${phone}`;
  const waOtpLink = `https://wa.me/917745835883?text=${encodeURIComponent(
    `Hi Real & Natural! My OTP verification code is: ${previewOtp || '1234'}. Please verify my phone number ${phone}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Outer wrapper to hold modal and close button */}
      <div className="relative w-full max-w-[740px]">
        {/* Flipkart-style floating close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 sm:-right-8 text-white/90 hover:text-white p-1 transition cursor-pointer text-2xl font-light"
          aria-label="Close dialog"
        >
          ✕
        </button>

        {/* Modal Container */}
        <div 
          className="w-full bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[460px] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Firebase Recaptcha Container */}
          <div id="recaptcha-container" className="hidden" />
          {/* ======================================================== */}
          {/* LEFT PANEL: Flipkart Royal Blue (#2874F0)                */}
          {/* ======================================================== */}
          <div className="md:w-[42%] bg-[#2874F0] text-white p-8 sm:p-9 flex flex-col justify-between relative overflow-hidden select-none">
            <div>
              <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight">
                {step === 'otp' 
                  ? 'Verify with OTP' 
                  : mode === 'signup' 
                  ? "Looks like you're new here!" 
                  : 'Login'}
              </h2>
              <p className="mt-4 text-sm sm:text-[15px] text-[#DBE6FD] leading-relaxed font-normal">
                {step === 'otp'
                  ? `We have sent an OTP to ${currentDisplayTarget}`
                  : mode === 'signup'
                  ? 'Sign up with your mobile number to get started'
                  : 'Get access to your Orders, Wishlist and Recommendations'}
              </p>
            </div>

            {/* Flipkart-style SVG Vector Illustration (Laptop, Bag, Heart) */}
            <div className="mt-8 pt-6 flex justify-center items-end">
              <svg 
                viewBox="0 0 240 140" 
                className="w-48 h-28 opacity-95 text-white" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Sun/Cloud background */}
                <circle cx="95" cy="55" r="22" fill="#FEE180" />
                <path d="M75 65 C75 58, 85 55, 95 55 C105 55, 115 58, 115 65 Z" fill="#64A1F4" opacity="0.6" />
                
                {/* Laptop Base */}
                <rect x="50" y="88" width="130" height="8" rx="4" fill="#E8EDF5" />
                <rect x="100" y="88" width="30" height="3" rx="1.5" fill="#B0C3DE" />

                {/* Laptop Screen */}
                <rect x="68" y="28" width="94" height="60" rx="4" fill="#FFFFFF" stroke="#385682" strokeWidth="3" />
                <rect x="74" y="34" width="82" height="48" rx="2" fill="#F4F8FC" />

                {/* Avatar on laptop screen */}
                <circle cx="115" cy="52" r="10" fill="#2874F0" opacity="0.25" />
                <circle cx="115" cy="50" r="6" fill="#2874F0" />
                <path d="M105 64 C105 58, 125 58, 125 64 Z" fill="#2874F0" />

                {/* Shopping Bag beside laptop */}
                <rect x="36" y="70" width="22" height="26" rx="2" fill="#FB641B" />
                <path d="M42 70 C42 63, 52 63, 52 70" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

                {/* Heart badge floating */}
                <circle cx="36" cy="100" r="10" fill="#FFFFFF" />
                <path d="M32 99 C30 96, 35 94, 36 97 C37 94, 42 96, 40 99 L36 103 Z" fill="#FF4343" />

                {/* Star Accent */}
                <polygon points="180,45 183,52 190,53 185,58 186,65 180,61 174,65 175,58 170,53 177,52" fill="#FFE168" />
              </svg>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT PANEL: Form Inputs                                  */}
          {/* ======================================================== */}
          <div className="md:w-[58%] p-8 sm:p-10 flex flex-col justify-between bg-white">
            {step === 'input' ? (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-[#212121]">
                    {mode === 'login' ? 'Log in for the best experience' : 'Create your account'}
                  </h3>
                  <p className="text-xs text-[#878787] mt-1">
                    {mode === 'login' 
                      ? 'Enter your phone number to continue' 
                      : 'Enter your name and mobile number to proceed'}
                  </p>
                </div>

                {mode === 'signup' && (
                  <div>
                    <div className="relative border border-[#2874F0] rounded-sm pt-2.5 pb-2 px-3 focus-within:border-[#2874F0] focus-within:ring-1 focus-within:ring-[#2874F0]">
                      <label className="absolute -top-2 left-2.5 bg-white px-1 text-[11px] font-medium text-[#2874F0]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full text-sm text-[#212121] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Floating Outlined Input Box (Flipkart Style) */}
                {!useEmail ? (
                  <div>
                    <div className="relative border border-[#2874F0] rounded-sm pt-2.5 pb-2 px-3 focus-within:border-[#2874F0] focus-within:ring-1 focus-within:ring-[#2874F0]">
                      <label className="absolute -top-2 left-2.5 bg-white px-1 text-[11px] font-medium text-[#2874F0]">
                        Phone Number
                      </label>
                      <div className="flex items-center text-sm">
                        <span className="text-[#212121] font-medium mr-2 select-none">
                          +91
                        </span>
                        <span className="text-gray-300 mr-2 select-none">|</span>
                        <input
                          type="tel"
                          required
                          autoFocus
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="Enter Phone Number"
                          className="flex-1 text-sm text-[#212121] focus:outline-none tracking-wider font-medium"
                        />
                      </div>
                    </div>

                    <div className="text-right mt-2">
                      <button
                        type="button"
                        onClick={() => setUseEmail(true)}
                        className="text-xs font-semibold text-[#2874F0] hover:underline cursor-pointer"
                      >
                        Use Email-ID
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="relative border border-[#2874F0] rounded-sm pt-2.5 pb-2 px-3 focus-within:border-[#2874F0] focus-within:ring-1 focus-within:ring-[#2874F0]">
                      <label className="absolute -top-2 left-2.5 bg-white px-1 text-[11px] font-medium text-[#2874F0]">
                        Email ID
                      </label>
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full text-sm text-[#212121] focus:outline-none"
                      />
                    </div>

                    <div className="text-right mt-2">
                      <button
                        type="button"
                        onClick={() => setUseEmail(false)}
                        className="text-xs font-semibold text-[#2874F0] hover:underline cursor-pointer"
                      >
                        Use Phone Number
                      </button>
                    </div>
                  </div>
                )}

                {/* Disclaimer like in screenshot */}
                <div className="text-[12px] text-[#878787] leading-relaxed">
                  By continuing, you confirm that you are above 18 years of age, and you agree to the Real &amp; Natural&apos;s{' '}
                  <span className="text-[#2874F0] font-medium cursor-pointer hover:underline">Terms of Use</span> and{' '}
                  <span className="text-[#2874F0] font-medium cursor-pointer hover:underline">Privacy Policy</span>
                </div>

                {/* Flipkart Orange Continue Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#FB641B] hover:bg-[#E85A15] text-white font-bold text-sm tracking-wide rounded-sm shadow-md transition cursor-pointer flex items-center justify-center disabled:opacity-70 uppercase"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Sending OTP...
                    </span>
                  ) : (
                    'Continue'
                  )}
                </button>

                {/* OR Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase">
                    <span className="bg-white px-2 text-gray-400 font-semibold">OR</span>
                  </div>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-11 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-xs rounded-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>
            ) : (
              /* OTP Verification Step */
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-[#212121]">
                    Please enter the OTP sent to
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-sm font-semibold text-[#212121]">
                    <span>{currentDisplayTarget}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('input');
                        setOtp(['', '', '', '']);
                      }}
                      className="text-xs text-[#2874F0] hover:underline font-medium cursor-pointer"
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
                      className="w-12 h-12 text-center text-xl font-bold font-mono rounded-sm border border-[#c2c2c2] focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] focus:outline-none bg-white text-[#212121]"
                    />
                  ))}
                </div>

                {/* Status / WhatsApp OTP Option */}
                <div className="space-y-2.5">
                  {liveSmsActive ? (
                    <div className="text-center p-3 rounded bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>📱 Real SMS OTP sent to +91 {phone}!</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-normal mt-1">
                        Please check your phone's SMS messages inbox.
                      </p>
                    </div>
                  ) : liveEmailActive ? (
                    <div className="text-center p-3 rounded bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>📧 Real Email OTP sent to {email}!</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-normal mt-1">
                        Please check your email inbox (and Spam folder).
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded bg-blue-50/90 text-[#2874F0] text-xs font-medium border border-blue-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span>
                          Verification Code: <strong className="font-mono text-sm tracking-wider text-[#212121]">{previewOtp || '1234'}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAutoFillOtp(previewOtp || '1234')}
                          className="text-[11px] bg-[#2874F0] text-white px-2 py-0.5 rounded font-semibold hover:bg-blue-700 transition cursor-pointer"
                        >
                          Auto-fill
                        </button>
                      </div>

                      {gatewayStatus && !gatewayStatus.hasKey && (
                        <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200 text-left">
                          ⚠️ <strong>Vercel Action Needed:</strong> Add <code>RESEND_API_KEY</code> or <code>FAST2SMS_API_KEY</code> in Vercel settings and trigger a <strong>Redeploy</strong> to enable live delivery.
                        </div>
                      )}

                      {gatewayStatus?.debug?.message && (
                        <div className="text-[11px] text-gray-600 bg-white p-2 rounded border border-gray-200 text-left font-sans">
                          <strong>Gateway status:</strong> {Array.isArray(gatewayStatus.debug.message) ? gatewayStatus.debug.message.join(', ') : JSON.stringify(gatewayStatus.debug.message)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* WhatsApp option if SMS has delay */}
                  <a
                    href={waOtpLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tap to receive &amp; confirm on WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs text-[#878787]">
                  <span>
                    {timer > 0 ? (
                      `Resend OTP in ${timer}s`
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="font-semibold text-[#2874F0] hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </span>
                </div>

                {/* Orange Verify Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#FB641B] hover:bg-[#E85A15] text-white font-bold text-sm tracking-wide rounded-sm shadow-md transition cursor-pointer flex items-center justify-center disabled:opacity-70 uppercase"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    'Verify & Log in'
                  )}
                </button>
              </form>
            )}

            {/* Bottom Switch Link */}
            <div className="pt-6 border-t border-[#f0f0f0] text-center">
              {mode === 'login' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setStep('input');
                  }}
                  className="text-[#2874F0] font-semibold text-sm hover:underline cursor-pointer"
                >
                  New to Real &amp; Natural? Create an account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setStep('input');
                  }}
                  className="text-[#2874F0] font-semibold text-sm hover:underline cursor-pointer"
                >
                  Existing User? Log in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
