import { 
  auth, db,
  onAuthStateChanged, 
  doc, getDoc, setDoc,
  updatePassword,
} from './firebase.js';

import {getXpForNextLevel} from './level_up_modal.js'

const chartContainer = document.getElementById('id-chart-container');
    const canvas = document.getElementById('levelsChart');
    const noLevelsMsg = document.getElementById('noLevelsMessage');
    const legend = document.querySelector('.difficulty-inner'); 

onAuthStateChanged(auth, async (user) => {
if (!user) {
    window.location.href = 'index.html';
    return;
}

try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
    alert('Профиль не найден. Пожалуйста, зарегистрируйтесь заново.');
    return;
    }

    const data = snap.data();
    currentUserData = data;

    document.getElementById('name').textContent = data.name || 'Нет данных';
    document.getElementById('username').textContent = data.username ? `@${data.username}` : 'Нет данных';
    document.getElementById('level').textContent = data.level || 1;

    const avatarEl = document.querySelector('.avatar');

   
    if (data.avatar && data.avatar.trim() !== '') {
    avatarEl.style.backgroundImage = `url(${data.avatar})`;
    } else {
   
    avatarEl.style.backgroundImage = `url('./images/Frame 6.png')`;  
    }

    avatarEl.style.backgroundSize = 'cover';
    avatarEl.style.backgroundPosition = 'center';

    const xp = data.xp || 0;
    const nextXP = getXpForNextLevel(data.level) || 0; 
    document.getElementById('xp-text').textContent = `${xp} xp / ${nextXP} xp`;
    document.getElementById('progress-fill').style.width = `${Math.min(100, (xp / nextXP) * 100)}%`;

    const completedIds = data.completedLevels || [];
    const stats = { easy: 0, medium: 0, hard: 0 };

    if (completedIds.length > 0) {
    const levelPromises = completedIds.map(id => getDoc(doc(db, "levels", id)));
    const levelSnaps = await Promise.all(levelPromises);

    levelSnaps.forEach(snap => {
        if (snap.exists()) {
        const difficulty = snap.data().difficulty;
        if (difficulty === "easy") stats.easy++;
        else if (difficulty === "medium") stats.medium++;
        else if (difficulty === "hard") stats.hard++;
        }
    });
    }

    if (user) {
    await loadProfileAchievements(user.uid);
  } else {
    showThreeLocked();
  }

    
    if (completedIds.length === 0) {
    chartContainer.classList.remove('active');
    canvas.style.display = 'none';
    legend.style.display = 'none';
    noLevelsMsg.classList.add('active');

    if (window.levelsChartInstance) {
        window.levelsChartInstance.destroy();
    }
    } else {
    chartContainer.classList.add('active');
    canvas.style.display = 'block';
    legend.style.display = 'flex';
    noLevelsMsg.classList.remove('active');

    if (window.levelsChartInstance) {
        window.levelsChartInstance.destroy();
    }

    const safeData = [
        stats.easy ,
        stats.medium ,
        stats.hard 
    ];

    console.log(safeData);

    window.levelsChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
        datasets: [{
            data: safeData,
            backgroundColor: ['#B280F0', '#7A45BC', '#62329E'],
            borderWidth: 0
        }]
        },
        options: {
        rotation: -90,
        circumference: 180,
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        animation: {
            animateRotate: true,
            duration: 1500
        }
        }
    });
    }

} catch (error) {
    console.error("Ошибка загрузки профиля:", error);
    alert("Не удалось загрузить данные. Проверьте интернет.");
}
});



const editModal = document.getElementById('editProfileModal');
const closeModalBtn = document.getElementById('closeEditProfileModal');
const cancelBtn = document.getElementById('cancelEditProfile');
const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('currentAvatar');


let currentUserData = null;


