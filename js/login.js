import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ===== TOAST ===== */

const toast = document.getElementById("toast");

function showToast(message, type = "success") {
  if (!toast) return;
  toast.innerText = message;
  toast.className = "";
  toast.classList.add(type === "success" ? "toast-success" : "toast-error");
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

/* ===== ВАЛИДАЦИЯ ===== */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ===== ПЕРЕКЛЮЧЕНИЕ ФОРМ ===== */

function showForm(id) {
  ["loginForm", "registerForm", "forgotForm"].forEach((formId) => {
    const el = document.getElementById(formId);
    if (el) el.style.display = formId === id ? "block" : "none";
  });
}

document.getElementById("goRegister")?.addEventListener("click", (e) => {
  e.preventDefault();
  showForm("registerForm");
});

document.getElementById("goForgot")?.addEventListener("click", (e) => {
  e.preventDefault();
  showForm("forgotForm");
});

document.querySelectorAll(".goLogin").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    showForm("loginForm");
  });
});

/* ===== РЕДИРЕКТ ПО РОЛИ ===== */

async function redirectByRole(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    showToast("Профиль пользователя не найден", "error");
    return;
  }

  const userData = userSnap.data();

  if (userData.role === "manager") {
    window.location.href = "manager/manager-panel.html";
  } else {
    window.location.href = "client/client-cabinet.html";
  }
}

/* ===== ВХОД ===== */

const loginBtn = document.getElementById("loginBtn");

loginBtn?.addEventListener("click", async () => {
  const email = document.getElementById("email")?.value.trim() || "";
  const password = document.getElementById("password")?.value.trim() || "";

  if (!email) {
    showToast("Введите Email", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showToast("Некорректный Email", "error");
    return;
  }

  if (password.length < 6) {
    showToast("Пароль должен содержать минимум 6 символов", "error");
    return;
  }

  loginBtn.disabled = true;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showToast("Вход выполнен");
    await redirectByRole(userCredential.user);
  } catch (error) {
    console.log(error);
    showToast("Неверный Email или пароль", "error");
  } finally {
    loginBtn.disabled = false;
  }
});

/* ===== ВОССТАНОВЛЕНИЕ ПАРОЛЯ (по Email) ===== */

const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

forgotPasswordBtn?.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("forgotEmail")?.value.trim() || "";

  if (!email) {
    showToast("Введите Email", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showToast("Некорректный Email", "error");
    return;
  }

  forgotPasswordBtn.disabled = true;

  try {
    await sendPasswordResetEmail(auth, email);
    showToast("Письмо для сброса пароля отправлено на Email");
    setTimeout(() => showForm("loginForm"), 1500);
  } catch (error) {
    console.log(error);
    showToast("Не удалось отправить письмо", "error");
  } finally {
    forgotPasswordBtn.disabled = false;
  }
});

/* ===== РЕГИСТРАЦИЯ ===== */

const registerBtn = document.getElementById("registerBtn");

registerBtn?.addEventListener("click", async () => {
  const name = document.getElementById("regName")?.value.trim() || "";
  const email = document.getElementById("regEmail")?.value.trim() || "";
  const phone = document.getElementById("regPhone")?.value.trim() || "";
  const password = document.getElementById("regPassword")?.value.trim() || "";

  if (!name || !email || !phone || !password) {
    showToast("Заполните все поля", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showToast("Некорректный Email", "error");
    return;
  }

  if (password.length < 6) {
    showToast("Пароль должен содержать минимум 6 символов", "error");
    return;
  }

  registerBtn.disabled = true;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      phone: phone,
      role: "client",
      createdAt: new Date().toISOString()
    });

    showToast("Аккаунт успешно создан");

    setTimeout(() => {
      window.location.href = "client/client-cabinet.html";
    }, 1500);
  } catch (error) {
    console.log(error);

    if (error.code === "auth/email-already-in-use") {
      showToast("Email уже используется", "error");
    } else {
      showToast("Ошибка регистрации", "error");
    }
  } finally {
    registerBtn.disabled = false;
  }
});
