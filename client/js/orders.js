import { auth, db }
from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
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

const ordersList =
    document.getElementById("ordersList");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const logoutBtn =
    document.getElementById("logoutBtn");

const newOrderBtn =
    document.getElementById("newOrderBtn");

const calculatorBtn =
    document.getElementById("calculatorBtn");


// ======================================
// MODALS
// ======================================

const orderModal =
    document.getElementById("orderModal");

const calculatorModal =
    document.getElementById("calculatorModal");

const createOrderBtn =
    document.getElementById("createOrderBtn");

const orderTitle =
    document.getElementById("orderTitle");

const orderAddress =
    document.getElementById("orderAddress");

const calcArea =
    document.getElementById("calcArea");

const calcType =
    document.getElementById("calcType");

const calculateBtn =
    document.getElementById("calculateBtn");

const calcResult =
    document.getElementById("calcResult");


// ======================================
// GLOBAL
// ======================================

let currentUser = null;
let allOrders = [];


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

        currentUser = user;

        await loadOrders();

    }
);


// ======================================
// LOAD ORDERS
// ======================================

async function loadOrders() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "projects"
                )
            );

        allOrders = [];

        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();

            console.log(
                "Документ:",
                data
            );

            if (
                data.clientUid ===
                currentUser.uid
            ) {

                allOrders.push({

                    id: docSnap.id,

                    ...data

                });

            }

        });

        console.log(
            "Найдено проектов:",
            allOrders.length
        );

        renderOrders(allOrders);

    }

    catch(error) {

        console.error(
            "Ошибка загрузки:",
            error
        );

    }

}

// ======================================
// RENDER
// ======================================

function renderOrders(orders) {

    ordersList.innerHTML = "";

    if (!orders.length) {

        ordersList.innerHTML = `
            <div class="empty-orders">

                <h3>
                    Заказов пока нет
                </h3>

                <p>
                    Для вас ещё не создано ни одного проекта
                </p>

            </div>
        `;

        return;

    }

    orders.forEach(order => {

        let statusClass =
            "status-new";

        let statusText =
            order.status || "Новая";

        if (
            order.status === "В работе"
        ) {

            statusClass =
                "status-work";

        }

        if (
            order.status === "Завершён"
        ) {

            statusClass =
                "status-done";

        }

        const card =
            document.createElement("div");

        card.className =
            "order-card";

        card.innerHTML = `

            <div class="order-top">

                <div class="order-number">
                    ${order.clientName || "Проект"}
                </div>

                <div class="order-status ${statusClass}">
                    ${statusText}
                </div>

            </div>

            <div class="order-info">

                <div class="order-row">

                    <span class="order-label">
                        Адрес
                    </span>

                    <span class="order-value">
                        ${order.address || "-"}
                    </span>

                </div>

                <div class="order-row">

                    <span class="order-label">
                        Бюджет
                    </span>

                    <span class="order-value">
                        ${Number(order.budget || 0).toLocaleString("ru-RU")} ₽
                    </span>

                </div>

                <div class="order-row">

                    <span class="order-label">
                        Замер
                    </span>

                    <span class="order-value">
                        ${order.measureDate || "-"}
                    </span>

                </div>

            </div>

        `;

        ordersList.appendChild(card);

    });

}


// ======================================
// FILTER
// ======================================

searchInput?.addEventListener(
    "input",
    filterOrders
);

statusFilter?.addEventListener(
    "change",
    filterOrders
);

function filterOrders() {

    const search =
        searchInput.value.toLowerCase();

    const status =
        statusFilter.value;

    const filtered =
        allOrders.filter(order => {

            const title =
                (order.title || "")
                .toLowerCase();

            const searchMatch =
                title.includes(search);

            const statusMatch =
                status === "all"
                || order.status === status;

            return (
                searchMatch &&
                statusMatch
            );

        });

    renderOrders(filtered);

}


// ======================================
// NEW ORDER MODAL
// ======================================

newOrderBtn?.addEventListener(
    "click",
    () => {

        orderModal.style.display =
            "flex";

    }
);


// ======================================
// CREATE ORDER
// ======================================

createOrderBtn?.addEventListener(
    "click",
    async() => {

        const title =
            orderTitle.value.trim();

        const address =
            orderAddress.value.trim();

        if (
            !title ||
            !address
        ) {

            alert(
                "Заполните все поля"
            );

            return;

        }

        try {

            await addDoc(
                collection(
                    db,
                    "projects"
                ),
                {
                    userId:
                        currentUser.uid,

                    title,
                    address,

                    status:
                        "new",

                    price: 0,

                    createdAt:
                        serverTimestamp()
                }
            );

            orderTitle.value = "";
            orderAddress.value = "";

            orderModal.style.display =
                "none";

            loadOrders();

        }

        catch(error) {

            console.error(error);

        }

    }
);


// ======================================
// CALCULATOR
// ======================================

calculatorBtn?.addEventListener(
    "click",
    () => {

        calculatorModal.style.display =
            "flex";

    }
);

calculateBtn?.addEventListener(
    "click",
    () => {

        const area =
            Number(
                calcArea.value
            );

        const pricePerMeter =
            Number(
                calcType.value
            );

        const total =
            area *
            pricePerMeter;

        calcResult.textContent =
            total.toLocaleString("ru-RU")
            + " ₽";

    }
);


// ======================================
// CLOSE MODALS
// ======================================

window.addEventListener(
    "click",
    (e) => {

        if (
            e.target === orderModal
        ) {

            orderModal.style.display =
                "none";

        }

        if (
            e.target === calculatorModal
        ) {

            calculatorModal.style.display =
                "none";

        }

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
