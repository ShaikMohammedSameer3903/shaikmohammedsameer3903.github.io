// Firebase Service - Optional Authentication Provider
// Only initializes if Firebase environment variables are provided
// Primary authentication uses Supabase (see supabaseClient.js)

let app = null;
let auth = null;
let googleProvider = null;
let initializationPromise = null;

// Only initialize Firebase if environment variables are provided
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Check if Firebase is properly configured
const isFirebaseConfigured = Object.values(firebaseConfig).some(value => value !== "");

// Async initialization function
const initializeFirebase = async () => {
  if (initializationPromise) {
    return initializationPromise;
  }

  if (!isFirebaseConfigured) {
    console.log('Firebase not configured - using Supabase authentication');
    return { app: null, auth: null, googleProvider: null };
  }

  initializationPromise = (async () => {
    try {
      const { initializeApp } = await import('firebase/app');
      const { getAuth, GoogleAuthProvider } = await import('firebase/auth');
      
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      
      console.log('Firebase initialized successfully');
      return { app, auth, googleProvider };
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      return { app: null, auth: null, googleProvider: null };
    }
  })();

  return initializationPromise;
};

// Initialize Firebase when module is loaded (but don't block)
if (isFirebaseConfigured) {
  initializeFirebase();
}

export { app, auth, googleProvider, initializeFirebase };
export default app;
