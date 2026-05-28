import { auth, db }
from "./firebase.js";

import {
createUserWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
doc,
setDoc,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("register.js подключен");

const registerBtn =
document.getElementById("registerBtn");

registerBtn.addEventListener(
"click",
async () => {

const name =
document.getElementById("name")
.value
.trim();

const email =
document.getElementById("email")
.value
.trim();

const password =
document.getElementById("password")
.value
.trim();

if(
!name ||
!email ||
!password
){


alert(
  "Заполните все поля"
);

return;


}

try{

const userCredential =
await createUserWithEmailAndPassword(
  auth,
  email,
  password
);

const user =
userCredential.user;

await setDoc(
  doc(
    db,
    "users",
    user.uid
  ),
  {

    uid:
    user.uid,

    name:
    name,

    email:
    email,

    role:
    "client",

    createdAt:
    serverTimestamp()

  }
);

console.log(
  "Пользователь создан"
);

alert(
  "Регистрация успешна"
);

window.location.href =
"client/client-cabinet.html";


}

catch(error){

console.error(error);

switch(error.code){

  case "auth/email-already-in-use":

    alert(
      "Эта почта уже зарегистрирована"
    );

    break;

  case "auth/weak-password":

    alert(
      "Пароль должен содержать минимум 6 символов"
    );

    break;

  case "auth/invalid-email":

    alert(
      "Введите корректный email"
    );

    break;

  case "auth/operation-not-allowed":

    alert(
      "В Firebase не включен Email/Password Provider"
    );

    break;

  default:

    alert(
      "Ошибка регистрации"
    );

}


}

});
