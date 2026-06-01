import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
    
    let allEvents = [];
    let selectedDate = null;

    document.addEventListener("DOMContentLoaded", async () => {

    const calendarEl =
    document.getElementById("calendar");

    const modal =
    document.getElementById("taskModal");

    const openModalBtn =
    document.getElementById("openModalBtn");

    const saveTaskBtn =
    document.getElementById("saveTaskBtn");
        
    const clientSelect =
    document.getElementById("clientSelect") || null;
    
    const clientUid =
    clientSelect ? clientSelect.value : "";

    const closeModalBtn =
    document.getElementById("closeModal");

    let currentEvent = null;

    let selectedDate = null;
    let currentDocId = null;

    function clearForm(){

        document.getElementById(
            "clientName"
        ).value = "";

        document.getElementById(
            "clientPhone"
        ).value = "";

        document.getElementById(
            "clientAddress"
        ).value = "";

        document.getElementById(
            "workType"
        ).value = "";

        document.getElementById(
            "manager"
        ).value = "";

        document.getElementById(
            "comment"
        ).value = "";

        document.getElementById(
            "eventDate"
        ).value = "";

    }

    function getColor(type){

        switch(type){

            case "Замер":
                return "#ffb547";

            case "Смета":
                return "#2563eb";

            case "Черновые работы":
                return "#ef4444";

            case "Отделочные работы":
                return "#22c55e";

            case "Сдача объекта":
                return "#8b5cf6";

            default:
                return "#3b82f6";

        }

    }

    const calendar =
    new FullCalendar.Calendar(
        calendarEl,
        {

            locale:"ru",
            
            firstDay: 1, 

            initialView:"dayGridMonth",

            selectable:true,

            editable:true,

            eventDurationEditable:true,

            nowIndicator:true,

            height:"auto",

            headerToolbar:{

                left:"prev,next today",

                center:"title",

                right:
                "dayGridMonth,timeGridWeek,timeGridDay"

            },

            dateClick(info){

                currentEvent = null;
                currentDocId = null;
                
                clearForm();
                modal.style.display =
                "flex";

                selectedDate =
                info.dateStr;

                document.getElementById(
                    "eventDate"
                ).value =
                info.dateStr + "T10:00";

                renderDayTasks();

            },

            eventClick(info){

                currentEvent =
                info.event;
                currentDocId = info.event.id;

                const p =
                info.event.extendedProps;

                modal.style.display =
                "flex";

                document.getElementById(
                    "clientName"
                ).value =
                info.event.title;

                document.getElementById(
                    "clientPhone"
                ).value =
                p.phone || "";

                document.getElementById(
                    "clientAddress"
                ).value =
                p.address || "";

                document.getElementById(
                    "workType"
                ).value =
                p.workType || "";

                document.getElementById(
                    "manager"
                ).value =
                p.manager || "";

                document.getElementById(
                    "comment"
                ).value =
                p.comment || "";

                document.getElementById(
                    "eventDate"
                ).value =
                info.event.start
                .toISOString()
                .slice(0,16);

            },

            eventDrop(){

                renderDayTasks();

            },

            events:[]

        }

    );

    calendar.render();
        const snapshot =
            await getDocs(
                collection(db, "calendarEvents")
            );
            
            snapshot.forEach((docSnap) => {
            
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
                        comment: data.comment
            
                    }
            
                });
            
            });

            openModalBtn.addEventListener(
                "click",
                ()=>{
            
                    currentEvent = null;
                    currentDocId = null;
            
                    clearForm();
            
                    modal.style.display =
                    "flex";
            
                }
            );

    closeModalBtn.addEventListener(
        "click",
        ()=>{

            modal.style.display =
            "none";

        }
    );

    saveTaskBtn.addEventListener(
        "click",
        async ()=>{

            const client =
            document.getElementById(
                "clientName"
            ).value;

            const phone =
            document.getElementById(
                "clientPhone"
            ).value;

            const address =
            document.getElementById(
                "clientAddress"
            ).value;

            const workType =
            document.getElementById(
                "workType"
            ).value;

            const manager =
            document.getElementById(
                "manager"
            ).value;

            const comment =
            document.getElementById(
                "comment"
            ).value;

            const date =
            document.getElementById(
                "eventDate"
            ).value;

            if(!client || !date){

                alert(
                    "Заполните обязательные поля"
                );

                return;

            }

            const color =
            getColor(workType);

            if(currentEvent){
                await updateDoc(

    doc(
        db,
        "calendarEvents",
        currentDocId
    ),

    {
        client,
        clientUid,   
        phone,
        address,
        workType,
        manager,
        comment,
        date,
        color
    }

);
                currentEvent.setProp(
                    "title",
                    client
                );

                currentEvent.setStart(
                    date
                );

                currentEvent.setProp(
                    "backgroundColor",
                    color
                );

                currentEvent.setProp(
                    "borderColor",
                    color
                );

                currentEvent.setExtendedProp(
                    "phone",
                    phone
                );

                currentEvent.setExtendedProp(
                    "address",
                    address
                );

                currentEvent.setExtendedProp(
                    "workType",
                    workType
                );

                currentEvent.setExtendedProp(
                    "manager",
                    manager
                );

                currentEvent.setExtendedProp(
                    "comment",
                    comment
                );

}else{

    const docRef =
    await addDoc(
        collection(db, "calendarEvents"),
        {
            client,
            clientUid,  
            phone,
            address,
            workType,
            manager,
            comment,
            date,
            color
        }
    );

            calendar.addEvent({
                id: docRef.id,
                title: client,
                start: date,
                backgroundColor: color,
                borderColor: color,
            
                extendedProps: {
                    clientUid,  
                    phone,
                    address,
                    workType,
                    manager,
                    comment
                }
            });

            modal.style.display =
            "none";

            currentEvent = null;

            clearForm();

            renderDayTasks();

        }
    );

window.deleteCurrentEvent =
async function(){

        if(!currentEvent){

            alert(
                "Сначала откройте событие"
            );

            return;

        }

        if(
            confirm(
                "Удалить запись?"
            )
        ){
        await deleteDoc(
        
            doc(
                db,
                "calendarEvents",
                currentDocId
            )
        
        );
            currentEvent.remove();
            
            currentEvent = null;
            currentDocId = null;
            
            modal.style.display =
            "none";

            renderDayTasks();

        }

    }

    function renderDayTasks(){

        const eventsList =
        document.getElementById(
            "eventsList"
        );

        if(!eventsList) return;

        if(!selectedDate){

            eventsList.innerHTML =
            "<p>Выберите дату</p>";

            return;

        }

        const events =
        calendar.getEvents();

        let html = "";

        events.forEach(event=>{
        
        const eventDate =
        FullCalendar.formatDate(
            event.start,
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                timeZone: "local"
            }
        )
        .split(".")
        .reverse()
        .join("-");
        
        if(eventDate === selectedDate)
            {

                const p =
                event.extendedProps;

                html += `

                <div class="event-item">

                    <strong>

                        ${event.title}

                    </strong>

                    <p>

                        🕒

                        ${event.start.toLocaleTimeString(
                            "ru-RU",
                            {
                                hour:"2-digit",
                                minute:"2-digit"
                            }
                        )}

                    </p>

                    <p>

                        📍

                        ${p.address || "-"}

                    </p>

                    <p>

                        🔨

                        ${p.workType || "-"}

                    </p>

                    <p>

                        👤

                        ${p.manager || "-"}

                    </p>

                </div>

                `;

            }

        });

        if(html === ""){

            html =

            `<div class="event-item">

                Нет записей
                на выбранную дату

            </div>`;

        }

        eventsList.innerHTML =
        html;

    }

});

