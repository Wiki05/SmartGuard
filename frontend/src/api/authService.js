// ============================================================
// AUTH SERVICE — wraps Firebase Auth
// ============================================================
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const googleProvider = new GoogleAuthProvider();

/* ── helpers ── */
function mapFirebaseError(code) {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    default:
      return "Authentication failed. Please try again.";
  }
}

/* ── Ensure Firestore user doc exists ── */
async function ensureUserDoc(firebaseUser, displayName) {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:       firebaseUser.uid,
      email:     firebaseUser.email,
      name:      displayName || firebaseUser.displayName || firebaseUser.email.split("@")[0],
      photoURL:  firebaseUser.photoURL || null,
      createdAt: serverTimestamp(),
      plan:      "free",
    });
  }
}

/* ── Sign In with email ── */
export async function signInWithEmail(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { user: cred.user, error: null };
  } catch (e) {
    return { user: null, error: mapFirebaseError(e.code) };
  }
}

/* ── Sign Up with email ── */
export async function signUpWithEmail(email, password, name) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await ensureUserDoc(cred.user, name);
    return { user: cred.user, error: null };
  } catch (e) {
    return { user: null, error: mapFirebaseError(e.code) };
  }
}

/* ── Google Sign-In ── */
export async function signInWithGoogle() {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(cred.user, cred.user.displayName);
    return { user: cred.user, error: null };
  } catch (e) {
    return { user: null, error: mapFirebaseError(e.code) };
  }
}

/* ── Sign Out ── */
export async function signOutUser() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (e) {
    return { error: "Sign out failed." };
  }
}

/* ── Auth state listener ── */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/* ── Normalise Firebase user → plain object ── */
export function normalizeUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid:      firebaseUser.uid,
    email:    firebaseUser.email,
    name:     firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
    photoURL: firebaseUser.photoURL || null,
  };
}
