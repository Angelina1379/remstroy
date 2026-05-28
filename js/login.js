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

```
alert("Заполните все поля");

return;
```

}

try{

```
const userCredential =
await signInWithEmailAndPassword(
  auth,
  email,
  password
);

const user =
userCredential.user;

console.log("Вход выполнен");

const userRef =
doc(
  db,
  "users",
  user.uid
);

const userSnap =
await getDoc(userRef);

if(!userSnap.exists()){

  alert(
    "Данные пользователя не найдены"
  );

  return;

}

const userData =
userSnap.data();

console.log(userData);

alert("Вход выполнен");

if(
  userData.role ===
  "manager"
){

  window.location.href =
  "manager/manager-cabinet.html";

}

else if(
  userData.role ===
  "admin"
){

  window.location.href =
  "admin/admin-panel.html";

}

else{

  window.location.href =
  "client/client-cabinet.html";

}
```

}

catch(error){

```
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
```

}

});
