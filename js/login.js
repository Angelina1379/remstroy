import { auth, db } from "./firebase.js";

import {
signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginBtn =
document.getElementById("loginBtn");

loginBtn.addEventListener(
"click",
async () => {


const email =
document.getElementById("email")
.value
.trim();

const password =
document.getElementById("password")
.value
.trim();

if(!email || !password){

  alert("Заполните все поля");

  return;

}

try {

  console.log("Начинаем вход");

  const userCredential =
  await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  console.log("Авторизация успешна");

  const user =
  userCredential.user;

  console.log("UID:", user.uid);

  const userRef =
  doc(
    db,
    "users",
    user.uid
  );

  console.log("Получаем документ");

  const userSnap =
  await getDoc(userRef);

  console.log("Документ получен");

  if (!userSnap.exists()) {

    alert(
      "Документ пользователя отсутствует"
    );

    return;

  }

  const userData =
  userSnap.data();

  console.log(
    "Данные пользователя:",
    userData
  );

  alert(
    "Роль: " +
    userData.role
  );

  if (
    userData.role ===
    "manager"
  ) {

    console.log(
      "Переход в кабинет менеджера"
    );

    window.location.href =
    "manager/manager-panel.html";

  }

  else {

    console.log(
      "Переход в кабинет клиента"
    );

    window.location.href =
    "client/client-cabinet.html";

  }

}
catch(error){

  console.error(
    "ОШИБКА:",
    error
  );

  alert(
    error.message
  );

}

});
