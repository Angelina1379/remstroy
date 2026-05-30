import { auth, db } from "../js/firebase.js";

import {
    collection,
    query,
    where,
    getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const ordersGrid =
document.getElementById("ordersGrid");

document
.getElementById("logoutBtn")
.addEventListener("click", async()=>{

    await signOut(auth);

    window.location.href =
    "login.html";

});

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href =
        "login.html";

        return;
    }

    loadOrders(user.uid);

});

async function loadOrders(uid){

    const q =
    query(
        collection(db,"orders"),
        where("clientId","==",uid)
    );

    const snapshot =
    await getDocs(q);

    ordersGrid.innerHTML = "";

    snapshot.forEach(doc=>{

        const order = doc.data();

        const remain =
        order.totalPrice - order.paid;

        ordersGrid.innerHTML += `

        <div class="order-card">

            <div class="order-header">

                <div class="order-number">
                    ${order.orderNumber}
                </div>

                <div class="order-status ${order.status}">
                    ${
                        order.status === "active"
                        ? "В работе"
                        : "Завершён"
                    }
                </div>

            </div>

            <div class="order-info">

                <div>
                    📍 ${order.address}
                </div>

                <div>
                    🏠 ${order.workType}
                </div>

                <div>
                    👨‍💼 ${order.manager}
                </div>

                <div>
                    📅 ${order.startDate}
                </div>

                <div>
                    🏁 ${order.endDate}
                </div>

            </div>

            <div class="order-price">

                <h3>
                    ${order.totalPrice.toLocaleString()} ₽
                </h3>

                <p>
                    Оплачено:
                    ${order.paid.toLocaleString()} ₽
                </p>

                <p>
                    Остаток:
                    ${remain.toLocaleString()} ₽
                </p>

            </div>

            <div class="order-actions">

                <button class="details-btn">
                    Подробнее
                </button>

                ${
                    order.status === "active"
                    ? `
                    <button
                        class="pay-btn"
                        data-id="${doc.id}"
                    >
                        Оплатить
                    </button>
                    `
                    : ""
                }

            </div>

        </div>

        `;
    });

}
