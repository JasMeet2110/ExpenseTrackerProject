import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCO1yKXz9rN2mOjjjk_cGvmmqqNAunKOPM",
  authDomain: "expensetrackerapp-7107b.firebaseapp.com",
  projectId: "expensetrackerapp-7107b",
  storageBucket: "expensetrackerapp-7107b.appspot.com",
  messagingSenderId: "370331210488",
  appId: "1:370331210488:web:b070338b9590a6f5d0610d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);