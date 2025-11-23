import { auth, db, doc, getDoc, updateDoc, arrayUnion, onAuthStateChanged } from '../firebase.js';
import { addXP } from '../level_up_modal.js';  


export default class BaseLevel {
  constructor(config, opts = {}){
    this.config = config;
    this.mount = opts.mountPoint;
    this.root = opts.shellRoot;
  }

  async start(){
    
    
    if(this.render) this.render();
    if(this.bind) this.bind();

  }

  setHint(text){
    const popup = this.root.querySelector('.hint-popup');
    if(popup) popup.innerHTML = text;
  }

showMessage(title, text, buttons = []) {
  
  if (typeof buttons === 'function') {
    buttons = [{ text: 'Ок', action: buttons, primary: true }];
  }

 
  if (!Array.isArray(buttons)) {
    buttons = [buttons];
  }

 
  if (buttons.length === 0) {
    buttons = [{ text: 'Ок', action: () => {}, primary: true }];
  }

  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  const msg = document.createElement('div');
  msg.className = 'game-message';

 
  const buttonsHtml = buttons
    .map(btn => {
      const cls = btn.primary ? 'btn-primary' : 'btn-secondary';
      return `<button class="btn ${cls}" data-action="${buttons.indexOf(btn)}">${btn.text}</button>`;
    })
    .join('');

  msg.innerHTML = `
    <h2>${title}</h2>
    <p>${text}</p>
    <div class="message-buttons">
      ${buttonsHtml}
    </div>
  `;

  document.body.append(overlay, msg);

 
  msg.querySelectorAll('[data-action]').forEach(btnEl => {
    const idx = btnEl.dataset.action;
    btnEl.onclick = () => {
      overlay.remove();
      msg.remove();
      if (typeof buttons[idx].action === 'function') {
        buttons[idx].action();
      }
    };
  });
}

async autosave() {
  if (this.getSaveData) {
    await saveProgress(this.config.id, this.getSaveData());
  }
}
    
  async completeLevel(options) {
  
    const levelId = options?.levelId || "moshenichestvo-level1";
    const achievementId =  options?.achievementId;
    const xp = options?.xp || 100;
    const redirect = options?.redirect || 'levels.html?topic=moshenichestvo';

    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const data = snap.data() || {};

    if (!data.completedLevels?.includes(levelId)) {
      alert(`+${xp} XP! Уровень пройден.`);
      await addXP(xp);

      try {
        await updateDoc(userRef, {
          completedLevels: arrayUnion(levelId),
          completedAchievements: arrayUnion(achievementId)
        });
      } catch (e) {
        console.warn('Не удалось сохранить прогресс уровня:', e);
      }
    } else {
      alert("Уровень уже пройден. XP не начисляется.");
    }

    window.location.href = redirect;
  }
  
}
