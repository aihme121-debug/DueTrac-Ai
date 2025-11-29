import { initializeApp } from "firebase/app";
import { getFirestore, Firestore, setDoc, doc, getDocs, collection, deleteDoc } from "firebase/firestore";

// Configuration from environment variables
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || 'AIzaSyA4LFmYUK34TEMlK7o-SCPBdgZpNyZ8KJ8',
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || 'dueall-27bff.firebaseapp.com',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'dueall-27bff',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || 'dueall-27bff.firebasestorage.app',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '132561668068',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '1:132561668068:web:fae6325cb5c9d8e71569f1',
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || 'G-0NGHKE44YD'
};

let db: Firestore | null = null;
let initError: string | null = null;
let isConfigured = false;
let firebaseApp: any = null;

try {
  // Validate configuration
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Missing required Firebase configuration (apiKey or projectId)');
  }
  
  // Initialize Firebase
  firebaseApp = initializeApp(firebaseConfig);
  
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(firebaseApp);
  
  // Enable offline persistence to handle network issues better
  // Note: enablePersistence is not available in the current Firebase version
  // Offline persistence will be handled automatically by Firebase
  
  isConfigured = true;
  console.log('✅ Firebase initialized successfully');
} catch (error: any) {
  console.error("❌ Firebase Initialization Error:", error.message);
  initError = error.message;
  isConfigured = false;
}

// Test Firestore connection and permissions
export const testFirestoreConnection = async () => {
  if (!db) {
    console.warn('❌ Firestore not initialized');
    return false;
  }
  
  try {
    console.log('🔍 Testing Firestore connection...');
    
    // First test if we can connect to Firestore with a simple operation
    const { collection, getDocs, limit, query } = await import('firebase/firestore');
    const testQuery = query(collection(db, 'test'), limit(1));
    
    // Try a simple read operation first (less likely to fail due to permissions)
    await getDocs(testQuery);
    console.log('✅ Firestore basic connection test passed');
    
    // Try to write a test document (this might fail due to security rules)
    try {
      const testDoc = {
        test: true,
        timestamp: new Date().toISOString(),
        message: "Connection test"
      };
      
      await setDoc(doc(db, "test", "connection_" + Date.now()), testDoc);
      console.log('✅ Firestore write test passed');
    } catch (writeError: any) {
      console.warn('⚠️ Firestore write test failed (may be due to security rules):', writeError.message);
      // Don't fail the entire test if write fails, as read connection is working
    }
    
    return true;
  } catch (error: any) {
    console.error("❌ Firestore connection test failed:", error.message);
    if (error.code) {
      console.error("❌ Firestore error code:", error.code);
      
      // Common Firebase error codes and their meanings
      const errorMessages: Record<string, string> = {
        'permission-denied': 'Permission denied - check Firestore security rules',
        'unavailable': 'Firestore service is unavailable',
        'not-found': 'Resource not found',
        'already-exists': 'Resource already exists',
        'resource-exhausted': 'Resource exhausted - quota exceeded',
        'invalid-argument': 'Invalid argument provided',
        'deadline-exceeded': 'Request deadline exceeded',
        'internal': 'Internal server error'
      };
      
      console.error("❌ Error meaning:", errorMessages[error.code] || 'Unknown error code');
    }
    return false;
  }
};

export { db, initError, isConfigured };