import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =====================================
   LOGOUT
===================================== */

document
.getElementById("logoutBtn")
?.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "index.html";

});

/* =====================================
   ELEMENTS
===================================== */

const ordersList =
document.getElementById("ordersList");

const searchInput =
document.getElementById("searchInput");

const clientSelect =
document.getElementById("clientSelect");

let selectedOrderId = null;

let clients = [];

console.log("clientSelect =", clientSelect);
console.log("ordersList =", document.getElementById("ordersList"));
console.log("createOrderBtn =", document.getElementById("createOrderBtn"));

/* =====================================
   INIT
===================================== */

window.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadClients();

        await loadOrders();

    }
);

/* =====================================
   CLIENTS
===================================== */

async function loadClients(){

    console.log("Загружаем клиентов...");

    const snapshot =
    await getDocs(
        collection(db,"users")
    );

    console.log(
        "Всего пользователей:",
        snapshot.size
    );

    clients = [];

    clientSelect.innerHTML = `
        <option value="">
            Выберите клиента
        </option>
    `;

    snapshot.forEach(docSnap => {

        const client = {
            id: docSnap.id,
            ...docSnap.data()
        };

        console.log(client);

        if(client.role === "client"){

            console.log(
                "Клиент найден:",
                client.name
            );

            clients.push(client);

            clientSelect.innerHTML += `
                <option value="${client.uid}">
                    ${client.name || "Без имени"}
                </option>
            `;

        }

    });

    console.log(
        "Итого клиентов:",
        clients.length
    );


    if(!clientSelect) return;

    const snapshot =
    await getDocs(
        collection(db,"users")
    );

    clients = [];

    clientSelect.innerHTML = `
        <option value="">
            Выберите клиента
        </option>
    `;

    snapshot.forEach(docSnap => {

        const client = {
            id: docSnap.id,
            ...docSnap.data()
        };

        if(client.role === "client"){

            clients.push(client);

            clientSelect.innerHTML += `
                <option value="${client.uid}">
                    ${client.name || "Без имени"}
                </option>
            `;

        }

    });

}

/* =====================================
   CLIENT AUTOFILL
===================================== */

clientSelect?.addEventListener(
    "change",
    () => {

        const uid =
        clientSelect.value;

        const client =
        clients.find(
            c => c.uid === uid
        );

        if(!client) return;

        document.getElementById(
            "clientPhone"
        ).value =
        client.phone || "";

        document.getElementById(
            "clientEmail"
        ).value =
        client.email || "";

    }
);

/* =====================================
   LOAD ORDERS
===================================== */

async function loadOrders(){

    const snap =
    await getDocs(
        collection(db,"projects")
    );

    ordersList.innerHTML = "";

    snap.forEach(order => {

        const data =
        order.data();

        const card =
        document.createElement("div");

        card.className =
        "project-card";

        card.innerHTML = `
            <div class="project-top">

                <h3>
                    ${data.clientName || "Без имени"}
                </h3>

                <div class="status">
                    ${data.status || ""}
                </div>

            </div>

            <p>
                ${data.address || "Без адреса"}
            </p>
        `;

        card.addEventListener(
            "click",
            () => {

                selectedOrderId =
                order.id;

                fillOrder(data);

                document
                .querySelectorAll(
                    ".project-card"
                )
                .forEach(card =>
                    card.classList.remove(
                        "active"
                    )
                );

                card.classList.add(
                    "active"
                );

            }
        );

        ordersList.appendChild(card);

    });

}

/* =====================================
   CREATE ORDER
===================================== */

document
.getElementById("createOrderBtn")
?.addEventListener(
    "click",
    async () => {

        const data =
        collectForm();

        await addDoc(
            collection(
                db,
                "projects"
            ),
            {
                ...data,
                createdAt:
                Date.now()
            }
        );

        alert(
            "Заказ создан"
        );

        clearForm();

        await loadOrders();

    }
);

/* =====================================
   UPDATE ORDER
===================================== */

