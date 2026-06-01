import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    getDocs
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

        await loadCalendarData(user.uid);

    }
);


// ======================================
// LOAD CALENDAR
// ======================================

async function loadCalendarData(uid){

    try{

        const snapshot =
        await getDocs(
            collection(db, "calendarEvents")
        );

        let events = [];

        snapshot.forEach(docSnap => {

            const data = docSnap.data();

            // 🔥 защита: проверяем clientUid
            if(data.clientUid === uid){

                events.push(data);

            }

        });

        renderEvents(events);

    }

    catch(error){

        console.error(
            "Ошибка календаря:",
            error
        );

    }

}


// ======================================
// RENDER EVENTS
// ======================================

function renderEvents(events){

    // если пусто
    if(!events || events.length === 0){

        upcomingWorks.innerHTML = `
            <div class="empty-card">
                Нет запланированных работ
            </div>
        `;

        visitsContainer.innerHTML = `
            <div class="empty-card">
                Нет визитов
            </div>
        `;

        startDate.textContent = "—";
        finishDate.textContent = "—";
        progressValue.textContent = "0%";

        return;
    }

    // сортировка по дате
    events.sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];

    startDate.textContent =
        formatDate(firstEvent?.date);

    finishDate.textContent =
        formatDate(lastEvent?.date);

    // защита от деления на 0
    const completed =
        events.filter(e =>
            new Date(e.date) < new Date()
        ).length;

    const progress =
        events.length > 0
            ? Math.round((completed / events.length) * 100)
            : 0;

    progressValue.textContent =
        progress + "%";

    // очистка
    upcomingWorks.innerHTML = "";
    visitsContainer.innerHTML = "";

    // вывод
    events.forEach(event => {

        const workCard =
        document.createElement("div");

        workCard.className = "work-card";

        workCard.innerHTML = `
            <h4>${event.workType || "Работа"}</h4>

            <p>📅 ${formatDate(event.date)}</p>

            <p>📍 ${event.address || "-"}</p>

            <p>👤 ${event.manager || "-"}</p>
        `;

        upcomingWorks.appendChild(workCard);

        const visit =
        document.createElement("div");

        visit.className = "visit-card";

        visit.innerHTML = `
            <strong>${formatDate(event.date)}</strong>

            <p>${event.workType || ""}</p>

            <p>${event.comment || ""}</p>
        `;

        visitsContainer.appendChild(visit);

    });

}


// ======================================
// DATE FORMAT
// ======================================

function formatDate(date){

    if(!date) return "—";

    const d = new Date(date);

    if(isNaN(d.getTime())) return "—";

    return d.toLocaleDateString("ru-RU");

}


// ======================================
// LOGOUT
// ======================================

logoutBtn?.addEventListener(
    "click",
    async() => {

        await signOut(auth);

        window.location.href = "login.html";

    }
);