function openEditProfileModal() {
  if (!currentUserData) {
    alert('Данные ещё загружаются...');
    return;
  }

  document.getElementById('editName').value = currentUserData.name || '';
  document.getElementById('editNickname').value = currentUserData.username || '';
  
  const avatarUrl = currentUserData.avatar || './images/Frame 6.png';
  avatarPreview.src = avatarUrl;

  
  const profileAvatar = document.querySelector('.avatar');
  if (profileAvatar) {
    profileAvatar.style.backgroundImage = `url(${avatarUrl})`;
    profileAvatar.style.backgroundSize = 'cover';
    profileAvatar.style.backgroundPosition = 'center';
  }

  editModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  editModal.style.display = 'none';
  document.body.style.overflow = '';
  document.getElementById('editProfileForm').reset();
  document.getElementById('editPassword').value = '';
}

closeModalBtn.onclick = cancelBtn.onclick = closeEditModal;
editModal.onclick = e => { if (e.target === editModal) closeEditModal(); };


avatarInput.onchange = () => {
  const file = avatarInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => avatarPreview.src = e.target.result;
    reader.readAsDataURL(file);
  }
};


document.getElementById('editProfileForm').addEventListener('submit', async e => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const updates = {
    name: document.getElementById('editName').value.trim(),
    username: document.getElementById('editNickname').value.trim(),
  };

  
  const newPassword = document.getElementById('editPassword').value;
  if (newPassword) {
    try {
      await updatePassword(user, newPassword);
      alert('Пароль изменён!');
    } catch (err) {
      alert('Ошибка смены пароля: ' + err.message);
      return;
    }
  }

  
  if (avatarInput.files[0]) {
    const file = avatarInput.files[0];
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 400;
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) { height *= maxSize / width; width = maxSize; }
      } else {
        if (height > maxSize) { width *= maxSize / height; height = maxSize; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(async blob => {
        const reader = new FileReader();
        reader.onload = async () => {
          updates.avatar = reader.result;
          await saveProfile(updates);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    };
    img.src = URL.createObjectURL(file);
    return;
  }

  
  await saveProfile(updates);
});

async function saveProfile(updates) {
  try {
    await setDoc(doc(db, "users", auth.currentUser.uid), updates, { merge: true });
    alert('Профиль успешно обновлён!');
    closeEditModal();
    location.reload();
  } catch (err) {
    console.error(err);
    alert('Ошибка сохранения');
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('editProfileBtn');
  if (btn) {
    btn.addEventListener('click', openEditProfileModal);
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  if (confirm('Выйти из аккаунта?')) {
    await auth.signOut();
    window.location.href = 'index.html';
  }
});



const achievementIconsContainer = document.querySelector('.achievement-icons');

async function loadProfileAchievements(userId) {
  if (!userId) {
    showThreeLocked();
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      showThreeLocked();
      return;
    }

    const data = userDoc.data();
    const completedIds = data.completedAchievements || []; 

 
    if (completedIds.length === 0) {
      showThreeLocked();
      return;
    }

   
    const idsToShow = completedIds.slice(0, 3);

    
    const promises = idsToShow.map(id => 
      getDoc(doc(db, 'achievements', id))
    );
    const snaps = await Promise.all(promises);

    const achievements = [];
    snaps.forEach((snap, i) => {
      if (snap.exists()) {
        const meta = snap.data();
        achievements.push({
          icon: meta.icon || 'default_achievement.png',
          name: meta.name || 'Достижение'
        });
      }
    });

    
    renderAchievements(achievements);

  } catch (err) {
    console.error('Ошибка загрузки достижений:', err);
    showThreeLocked();
  }
}

function renderAchievements(unlocked = []) {
  achievementIconsContainer.innerHTML = '';


  unlocked.forEach(ach => {
    const div = document.createElement('div');
    div.className = 'achievement-icon unlocked';
    div.style.backgroundImage = `url(./images/${ach.icon})`;
    div.title = ach.name;
    achievementIconsContainer.appendChild(div);
  });


  const emptyCount = 3 - unlocked.length;
  for (let i = 0; i < emptyCount; i++) {
    const div = document.createElement('div');
    div.className = 'achievement-icon locked';
    achievementIconsContainer.appendChild(div);
  }
}

function showThreeLocked() {
  achievementIconsContainer.innerHTML = `
    <div class="achievement-icon locked"></div>
    <div class="achievement-icon locked"></div>
    <div class="achievement-icon locked"></div>
  `;
}
