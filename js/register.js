// Firebase
import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// CONFIG

const firebaseConfig = {

  apiKey: "AIzaSyBuV2dJLDPxsk6E50e5p0E5Buk_NAc46-E",

  authDomain: "remont-f7644.firebaseapp.com",

  projectId: "remont-f7644",

  storageBucket: "remont-f7644.firebasestorage.app",

  messagingSenderId: "404840020044",

  appId: "1:404840020044:web:f81c9613321ac170c19ce9"

};



// INIT

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

const db =
getFirestore(app);



// ЖДЕМ ЗАГРУЗКУ HTML

window.addEventListener(
"DOMContentLoaded",
() => {

  console.log("HTML загружен");



  const registerBtn =
  document.getElementById("registerBtn");



  console.log(registerBtn);



  registerBtn.addEventListener(
  "click",
  async () => {

    const name =
    document.getElementById("name").value;

    const email =
    document.getElementById("email").value;

    const password =
    document.getElementById("password").value;



    // ПРОВЕРКА

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



      alert("Регистрация успешна");



      window.location.href =
      "client-dashboard.html";



    }catch(error){

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

      else{

        alert(
          "Ошибка регистрации"
        );

      }

    }

  });

});