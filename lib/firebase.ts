import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: any = null;

if (typeof window !== 'undefined') {
  try {
    // Check if the browser supports the required APIs
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      messaging = getMessaging(app);
    } else {
      console.warn('Firebase Messaging is not supported in this browser');
    }
  } catch (error) {
    console.warn('Firebase Messaging initialization failed:', error);
    // Silently fail - messaging features will be disabled
  }
}

// Initialize Firebase Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Helper function to safely get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Firebase Messaging is not available');
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Helper function to safely listen to messages
export const listenToMessages = (callback: (payload: any) => void): (() => void) | null => {
  if (!messaging) {
    console.warn('Firebase Messaging is not available');
    return null;
  }

  try {
    const unsubscribe = onMessage(messaging, callback);
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up message listener:', error);
    return null;
  }
};

export { app, messaging, getToken, onMessage, auth, googleProvider };
