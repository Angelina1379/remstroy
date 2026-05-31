import { auth, db }
from "./firebase.js";

import {
    collection,
    query,
    where,
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
// GLOBAL
// ======================================

let currentUser = null;
let allOrders = [];


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

    await loadOrders();

});


// ======================================
// LOAD ORDERS
// ======================================

async function loadOrders() {

    try {

        const ordersRef =
            collection(db, "orders");

        const q = query(
            ordersRef,
            where(
                "userId",
                "==",
                currentUser.uid
            )
        );

        const snapshot =
            await getDocs(q);

        allOrders = [];

        snapshot.forEach((doc) => {

            allOrders.push({
                id: doc.id,
                ...doc.data()
            });

        });

        renderOrders(allOrders);

    }

    catch(error) {

        console.error(error);

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
                    Заказы отсутствуют
                </h3>

                <p>
                    Пока нет созданных заявок
                </p>

            </div>
        `;

        return;

    }

    orders.forEach(order => {

        const card =
            document.createElement("div");

        card.className =
            "order-card";

        let statusClass =
            "status-new";

        let statusText =
            "Новая";

        if (
            order.status === "progress"
        ) {

            statusClass =
                "status-work";

            statusText =
                "В работе";

        }

        if (
            order.status === "completed"
        ) {

            statusClass =
                "status-done";

            statusText =
                "Завершён";

        }

        if (
            order.status === "cancelled"
        ) {

            statusClass =
                "status-cancel";

            statusText =
                "Отменён";

        }

        card.innerHTML = `

            <div class="order-top">

                <div class="order-number">
                    ${order.number || order.id}
                </div>

                <div class="order-status ${statusClass}">
                    ${statusText}
                </div>

            </div>

            <div class="order-info">

                <div class="order-row">

                    <span class="order-label">
                        Вид работ
                    </span>

                    <span class="order-value">
                        ${order.title || "-"}
                    </span>

                </div>

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
                        Дата начала
                    </span>

                    <span class="order-value">
                        ${order.startDate || "-"}
                    </span>

                </div>

            </div>

            <div class="order-footer">

                <div class="order-price">
                    ${order.price || 0} ₽
                </div>

            </div>

        `;

        ordersList.appendChild(card);

    });

}


// ======================================
// SEARCH
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
                (
                    order.title || ""
                ).toLowerCase();

            const matchSearch =
                title.includes(search);

            const matchStatus =
                status === "all"
                || order.status === status;

            return (
                matchSearch &&
                matchStatus
            );

        });

    renderOrders(filtered);

}


// ======================================
// NEW ORDER
// ======================================

newOrderBtn?.addEventListener(
    "click",
    async() => {

        const title =
            prompt(
                "Введите вид работ:"
            );

        if (!title) return;

        const address =
            prompt(
                "Введите адрес:"
            );

        if (!address) return;

        try {

            await addDoc(
                collection(
                    db,
                    "orders"
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

            alert(
                "Заявка отправлена"
            );

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

        const area =
            Number(
                prompt(
                    "Площадь помещения (м²)"
                )
            );

        if (!area) return;

        const type =
            prompt(
                "Тип ремонта:\nэконом\nстандарт\nпремиум"
            );

        let price = 0;

        switch(type) {

            case "эконом":
                price = area * 5000;
                break;

            case "стандарт":
                price = area * 8000;
                break;

            case "премиум":
                price = area * 12000;
                break;

            default:

                alert(
                    "Неизвестный тип ремонта"
                );

                return;

        }

        alert(
            "Примерная стоимость:\n"
            + price.toLocaleString("ru-RU")
            + " ₽"
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
