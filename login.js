import { auth }
from "./firebase.js";

import {
  signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

    alert("Заполните поля");

    return;

  }

  try{

    const userCredential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user =
    userCredential.user;

    console.log(user);

    alert("Вход выполнен");

    window.location.href =
    "client-cabinet.html";

  }

  catch(error){

    console.log(error);

    if(
      error.code ===
      "auth/invalid-credential"
    ){

      alert(
        "Неверная почта или пароль"
      );

    }

    else{

      alert(
        "Ошибка входа"
      );

    }

  }

});