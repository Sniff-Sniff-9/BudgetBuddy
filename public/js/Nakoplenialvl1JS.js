// nakopleniya_level1.js — ПОЛНЫЙ РАБОЧИЙ КОД

import { auth, db, doc, getDoc, updateDoc, arrayUnion, increment, onAuthStateChanged } from './firebase.js';

// === ПРОВЕРКА АВТОРИЗАЦИИ ===
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert('Войдите в аккаунт!');
    window.location.href = 'login.html';
  }
});

// === ИГРОВАЯ ЛОГИКА ===
document.addEventListener('DOMContentLoaded', () => {
  // Инициализация значений
  const totalIncome = 50000;
  const fixedExpenses = 30000;
  const availableBudget = totalIncome - fixedExpenses;
  const goalAmount = 8000;

  // Элементы управления
  const foodInput = document.getElementById('foodInput');
  const funInput = document.getElementById('funInput');
  const clothesInput = document.getElementById('clothesInput');
  const savingsInput = document.getElementById('savingsInput');

  const foodMinus = document.getElementById('foodMinus');
  const foodPlus = document.getElementById('foodPlus');
  const funMinus = document.getElementById('funMinus');
  const funPlus = document.getElementById('funPlus');
  const clothesMinus = document.getElementById('clothesMinus');
  const clothesPlus = document.getElementById('clothesPlus');
  const savingsMinus = document.getElementById('savingsMinus');
  const savingsPlus = document.getElementById('savingsPlus');

  const remainingAmount = document.getElementById('remainingAmount');
  const progressFill = document.getElementById('progressFill');
  const resetButton = document.getElementById('resetBtn');
  const submitButton = document.getElementById('submitBtn');
  const hintIndicator = document.querySelector('.hint-indicator');
  const hintPopup = document.querySelector('.hint-popup');

  // === ПОДСКАЗКА ===
  hintIndicator.addEventListener('click', (e) => {
    e.stopPropagation();
    hintPopup.classList.toggle('show');
  });
  document.addEventListener('click', () => hintPopup.classList.remove('show'));

  // === ФОРМАТИРОВАНИЕ ===
  function formatCurrency(value) {
    return parseInt(value).toLocaleString('ru-RU') + ' ₽';
  }

  // === ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ===
  function updateAmounts() {
    document.getElementById('foodAmount').textContent = formatCurrency(foodInput.value);
    document.getElementById('funAmount').textContent = formatCurrency(funInput.value);
    document.getElementById('clothesAmount').textContent = formatCurrency(clothesInput.value);
    document.getElementById('savingsAmount').textContent = formatCurrency(savingsInput.value);
    updateRemainingAmount();
    updateProgressBar();
  }

  // === РЕГУЛИРОВАНИЕ ЗНАЧЕНИЙ ===
  function adjustValue(input, change) {
    let currentValue = parseInt(input.value) || 0;
    const newValue = currentValue + change;
    if (newValue >= 0) {
      input.value = newValue;
      updateAmounts();
    }
  }

  // === КНОПКИ + / - ===
  foodMinus.addEventListener('click', () => adjustValue(foodInput, -500));
  foodPlus.addEventListener('click', () => adjustValue(foodInput, 500));
  funMinus.addEventListener('click', () => adjustValue(funInput, -500));
  funPlus.addEventListener('click', () => adjustValue(funInput, 500));
  clothesMinus.addEventListener('click', () => adjustValue(clothesInput, -500));
  clothesPlus.addEventListener('click', () => adjustValue(clothesInput, 500));
  savingsMinus.addEventListener('click', () => adjustValue(savingsInput, -500));
  savingsPlus.addEventListener('click', () => adjustValue(savingsInput, 500));

  // === СБРОС ===
  resetButton.addEventListener('click', () => {
    foodInput.value = 6000;
    funInput.value = 5000;
    clothesInput.value = 3000;
    savingsInput.value = 6000;
    updateAmounts();
  });

  // === ОСТАТОК ===
  function getRemainingAmount() {
    const total = 
      parseInt(foodInput.value) + 
      parseInt(funInput.value) + 
      parseInt(clothesInput.value) + 
      parseInt(savingsInput.value);
    return availableBudget - total;
  }

  function updateRemainingAmount() {
    const remaining = getRemainingAmount();
    remainingAmount.textContent = formatCurrency(remaining);
    remainingAmount.style.color = remaining === 0 ? 'var(--success)' : remaining > 0 ? 'var(--accent)' : 'var(--danger)';
  }

  // === ПРОГРЕСС-БАР ===
  function updateProgressBar() {
    const savings = parseInt(savingsInput.value);
    const progress = Math.min((savings / goalAmount) * 100, 100);
    progressFill.style.width = `${progress}%`;
  }

  // === ПРОВЕРКА РЕШЕНИЯ ===
  submitButton.addEventListener('click', async () => {
    const savings = parseInt(savingsInput.value);
    const remaining = getRemainingAmount();

    // Создаем overlay и окно с сообщением
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const message = document.createElement('div');
    message.className = 'game-message';

    let title, text;

    if (remaining !== 0) {
        title = "Внимание!";
        text = "Сначала распределите все доступные средства!";
    } else if (savings >= goalAmount) {
        title = "Поздравляем!";
        text = `Вы достигли цели накоплений!\n\nОтличное распределение бюджета!`;
    } else {
        title = "Цель не достигнута";
        text = `Нужно ещё ${goalAmount - savings} ₽.\n\nПопробуйте уменьшить траты на развлечения или одежду.`;
    }

    message.innerHTML = `
        <h2>${title}</h2>
        <p>${text.replace(/\n/g, '<br>')}</p>
        <button class="action-btn submit-btn" id="complete-btn">Ок</button>
    `;

    document.body.append(overlay, message);

    document.getElementById('complete-btn').onclick = async () => {
        overlay.remove();
        message.remove();

        // Если цель достигнута — выполняем завершение уровня
        if (remaining === 0 && savings >= goalAmount) {
            await completeLevel();
        }
    };
});

  // === ПРОХОЖДЕНИЕ УРОВНЯ ===
  async function completeLevel() {
    const user = auth.currentUser;
    if (!user) return;

    const levelId = "nakopleniya-level1";
    const topic = "nakopleniya";
    const xp = 100;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const data = snap.data() || {};

    if (!data.completedLevels?.includes(levelId)) {
      await updateDoc(userRef, {
        completedLevels: arrayUnion(levelId),
        xp: increment(xp)
      });
      alert(`+${xp} XP! Уровень пройден.`);
    } else {
      alert("Уровень уже пройден. XP не начисляется.");
    }

    // ВОЗВРАТ В СПИСОК
    window.location.href = `themes.html`;
  }

  // === СТАРТ ===
  updateAmounts();
});