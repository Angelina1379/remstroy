import { auth, db }
from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================================
// ELEMENTS
// ======================================

const logoutBtn =
    document.getElementById("logoutBtn");

const saveBtn =
    document.getElementById("saveBtn");

const nameInput =
    document.getElementById("name");

const phoneInput =
    document.getElementById("phone");

const emailInput =
    document.getElementById("email");

const addressInput =
    document.getElementById("address");


// ======================================
// AUTH
// ======================================

onAuthStateChanged(auth, async(user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }

    loadProfile(user.uid);

});


// ======================================
// LOAD PROFILE
// ======================================

async function loadProfile(uid) {

    try {

        const userRef =
            doc(db, "users", uid);

        const snap =
            await getDoc(userRef);

        if (!snap.exists()) return;

        const data =
            snap.data();

        nameInput.value =
            data.name || "";

        phoneInput.value =
            data.phone || "";

        emailInput.value =
            data.email || "";

        addressInput.value =
            data.address || "";

    }

    catch(error) {

        console.error(
            "Ошибка загрузки профиля:",
            error
        );

    }

}


// ======================================
// SAVE PROFILE
// ======================================

saveBtn?.addEventListener(
    "click",
    async() => {

        const user =
            auth.currentUser;

        if (!user) return;

        try {

            await updateDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                {
                    name:
                        nameInput.value.trim(),

                    phone:
                        phoneInput.value.trim(),

                    email:
                        emailInput.value.trim(),

                    address:
                        addressInput.value.trim()
                }
            );

            alert(
                "Настройки сохранены"
            );

        }

        catch(error) {

            console.error(error);

            alert(
                "Ошибка сохранения"
            );

        }

    }
);


// ======================================
// LOGOUT
// ======================================

logoutBtn?.addEventListener(
    "click",
    async() => {

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        }

        catch(error) {

            console.error(error);

        }

    }
);
