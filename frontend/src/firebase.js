// ============================================================
// FIREBASE — SmartGuard Project (smartguard-2d3fa)
// ============================================================
import { initializeApp } from "firebase/app";
import { getAuth }       from "firebase/auth";
import { getFirestore }  from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyCwblR_VOhqbm37nVeVxjlmXjhSgZbSsS0",
  authDomain:        "smartguard-2d3fa.firebaseapp.com",
  projectId:         "smartguard-2d3fa",
  storageBucket:     "smartguard-2d3fa.firebasestorage.app",
  messagingSenderId: "464230548393",
  appId:             "1:464230548393:web:db28703879541640c6fab8",
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
