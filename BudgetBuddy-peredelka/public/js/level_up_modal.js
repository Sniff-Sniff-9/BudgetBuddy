import { auth, db, doc, getDoc, updateDoc, onAuthStateChanged } from './firebase.js';


// Сколько XP нужно для перехода с level → level+1
export const getXpForNextLevel = (level) => {
  if (level <= 1) return 250;
  return 250 + (level - 1) * 100; // 250, 350, 450, 550, 650...
};

// Добавляет XP и сразу повышает уровень, если нужно
// Вызывается из любого файла уровня после победы
export async function addXP(amount) {
  if (!auth.currentUser) return;

  const userRef = doc(db, "users", auth.currentUser.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  let level = data.level || 1;
  let xp = data.xp || 0; // остаток XP в текущем уровне

  const previousLevel = level;

  xp += amount;

  // Поднимаем уровень, пока хватает XP
  while (xp >= getXpForNextLevel(level)) {
    xp -= getXpForNextLevel(level);
    level++;
  }

  // Сохраняем в Firestore
  await updateDoc(userRef, { level, xp });

  // Сохраняем в localStorage, чтобы потом показать модалку
  if (level > previousLevel) {
    localStorage.setItem('pendingLevelUp', level); // запоминаем, что надо показать
  }
}

// Эту функцию вызываешь один раз при загрузке themes-levels.html
export function initLevelUpChecker() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const pendingLevel = localStorage.getItem('pendingLevelUp');
    if (!pendingLevel) return;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const currentLevel = snap.data().level || 1;

    // Если уровень действительно вырос — показываем модалку
    if (currentLevel >= pendingLevel) {
      showLevelUpModal(currentLevel);
      localStorage.removeItem('pendingLevelUp');
      localStorage.setItem('lastKnownLevel', currentLevel);
    }
  });
}

// Показывает модалку (только если есть элемент в DOM)
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