async function loadCalendarData(uid) {

    try {

        const snapshot = await getDocs(
            collection(db, "calendarEvents")
        );

        allEvents = [];

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            if (data.clientUid === uid) {
                allEvents.push(data);
            }
        });

        // 👉 по умолчанию показываем сегодня
        selectedDate = new Date().toISOString().split("T")[0];

        renderDayPlans();

    } catch (error) {
        console.error("Ошибка календаря:", error);
    }
}

function renderDayPlans() {

    const container = document.getElementById("visitsContainer");
    const workContainer = document.getElementById("upcomingWorks");

    if (!container || !workContainer) return;

    const filtered = allEvents.filter(event => {

        const eventDate = new Date(event.date)
            .toISOString()
            .split("T")[0];

        return eventDate === selectedDate;
    });

    // если нет событий
    if (filtered.length === 0) {

        workContainer.innerHTML = `<div class="empty-card">Нет работ на этот день</div>`;
        container.innerHTML = `<div class="empty-card">Нет визитов</div>`;
        return;
    }

    workContainer.innerHTML = "";
    container.innerHTML = "";

    filtered.forEach(event => {

        const workCard = document.createElement("div");
        workCard.className = "work-card";

        workCard.innerHTML = `
            <h4>${event.workType || "Работа"}</h4>
            <p>📅 ${formatDate(event.date)}</p>
            <p>📍 ${event.address || "-"}</p>
            <p>👤 ${event.manager || "-"}</p>
        `;

        workContainer.appendChild(workCard);

        const visit = document.createElement("div");
        visit.className = "visit-card";

        visit.innerHTML = `
            <strong>${formatDate(event.date)}</strong>
            <p>${event.workType || ""}</p>
            <p>${event.comment || ""}</p>
        `;

        container.appendChild(visit);
    });
}

function setDate(dateStr) {
    selectedDate = dateStr;
    renderDayPlans();
}

selectedDate = new Date().toISOString().split("T")[0];
