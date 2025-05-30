import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate configuration
const validateConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    console.log('Current config (sanitized):', {
      apiKey: firebaseConfig.apiKey ? '✓ present' : '✗ missing',
      authDomain: firebaseConfig.authDomain ? '✓ present' : '✗ missing',
      projectId: firebaseConfig.projectId ? '✓ present' : '✗ missing',
      storageBucket: firebaseConfig.storageBucket ? '✓ present' : '✗ missing',
      messagingSenderId: firebaseConfig.messagingSenderId ? '✓ present' : '✗ missing',
      appId: firebaseConfig.appId ? '✓ present' : '✗ missing'
    });
    throw new Error(`Missing Firebase configuration fields: ${missingFields.join(', ')}`);
  }
};

// Validate before initializing
validateConfig();

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider }; 