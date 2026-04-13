// ============================================================
// FIRESTORE SERVICE — SmartGuard audit persistence
// Matches existing Firestore structure: "scans" collection
// ============================================================
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/* ── Save an audit result to the "scans" collection ── */
export async function saveAuditResult(uid, userEmail, contractCode, result) {
  if (!uid) return null;
  try {
    const ref  = collection(db, "scans");
    const docRef = await addDoc(ref, {
      userId:       uid,
      userEmail:    userEmail || "",
      filename:     "pasted_code",
      contractCode: contractCode.slice(0, 8000),
      verdict:      result.verdict,
      score:        result.score,
      confidence:   result.confidence || 0,
      issues:       result.issues?.length || 0,
      issueDetails: result.issues || [],
      timestamp:    serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Firestore save error:", e);
    return null;
  }
}

/* ── Get audit history for a specific user ── */
export async function getAuditHistory(uid, n = 20) {
  if (!uid) return [];
  try {
    const ref  = collection(db, "scans");
    const q    = query(
      ref,
      where("userId", "==", uid),
      orderBy("timestamp", "desc"),
      limit(n)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Firestore fetch error:", e);
    return [];
  }
}
