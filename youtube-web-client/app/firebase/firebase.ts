// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import * as dotenv from 'dotenv';
import { join } from 'path';
import { getFunctions } from 'firebase/functions';

export const functions = getFunctions();

dotenv.config({ path: join(__dirname, '.env') });

const apiKey = process.env.API_KEY;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: apiKey, // replace it with actual string during local testing
  authDomain: "clone-1b438.firebaseapp.com",
  projectId: "clone-1b438",
  appId: "1:936143624285:web:77d515e069dceade2c95b4",
  measurementId: "G-N6Q61HWB0X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

/**
 * Signs the user in using Google Auth
 * @returns {Promise<User>} A promise that resolves the user credentials
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs the user out
 */
export function signOut() {
    return auth.signOut();
}

/**
 * Trigger a callback when user auth state changes
 * @returns A function to unsubsribe callback
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}