import { auth, db }
from "./firebase.js";

import {
  createUserWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("register.js подключен");

const registerBtn =
document.getElementById("registerBtn");

registerBtn.addEventListener(
"click",
async () => {

  const name =
  document.getElementById("name").value.trim();

  const email =
  document.getElementById("email").value.trim();

  const password =
  document.getElementById("password").value.trim();

  // ПРОВЕРКА ПОЛЕЙ

  if(!name || !email || !password){

    alert("Заполните все поля");

    return;

  }

  try{

    // СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ

    const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user =
    userCredential.user;

    console.log("Пользователь создан");

    // СОХРАНЯЕМ В БАЗУ

    await setDoc(
      doc(db, "users", user.uid),
      {

        uid: user.uid,

        name: name,

        email: email,

        role: "client",

        createdAt:
        new Date()

      }
    );

    console.log("Данные записаны в Firestore");

    alert("Регистрация успешна");

    // ПЕРЕХОД

    window.location.href =
    "../client/client-cabinet.html";

  }

  catch(error){

    console.log(error);

    if(
      error.code ===
      "auth/email-already-in-use"
    ){

      alert(
        "Эта почта уже зарегистрирована"
      );

    }

    else if(
      error.code ===
      "auth/weak-password"
    ){

      alert(
        "Пароль должен быть минимум 6 символов"
      );

    }

    else if(
      error.code ===
      "auth/invalid-email"
    ){

      alert(
        "Введите корректный email"
      );

    }

    else if(
      error.code ===
      "auth/operation-not-allowed"
    ){

      alert(
        "В Firebase не включен Email/Password"
      );

    }

    else{

      alert(
        "Ошибка регистрации"
      );

    }

  }

});
