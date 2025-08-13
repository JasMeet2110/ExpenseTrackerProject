import { Platform } from "react-native";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCO1yKXz9rN2mOjjjk_cGvmmqqNAunKOPM",
  authDomain: "expensetrackerapp-7107b.firebaseapp.com",
  projectId: "expensetrackerapp-7107b",
  storageBucket: "expensetrackerapp-7107b.appspot.com",
  messagingSenderId: "370331210488",
  appId: "1:370331210488:web:b070338b9590a6f5d0610d",
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

let auth = getAuth(app);

if (Platform.OS !== "web") {
  try {
    const rn = require("firebase/auth/react-native");
    auth = initializeAuth(app, {
      persistence: rn.getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    console.warn(
      "[firebase] React Native persistence not available; using in-memory auth.",
      (e as Error)?.message
    );
    auth = getAuth(app);
  }
}

const db = getFirestore(app);

export { app, auth, db };
