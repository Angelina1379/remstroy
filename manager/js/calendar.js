import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allEvents = [];
let selectedDate = new Date().toISOString().split("T")[0];

let calendar;
let currentEvent = null;
let currentDocId = null;

// ======================================
// INIT
// ======================================

document.addEventListener("DOMContentLoaded", async () => {

    const calendarEl = document.getElementById("calendar");
    const modal = document.getElementById("taskModal");

    const openModalBtn = document.getElementById("openModalBtn");
    const saveTaskBtn = document.getElementById("saveTaskBtn");
    const closeModalBtn = document.getElementById("closeModal");

    // ======================================
    // CALENDAR
    // ======================================

    calendar = new FullCalendar.Calendar(calendarEl, {

        locale: "ru",
        firstDay: 1,
        initialView: "dayGridMonth",
        selectable: true,
        editable: true,
        height: "auto",

        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },

        dateClick(info) {
            selectedDate = info.dateStr;
            renderDayPlans();
        },

        eventClick(info) {

            currentEvent = info.event;
            currentDocId = info.event.id;

            const p = info.event.extendedProps;

            modal.style.display = "flex";

            document.getElementById("clientName").value = info.event.title;
            document.getElementById("clientPhone").value = p.phone || "";
            document.getElementById("clientAddress").value = p.address || "";
            document.getElementById("workType").value = p.workType || "";
            document.getElementById("manager").value = p.manager || "";
            document.getElementById("comment").value = p.comment || "";
            document.getElementById("eventDate").value =
                info.event.start.toISOString().slice(0, 16);
        }
    });

    calendar.render();

    // ======================================
    // LOAD FIREBASE DATA
    // ======================================

    await loadCalendarData();

    // ======================================
    // BUTTONS
    // ======================================

    openModalBtn?.addEventListener("click", () => {
        currentEvent = null;
        currentDocId = null;
        clearForm();
        modal.style.display = "flex";
    });

    closeModalBtn?.addEventListener("click", () => {
        modal.style.display = "none";
    });

    saveTaskBtn?.addEventListener("click", saveEvent);
});

// ======================================
// LOAD EVENTS
// ======================================

async function loadCalendarData() {

    const snapshot = await getDocs(collection(db, "calendarEvents"));

    allEvents = [];

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        const event = {
            id: docSnap.id,
            title: data.client,
            start: data.date,
            extendedProps: {
                phone: data.phone,
                address: data.address,
                workType: data.workType,
                manager: data.manager,
                comment: data.comment
            }
        };

        allEvents.push(event);

        calendar.addEvent(event);
    });

    renderDayPlans();
}

// ======================================
// SAVE EVENT
// ======================================

async function saveEvent() {

    const client = document.getElementById("clientName").value;
    const phone = document.getElementById("clientPhone").value;
    const address = document.getElementById("clientAddress").value;
    const workType = document.getElementById("workType").value;
    const manager = document.getElementById("manager").value;
    const comment = document.getElementById("comment").value;
    const date = document.getElementById("eventDate").value;

    if (!client || !date) {
        alert("Заполните обязательные поля");
        return;
    }

    const data = {
        client,
        phone,
        address,
        workType,
        manager,
        comment,
        date
    };

    if (currentEvent) {

        await updateDoc(doc(db, "calendarEvents", currentDocId), data);

        currentEvent.setProp("title", client);
        currentEvent.setStart(date);

    } else {

        const docRef = await addDoc(collection(db, "calendarEvents"), data);

        const event = {
            id: docRef.id,
            title: client,
            start: date,
            extendedProps: {
                phone,
                address,
                workType,
                manager,
                comment
            }
        };

        calendar.addEvent(event);
        allEvents.push(event);
    }

    document.getElementById("taskModal").style.display = "none";
    renderDayPlans();
}

// ======================================
// DELETE
// ======================================

window.deleteCurrentEvent = async function () {

    if (!currentEvent) return;

    await deleteDoc(doc(db, "calendarEvents", currentDocId));

    currentEvent.remove();

    allEvents = allEvents.filter(e => e.id !== currentDocId);

    currentEvent = null;
    currentDocId = null;

    document.getElementById("taskModal").style.display = "none";

    renderDayPlans();
};

// ======================================
// DAY PLANS (ВАЖНОЕ)
// ======================================

function renderDayPlans() {

    const workContainer = document.getElementById("upcomingWorks");
    const visitsContainer = document.getElementById("visitsContainer");

    if (!workContainer || !visitsContainer) return;

    const filtered = allEvents.filter(e => {

        const eventDate = new Date(e.start)
            .toISOString()
            .split("T")[0];

        return eventDate === selectedDate;
    });

    if (filtered.length === 0) {
        workContainer.innerHTML = `<div class="empty-card">Нет работ на этот день</div>`;
        visitsContainer.innerHTML = `<div class="empty-card">Нет визитов</div>`;
        return;
    }

    workContainer.innerHTML = "";
    visitsContainer.innerHTML = "";

    filtered.forEach(e => {

        const work = document.createElement("div");
        work.className = "work-card";

        work.innerHTML = `
            <h4>${e.title}</h4>
            <p>📅 ${formatDate(e.start)}</p>
            <p>📍 ${e.extendedProps.address || "-"}</p>
            <p>👤 ${e.extendedProps.manager || "-"}</p>
        `;

        workContainer.appendChild(work);

        const visit = document.createElement("div");
        visit.className = "visit-card";

        visit.innerHTML = `
            <strong>${formatDate(e.start)}</strong>
            <p>${e.extendedProps.workType || ""}</p>
            <p>${e.extendedProps.comment || ""}</p>
        `;

        visitsContainer.appendChild(visit);
    });
}

// ======================================
// FORMAT DATE
// ======================================

function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ru-RU");
}

// ======================================
// FORM RESET
// ======================================

function clearForm() {

    [
        "clientName",
        "clientPhone",
        "clientAddress",
        "workType",
        "manager",
        "comment",
        "eventDate"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}