document
.getElementById("updateOrderBtn")
?.addEventListener(
    "click",
    async () => {

        if(!selectedOrderId){

            alert(
                "Выберите заказ"
            );

            return;

        }

        await updateDoc(
            doc(
                db,
                "projects",
                selectedOrderId
            ),
            collectForm()
        );

        alert(
            "Заказ обновлен"
        );

        await loadOrders();

    }
);

/* =====================================
   DELETE ORDER
===================================== */

document
.getElementById("deleteOrderBtn")
?.addEventListener(
    "click",
    async () => {

        if(!selectedOrderId){

            alert(
                "Выберите заказ"
            );

            return;

        }

        await deleteDoc(
            doc(
                db,
                "projects",
                selectedOrderId
            )
        );

        alert(
            "Заказ удален"
        );

        clearForm();

        await loadOrders();

    }
);

/* =====================================
   FORM
===================================== */

function collectForm(){

    const uid =
    clientSelect.value;

    const client =
    clients.find(
        c => c.uid === uid
    );

    return {

        clientUid:
        uid,

        clientName:
        client?.name || "",

        phone:
        document.getElementById("clientPhone").value,

        email:
        document.getElementById("clientEmail").value,

        address:
        document.getElementById("projectAddress").value,

        type:
        document.getElementById("projectType").value,

        budget:
        document.getElementById("projectBudget").value,

        measureDate:
        document.getElementById("measureDate").value,

        deadline:
        document.getElementById("deadline").value,

        status:
        document.getElementById("projectStatus").value,

        priority:
        document.getElementById("priority").value,

        manager:
        document.getElementById("managerName").value,

        comment:
        document.getElementById("comment").value

    };

}

/* =====================================
   FILL ORDER
===================================== */

function fillOrder(data){

    clientSelect.value =
    data.clientUid || "";

    document.getElementById("clientPhone").value =
    data.phone || "";

    document.getElementById("clientEmail").value =
    data.email || "";

    document.getElementById("projectAddress").value =
    data.address || "";

    document.getElementById("projectType").value =
    data.type || "";

    document.getElementById("projectBudget").value =
    data.budget || "";

    document.getElementById("measureDate").value =
    data.measureDate || "";

    document.getElementById("deadline").value =
    data.deadline || "";

    document.getElementById("projectStatus").value =
    data.status || "";

    document.getElementById("priority").value =
    data.priority || "";

    document.getElementById("managerName").value =
    data.manager || "";

    document.getElementById("comment").value =
    data.comment || "";

    document.getElementById("infoStatus").textContent =
    data.status || "—";

    document.getElementById("infoBudget").textContent =
    data.budget
    ? data.budget + " ₽"
    : "—";

    document.getElementById("infoMeasure").textContent =
    data.measureDate || "—";

    document.getElementById("infoDeadline").textContent =
    data.deadline || "—";

    renderTimeline(data);

}

/* =====================================
   CLEAR
===================================== */

function clearForm(){

    selectedOrderId = null;

    document
    .querySelectorAll(
        "input, textarea"
    )
    .forEach(el => {

        if(
            el.type !== "button" &&
            el.type !== "submit"
        ){
            el.value = "";
        }

    });

    clientSelect.selectedIndex = 0;

}

/* =====================================
   SEARCH
===================================== */

searchInput?.addEventListener(
    "input",
    () => {

        const value =
        searchInput.value
        .toLowerCase();

        document
        .querySelectorAll(
            ".project-card"
        )
        .forEach(card => {

            card.style.display =
            card.innerText
            .toLowerCase()
            .includes(value)
            ? "block"
            : "none";

        });

    }
);

/* =====================================
   TIMELINE
===================================== */

function renderTimeline(data){

    const timeline =
    document.getElementById(
        "timeline"
    );

    timeline.innerHTML = `

        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div>
                <h4>Заказ создан</h4>
                <p>${new Date().toLocaleDateString()}</p>
            </div>
        </div>

        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div>
                <h4>Текущий статус</h4>
                <p>${data.status || ""}</p>
            </div>
        </div>

        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div>
                <h4>Комментарий менеджера</h4>
                <p>${data.comment || "Нет комментария"}</p>
            </div>
        </div>

    `;

}
