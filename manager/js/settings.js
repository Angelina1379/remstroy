import { auth, db, storage } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
    onAuthStateChanged,
    updatePassword,
    signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================================
// ELEMENTS
// ======================================

const profilePhoto =
document.getElementById("profilePhoto");

const avatarUpload =
document.getElementById("avatarUpload");

const fullName =
document.getElementById("fullName");

const phone =
document.getElementById("phone");

const email =
document.getElementById("email");

const position =
document.getElementById("position");

const saveProfileBtn =
document.getElementById("saveProfileBtn");

const savePasswordBtn =
document.getElementById("savePasswordBtn");

const newPassword =
document.getElementById("newPassword");

const logoutBtn =
document.getElementById("logoutBtn");

const managerName =
document.getElementById("managerName");


// ======================================
// GLOBAL
// ======================================

let currentUser = null;


// ======================================
// AUTH
// ======================================

onAuthStateChanged(auth, async(user) => {

    if (!user) {

        window.location.href =
        "login.html";

        return;
    }

    currentUser = user;

    loadProfile();

});


// ======================================
// LOAD PROFILE
// ======================================

async function loadProfile() {

    const userRef =
    doc(
        db,
        "users",
        currentUser.uid
    );

    const userSnap =
    await getDoc(userRef);

    if (!userSnap.exists()) return;

    const data =
    userSnap.data();

    fullName.value =
    data.name || "";

    phone.value =
    data.phone || "";

    email.value =
    data.email ||
    currentUser.email ||
    "";

    position.value =
    data.position ||
    "Менеджер";

    managerName.textContent =
    data.name ||
    "Менеджер";

    if (data.avatar) {

        profilePhoto.src =
        data.avatar;
    }

}


// ======================================
// SAVE PROFILE
// ======================================

saveProfileBtn?.addEventListener(
    "click",
    async() => {

        try {

            let avatarUrl =
            profilePhoto.src;

            const file =
            avatarUpload.files[0];

            if (file) {

                const storageRef = ref(
                    storage,
                    `avatars/${currentUser.uid}`
                );

                await uploadBytes(
                    storageRef,
                    file
                );

                avatarUrl =
                await getDownloadURL(
                    storageRef
                );

            }

            await updateDoc(
                doc(
                    db,
                    "users",
                    currentUser.uid
                ),
                {
                    name:
                    fullName.value.trim(),

                    phone:
                    phone.value.trim(),

                    position:
                    position.value.trim(),

                    avatar:
                    avatarUrl
                }
            );

            alert(
                "Профиль сохранён"
            );

        }

        catch(error){

            console.error(error);

            alert(
                "Ошибка сохранения"
            );

        }

    }
);


// ======================================
// CHANGE PASSWORD
// ======================================

savePasswordBtn?.addEventListener(
    "click",
    async() => {

        const password =
        newPassword.value.trim();

        if (
            password.length < 6
        ) {

            alert(
                "Минимум 6 символов"
            );

            return;
        }

        try {

            await updatePassword(
                currentUser,
                password
            );

            newPassword.value = "";

            alert(
                "Пароль обновлён"
            );

        }

        catch(error){

            console.error(error);

            alert(
                "Для смены пароля может потребоваться повторный вход"
            );

        }

    }
);


// ======================================
// PREVIEW AVATAR
// ======================================

avatarUpload?.addEventListener(
    "change",
    () => {

        const file =
        avatarUpload.files[0];

        if (!file) return;

        const reader =
        new FileReader();

        reader.onload =
        e => {

            profilePhoto.src =
            e.target.result;

        };

        reader.readAsDataURL(
            file
        );

    }
);


// ======================================
// LOGOUT
// ======================================

logoutBtn?.addEventListener(
    "click",
    async() => {

        await signOut(auth);

        window.location.href =
        "login.html";

    }
);
