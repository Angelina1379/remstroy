import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================
// ELEMENTS
// ======================================

const logoutBtn =
    document.getElementById("logoutBtn");

const startDate =
    document.getElementById("startDate");

const finishDate =
    document.getElementById("finishDate");

const progressValue =
    document.getElementById("progressValue");

const upcomingWorks =
    document.getElementById("upcomingWorks");

const projectStages =
    document.getElementById("projectStages");

const visitsContainer =
    document.getElementById("visitsContainer");


// ======================================
// AUTH
// ======================================

onAuthStateChanged(
    auth,
    async(user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }

        loadCalendarData(user.uid);

    }
);


// ======================================
// LOAD DATA
// ======================================

async function loadCalendarData(userId) {

    try {

        const userRef =
            doc(
                db,
                "users",
                userId
            );

        const userSnap =
            await getDoc(userRef);

        if (!userSnap.exists()) {
            return;
        }

        const userData =
            userSnap.data();

        startDate.textContent =
            userData.startDate || "—";

        finishDate.textContent =
            userData.finishDate || "—";

        progressValue.textContent =
            userData.progress
                ? `${userData.progress}%`
                : "0%";

    }

    catch(error) {

        console.error(
            "Ошибка загрузки календаря:",
            error
        );

    }

}


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


// ======================================
// FUTURE FUNCTIONS
// ======================================

// Здесь позже будет:
//
// loadCalendarEvents()
// loadProjectStages()
// loadVisits()
//
// Данные будут загружаться из Firebase
// и автоматически отображаться
// в календаре клиента.
