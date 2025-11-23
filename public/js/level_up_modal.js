import { auth, db, doc, getDoc, updateDoc, onAuthStateChanged } from './firebase.js';



export const getXpForNextLevel = (level) => {
  if (level <= 1) return 250;
  return 250 + (level - 1) * 100; 
};



export async function addXP(amount) {
  if (!auth.currentUser) return;

  const userRef = doc(db, "users", auth.currentUser.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  let level = data.level || 1;
  let xp = data.xp || 0; 

  const previousLevel = level;

  xp += amount;


  while (xp >= getXpForNextLevel(level)) {
    xp -= getXpForNextLevel(level);
    level++;
  }

  
  await updateDoc(userRef, { level, xp });

  
  if (level > previousLevel) {
    localStorage.setItem('pendingLevelUp', level); 
  }
}


export function initLevelUpChecker() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const pendingLevel = localStorage.getItem('pendingLevelUp');
    if (!pendingLevel) return;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const currentLevel = snap.data().level || 1;

   
    if (currentLevel >= pendingLevel) {
      showLevelUpModal(currentLevel);
      localStorage.removeItem('pendingLevelUp');
      localStorage.setItem('lastKnownLevel', currentLevel);
    }
  });
}


export function showLevelUpModal(level) {
  const modal = document.getElementById('levelUpModal');
  if (!modal) return;

  document.getElementById('newLevel').textContent = level;
  document.getElementById('newLevelText').textContent = level + ' уровня';

  modal.style.display = 'flex';
}

window.closeLevelUpModal = () => {
  const modal = document.getElementById('levelUpModal');
  if (modal) modal.style.display = 'none';
};

