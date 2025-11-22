import { 
  auth, db,
  onAuthStateChanged, 
  doc, getDoc, setDoc,
  updatePassword,
} from './firebase.js';

import {getXpForNextLevel} from './level_up_modal.js'

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

    // Если в базе есть аватар — используем его
    if (data.avatar && data.avatar.trim() !== '') {
    avatarEl.style.backgroundImage = `url(${data.avatar})`;
    } else {
    // Если нет — дефолтная картинка (та, что у тебя в CSS)
    avatarEl.style.backgroundImage = `url('./images/Frame 6.png')`;  // или '../images/Frame 6.png' — как у тебя в пути
    }

    // Убедись, что background-size и position остались
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

    const canvas = document.getElementById('levelsChart');
    const noLevelsMsg = document.getElementById('noLevelsMessage');
    const legend = document.querySelector('.difficulty-inner'); 
    if (completedIds.length === 0) {
    canvas.style.display = 'none';
    legend.style.display = 'none';
    noLevelsMsg.classList.add('active');

    if (window.levelsChartInstance) {
        window.levelsChartInstance.destroy();
    }
    } else {
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

// ==================== МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ПРОФИЛЯ ====================

const editModal = document.getElementById('editProfileModal');
const closeModalBtn = document.getElementById('closeEditProfileModal');
const cancelBtn = document.getElementById('cancelEditProfile');
const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('currentAvatar');

// Глобальная переменная, чтобы не делать getDoc два раза
let currentUserData = null;

// Открытие модалки — теперь используем уже загруженные данные!
function openEditProfileModal() {
  if (!currentUserData) {
    alert('Данные ещё загружаются...');
    return;
  }

  document.getElementById('editName').value = currentUserData.name || '';
  document.getElementById('editNickname').value = currentUserData.username || '';
  
  const avatarUrl = currentUserData.avatar || './images/Frame 6.png';
  avatarPreview.src = avatarUrl;

  // Обновляем аватар на главной странице профиля
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

// Предпросмотр выбранного аватара
avatarInput.onchange = () => {
  const file = avatarInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => avatarPreview.src = e.target.result;
    reader.readAsDataURL(file);
  }
};

// Сохранение (с base64 и сжатием)
document.getElementById('editProfileForm').addEventListener('submit', async e => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const updates = {
    name: document.getElementById('editName').value.trim(),
    username: document.getElementById('editNickname').value.trim(),
  };

  // Смена пароля
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

  // Аватар → base64 с сжатием
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

  // Если аватара нет — сохраняем сразу
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

// ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
// ВОТ ЭТО САМОЕ ГЛАВНОЕ — ПОДКЛЮЧЕНИЕ КНОПКИ (в самый конец файла!)
// ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
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
