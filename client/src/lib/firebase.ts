import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Check if we have all required Firebase config variables
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

if (!apiKey || !projectId || !appId) {
  console.error("Firebase configuration is missing required values:", {
    apiKey: !!apiKey,
    projectId: !!projectId,
    appId: !!appId
  });
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey,
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: `${projectId}.appspot.com`,
  appId,
};

console.log("Firebase config:", {
  apiKeyExists: !!apiKey,
  projectIdExists: !!projectId,
  appIdExists: !!appId,
  authDomain: `${projectId}.firebaseapp.com`,
});

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Initialize Firebase Authentication
let auth;
try {
  auth = getAuth(app);
  console.log("Firebase auth initialized successfully");
} catch (error) {
  console.error("Firebase auth initialization error:", error);
}
export { auth };

// Configure Google Provider
let googleProvider;
try {
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  console.log("Google Provider configured successfully");
} catch (error) {
  console.error("Google Provider configuration error:", error);
}
export { googleProvider };

export default app;
