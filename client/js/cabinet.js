import { auth, db }
from "../../js/firebase.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
doc,
getDoc,
updateDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(
auth,
async (user) => {


if(!user){

  window.location.href =
  "../login.html";

  return;

}

try{

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
      "Пользователь не найден"
    );

    return;

  }

  const userData =
  userSnap.data();

  document.getElementById(
    "clientName"
  ).textContent =
  userData.name || "Клиент";

  const emailElement =
  document.getElementById(
    "clientEmail"
  );

  if(emailElement){

    emailElement.textContent =
    userData.email;

  }

  document.getElementById(
    "clientPhone"
  ).textContent =
  userData.phone ||
  "Телефон не указан";

  document.getElementById(
    "editName"
  ).value =
  userData.name || "";

  document.getElementById(
    "editPhone"
  ).value =
  userData.phone || "";

  const saveBtn =
  document.getElementById(
    "saveProfileBtn"
  );

  saveBtn.addEventListener(
    "click",
    async () => {

      const newName =
      document.getElementById(
        "editName"
      ).value.trim();

      const newPhone =
      document.getElementById(
        "editPhone"
      ).value.trim();

      await updateDoc(
        userRef,
        {
          name: newName,
          phone: newPhone
        }
      );

      document.getElementById(
        "clientName"
      ).textContent =
      newName;

      document.getElementById(
        "clientPhone"
      ).textContent =
      newPhone;

      alert(
        "Данные сохранены"
      );

    }
  );

}

catch(error){

  console.log(error);

  alert(
    "Ошибка загрузки профиля"
  );

}


}
);
