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
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp, arrayUnion } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UAParser } from "ua-parser-js";

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

/* ── Record Session (Real-time) ── */
async function recordSession(firebaseUser) {
  const parser = new UAParser();
  const result = parser.getResult();
  const deviceLabel = `${result.browser.name || "Unknown Browser"} on ${result.os.name || "Unknown OS"}`;
  const sessionId = Math.random().toString(36).slice(2, 9);
  
  // Store locally to identify "this" session
  sessionStorage.setItem("sm_session_id", sessionId);

  const ref = doc(db, "users", firebaseUser.uid);
  await updateDoc(ref, {
    lastSeen: serverTimestamp(),
    sessions: arrayUnion({
      id: sessionId,
      label: deviceLabel,
      lastActive: Date.now(),
      userAgent: navigator.userAgent,
    })
  }).catch(() => {}); // Ignore if doc doesn't exist yet
}

export function getCurrentSessionId() {
  return sessionStorage.getItem("sm_session_id");
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
      sessions:  [],
      settings: {
        notifications: { email: true, browser: true, security: true, newFeatures: false },
        explorer: "Etherscan"
      }
    });
  }
  await recordSession(firebaseUser);
}

/* ── Sign In with email ── */
export async function signInWithEmail(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await recordSession(cred.user);
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
    console.error("Google Auth Error:", e.code, e.message);
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
    metadata: {
        lastSignInTime: firebaseUser.metadata.lastSignInTime,
        creationTime: firebaseUser.metadata.creationTime,
    }
  };
}

/* ── Real-time User Listener ── */
export function subscribeToUser(uid, callback) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

/* ── Update Profile (Auth + Firestore) ── */
export async function updateUserProfile(uid, data) {
  try {
    const user = auth.currentUser;
    if (user && data.name) {
      await updateProfile(user, { displayName: data.name, photoURL: data.photoURL });
    }
    await updateDoc(doc(db, "users", uid), data);
    return { error: null };
  } catch (e) {
    return { error: "Failed to update profile." };
  }
}

/* ── Update Settings ── */
export async function updateUserSettings(uid, settings) {
    try {
        await updateDoc(doc(db, "users", uid), { settings });
        return { error: null };
    } catch (e) {
        return { error: "Failed to update settings." };
    }
}

/* ── Update Security (2FA, etc) ── */
export async function updateUserSecurity(uid, security) {
  try {
    await updateDoc(doc(db, "users", uid), { security });
    return { error: null };
  } catch (e) {
    return { error: "Failed to update security settings." };
  }
}

/* ── Change Password (Re-auth required) ── */
export async function updateUserPassword(currentPassword, newPassword) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user");
    
    // Re-authenticate
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update
    await updatePassword(user, newPassword);
    return { error: null };
  } catch (e) {
    return { error: mapFirebaseError(e.code) || "Password update failed." };
  }
}
