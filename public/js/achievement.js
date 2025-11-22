// achievements_loader.js
import { auth, db, collection, getDocs, doc, getDoc, onAuthStateChanged } from './firebase.js';

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) return; // не авторизован → ничего не делаем

        await loadAchievements(user.uid);
    });
});

async function loadAchievements(uid) {
    const listContainer = document.getElementById("achievements-list");
    if (!listContainer) return;

    try {
        // === 1. Загружаем достижения ===
        const achRef = collection(db, "achievements");
        const snapshot = await getDocs(achRef);

        // === 2. Загружаем юзера ===
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data() || {};

        // Массивая выполненных достижений
        const completed = userData.completedAchievements || [];

        // === 3. Рендерим карточки ===
        snapshot.forEach(docSnap => {
            const ach = docSnap.data();
            const card = createAchievementCard(ach, docSnap.id, completed);
            listContainer.appendChild(card);
        });

    } catch (err) {
        console.error("Ошибка загрузки достижений:", err);
    }
}


function createAchievementCard(ach, id, completedList) {
    const card = document.createElement("div");
    card.className = "achievement-card";
    card.dataset.id = id;

    // Проверяем: есть ли достижения в списке юзера
    const unlocked = completedList.includes(id);

    card.innerHTML = `
        <div class="achievement-icon">
            <img src="./images/${ach.icon}" alt="${ach.name}">
        </div>

        <div class="achievement-info">
            <h3>${ach.name}</h3>
            <p>${ach.description}</p>
        </div>

        ${!unlocked ? `<div class="achievement-overlay"></div>` : ""}
        
    `;

    if (!unlocked) card.classList.add("locked");

    return card;
}
