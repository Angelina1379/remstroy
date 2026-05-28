import { auth, db }
from "./firebase.js";

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

try{

  const userCredential =
  await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user =
  userCredential.user;

  const userSnap =
  await getDoc(
    doc(
      db,
      "users",
      user.uid
    )
  );

  if(!userSnap.exists()){

    alert(
      "Пользователь не найден"
    );

    return;

  }

  const userData =
  userSnap.data();

  if(
    userData.role ===
    "manager"
  ){

    window.location.href =
    "manager/manager-cabinet.html";

  }

  else{

    window.location.href =
    "client/client-cabinet.html";

  }

}

catch(error){

  console.log(error);

  alert(
    "Неверная почта или пароль"
  );

}


}
);
