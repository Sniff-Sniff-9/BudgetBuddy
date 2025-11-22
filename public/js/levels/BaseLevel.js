import { auth, db, doc, getDoc, updateDoc, arrayUnion, onAuthStateChanged } from '../firebase.js';
import { addXP } from '../level_up_modal.js';  // ← Вот и всё! Только это добавили

// BaseLevel.js
export default class BaseLevel {
  constructor(config, opts = {}){
    this.config = config;
    this.mount = opts.mountPoint;
    this.root = opts.shellRoot;
  }

  async start(){
    // базовый рендер — subclasses должны переопределять render() + bind()
    if(this.render) this.render();
    if(this.bind) this.bind();
  }

  setHint(text){
    const popup = this.root.querySelector('.hint-popup');
    if(popup) popup.innerHTML = text;
  }

  showMessage(title, text, onOk){
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const msg = document.createElement('div');
    msg.className = 'game-message';
    msg.innerHTML = `
      <h2>${title}</h2>
      <p>${text}</p>
      <div style="text-align:center"><button class="btn" id="gm-ok">Ок</button></div>
    `;
    document.body.append(overlay, msg);
    document.getElementById('gm-ok').onclick = () => {
      overlay.remove(); msg.remove();
      if(typeof onOk === 'function') onOk();
    };
  }

    
  async completeLevel(options) {
    const levelId = options?.levelId || "moshenichestvo-level1";
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
          completedLevels: arrayUnion(levelId)
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
