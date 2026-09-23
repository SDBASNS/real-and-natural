import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCyJmantoQHZpm207NquIJY_wRpabNSErI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "real-and-natural.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "real-and-natural",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "real-and-natural.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "725600837628",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:725600837628:web:60e23ecc1f1daf52ee1c79",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-9TPNPTFCPV"
};

// Initialize Firebase App (Singleton Pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Initialize Firebase Invisible / Normal Recaptcha Verifier
 */
export const setupRecaptcha = (containerId = 'recaptcha-container') => {
  if (typeof window === 'undefined') return null;

  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (_) {}
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired');
    }
  });

  return window.recaptchaVerifier;
};

/**
 * Send SMS OTP via Firebase Auth Phone Provider
 */
export const sendFirebasePhoneOtp = async (phoneNumber, appVerifier) => {
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '').slice(-10)}`;
  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
  return confirmationResult;
};

/**
 * Google OAuth Popup Sign In via Firebase
 */
export const signInWithGoogleFirebase = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return {
    uid: user.uid,
    name: user.displayName || 'Google User',
    email: user.email || '',
    phone: user.phoneNumber || '',
    photoURL: user.photoURL || '',
    provider: 'firebase-google',
  };
};

/**
 * Firebase Sign Out
 */
export const logoutFirebase = async () => {
  await signOut(auth);
};
