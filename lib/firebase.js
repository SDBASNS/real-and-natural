import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoKeyReplaceWithYours',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'real-and-natural.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'real-and-natural',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'real-and-natural.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Helper to setup reCAPTCHA verifier for Firebase Phone SMS Auth
 */
export const setupRecaptcha = (containerId = 'recaptcha-container') => {
  if (typeof window === 'undefined') return null;
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired');
      }
    });
  }
  return window.recaptchaVerifier;
};

/**
 * Send Real SMS OTP to Indian Mobile Number via Firebase Auth
 */
export const sendFirebasePhoneOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '').slice(-10)}`;
  const appVerifier = setupRecaptcha(containerId);
  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
  window.confirmationResult = confirmationResult;
  return confirmationResult;
};

/**
 * 1-Click Real Google Login via Firebase
 */
export const signInWithGoogleFirebase = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return {
    id: user.uid,
    name: user.displayName || 'Google User',
    email: user.email || '',
    phone: user.phoneNumber || '',
    photoURL: user.photoURL || '',
    provider: 'firebase_google',
  };
};

export default app;
