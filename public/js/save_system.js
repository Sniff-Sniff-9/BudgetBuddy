
import { auth, db } from './firebase.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

export async function saveProgress(levelId, data) {
  if (!auth.currentUser) return;
  await setDoc(doc(db, "usersaves", auth.currentUser.uid), {
    [`saves.${levelId}`]: data
  }, { merge: true });
}

export async function loadProgress(levelId) {
  if (!auth.currentUser) return null;
  const snap = await getDoc(doc(db, "usersaves", auth.currentUser.uid));
  if (!snap.exists()) return null;
  return snap.data()?.saves?.[levelId] || null;
}

export async function clearProgress(levelId) {
  if (!auth.currentUser) return;
  await setDoc(doc(db, "usersaves", auth.currentUser.uid), {
    [`saves.${levelId}`]: null
  }, { merge: true });
}