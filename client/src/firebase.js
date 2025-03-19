import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBMTaU4otNpvGWUxakJ8-R8u3K7O5862HA",
    authDomain: "robomo-tamk.firebaseapp.com",
    projectId: "robomo-tamk",
    storageBucket: "robomo-tamk.firebasestorage.app",
    messagingSenderId: "359990319353",
    appId: "1:359990319353:web:83fba0989c1345bdbb2a28",
    measurementId: "G-933HCLDJFZ"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
