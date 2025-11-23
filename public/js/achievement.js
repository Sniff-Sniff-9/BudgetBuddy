
import { auth, db, collection, getDocs, doc, getDoc, onAuthStateChanged } from './firebase.js';

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) return; 

        await loadAchievements(user.uid);
    });
});

async function loadAchievements(uid) {
    const listContainer = document.getElementById("achievements-list");
    if (!listContainer) return;

    try {
        
        const achRef = collection(db, "achievements");
        const snapshot = await getDocs(achRef);

      
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data() || {};

        
        const completed = userData.completedAchievements || [];

        
        const achievements = [];
        
        snapshot.forEach(docSnap => {
            const ach = docSnap.data();
            const unlocked = completed.includes(docSnap.id);
            achievements.push({
                id: docSnap.id,
                data: ach,
                unlocked: unlocked
            });
        });

       
        achievements.sort((a, b) => {
            if (a.unlocked && !b.unlocked) return -1;
            if (!a.unlocked && b.unlocked) return 1;  
            return 0; 
        });

        
        achievements.forEach(ach => {
            const card = createAchievementCard(ach.data, ach.id, completed);
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