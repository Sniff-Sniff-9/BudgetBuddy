import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  getDoc,
  updateDoc,
  updateEmail,
  updatePassword
} from './js/firebase.js';

// Загружаем HTML модального окна и вставляем на страницу
(async () => {
  const res = await fetch('../profile_edit_modal.html');
  const html = await res.text();
  document.body.insertAdjacentHTML("beforeend", html);

  initModalLogic(); // запускаем, когда HTML вставлен
})();


function initModalLogic() {
  const modal = document.getElementById("profileModal");
  const openBtn = document.getElementById("openProfileModal");
  const closeBtn = document.getElementById("closeProfileModal");

  const form = document.getElementById("editProfileForm");
  const err = document.getElementById("profileEditError");

  const fName = document.getElementById("editName");
  const fUsername = document.getElementById("editUsername");
  const fEmail = document.getElementById("editEmail");
  const fPass = document.getElementById("editPassword");
  const fPass2 = document.getElementById("editPasswordConfirm");
  const fAvatar = document.getElementById("editAvatar");

  let currentUser = null;
  let userData = null;

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    currentUser = user;

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;

    userData = snap.data();

    fName.value = userData.name || "";
    fUsername.value = userData.username || "";
    fEmail.value = user.email || "";
  });

  // Открытие
  openBtn.addEventListener("click", () => {
    modal.classList.add("active");
    err.textContent = "";
  });

  // Закрытие
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  // Сохранение
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.textContent = "";

    if (fPass.value !== fPass2.value) {
      err.textContent = "Пароли не совпадают";
      return;
    }

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        name: fName.value,
        username: fUsername.value
        // avatar — позже
      });

      if (fEmail.value && fEmail.value !== currentUser.email) {
        await updateEmail(currentUser, fEmail.value);
      }

      if (fPass.value.length > 0) {
        await updatePassword(currentUser, fPass.value);
      }

      modal.classList.remove("active");
      alert("Профиль обновлен!");
      location.reload();

    } catch (error) {
      err.textContent = error.message;
    }
  });
}
