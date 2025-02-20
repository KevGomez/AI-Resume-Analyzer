import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Set session timeout (1 hour)
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
let sessionTimeoutId: NodeJS.Timeout;
let activityTimeoutId: NodeJS.Timeout;

// Function to handle session timeout
const handleSessionTimeout = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      // Try to refresh the token before signing out
      await user.getIdToken(true);
    }
  } catch (error) {
    console.error("Session expired:", error);
    await signOut(auth);
    window.location.href = "/login";
  }
};

// Reset session timeout on user activity
const resetSessionTimeout = () => {
  // Clear existing timeouts
  clearTimeout(sessionTimeoutId);
  clearTimeout(activityTimeoutId);

  // Prevent multiple rapid calls
  if (activityTimeoutId) return;

  activityTimeoutId = setTimeout(() => {
    // Only set new timeout if user is logged in
    if (auth.currentUser) {
      sessionTimeoutId = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
    }
    activityTimeoutId = undefined;
  }, 1000);
};

// Monitor user authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, start session timeout
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);

    // Add event listeners for user activity
    const events = ["mousedown", "keydown", "touchstart", "mousemove"];
    events.forEach((event) => {
      document.addEventListener(event, resetSessionTimeout, { passive: true });
    });
  } else {
    // User is signed out, clear timeouts and remove event listeners
    clearTimeout(sessionTimeoutId);
    clearTimeout(activityTimeoutId);
    const events = ["mousedown", "keydown", "touchstart", "mousemove"];
    events.forEach((event) => {
      document.removeEventListener(event, resetSessionTimeout);
    });
  }
});

export { auth, database, storage };
