import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBD_2mFqrYNVwZoBnBy_JILtckfOhF0nL0",
  authDomain: "codegame-8730b.firebaseapp.com",
  projectId: "codegame-8730b",
  storageBucket: "codegame-8730b.firebasestorage.app",
  messagingSenderId: "408753008833",
  appId: "1:408753008833:web:86ecd8f3d659187327a440"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
