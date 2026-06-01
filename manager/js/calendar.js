import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {

    const calendarEl = document.getElementById("calendar");
    const modal = document.getElementById("taskModal");

    const openModalBtn = document.getElementById("openModalBtn");
    const saveTaskBtn = document.getElementById("saveTaskBtn");
    const closeModalBtn = document.getElementById("closeModal");

    let currentEvent = null;
    let currentDocId = null;
    let selectedDate = null;

    // ======================================
    // COLOR MAP
    // ======================================

    function getColor(type) {
        switch (type) {
            case "Замер": return "#ffb547";
            case "Смета": return "#2563eb";
            case "Черновые работы": return "#ef4444";
            case "Отделочные работы": return "#22c55e";
            case "Сдача объекта": return "#8b5cf6";
            default: return "#3b82f6";
        }
    }

    // ======================================
    // CLEAR FORM
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

    // ======================================
    // CALENDAR INIT
    // ======================================

    const calendar = new FullCalendar.Calendar(calendarEl, {

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
            clearForm();
            modal.style.display = "flex";

            document.getElementById("eventDate").value =
                info.dateStr + "T10:00";
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
    // LOAD EVENTS
    // ======================================

    const snapshot = await getDocs(collection(db, "calendarEvents"));

    snapshot.forEach(docSnap => {

        const data = docSnap.data();

        calendar.addEvent({

            id: docSnap.id,
            title: data.client,
            start: data.date,
            backgroundColor: data.color,
            borderColor: data.color,

            extendedProps: {
                phone: data.phone,
                address: data.address,
                workType: data.workType,
                manager: data.manager,
                comment: data.comment,
                clientUid: data.clientUid // 🔥 ВАЖНО
            }
        });
    });

    // ======================================
    // SAVE EVENT
    // ======================================

    saveTaskBtn.addEventListener("click", async () => {

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

        const user = auth.currentUser;

        const payload = {
            client,
            clientUid: user?.uid || "", // 🔥 ОБЯЗАТЕЛЬНО
            phone,
            address,
            workType,
            manager,
            comment,
            date,
            color: getColor(workType)
        };

        if (currentEvent) {

            await updateDoc(
                doc(db, "calendarEvents", currentDocId),
                payload
            );

            currentEvent.setProp("title", client);
            currentEvent.setStart(date);

        } else {

            const docRef = await addDoc(
                collection(db, "calendarEvents"),
                payload
            );

            calendar.addEvent({
                id: docRef.id,
                title: client,
                start: date,
                backgroundColor: payload.color,
                borderColor: payload.color,
                extendedProps: payload
            });
        }

        modal.style.display = "none";
        clearForm();
        currentEvent = null;
        currentDocId = null;
    });

    // ======================================
    // DELETE
    // ======================================

    window.deleteCurrentEvent = async function () {

        if (!currentEvent) return;

        await deleteDoc(doc(db, "calendarEvents", currentDocId));

        currentEvent.remove();

        currentEvent = null;
        currentDocId = null;

        modal.style.display = "none";
    };

    // ======================================
});
