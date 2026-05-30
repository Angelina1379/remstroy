import { auth, db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    doc,
    getDocs,
    deleteDoc,
    query,
    where
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

const clientsGrid =
document.getElementById("clientsGrid");

const searchInput =
document.getElementById("clientSearch");

const totalClients =
document.getElementById("totalClients");

const newClients =
document.getElementById("newClients");

const activeOrders =
document.getElementById("activeOrders");

const totalRevenue =
document.getElementById("totalRevenue");

const logoutBtn =
document.getElementById("logoutBtn");

const profileModal =
document.getElementById("profileModal");

const closeModal =
document.getElementById("closeModal");


// ======================================
// DATA
// ======================================

let clients = [];


// ======================================
// AUTH
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href =
        "login.html";

        return;
    }

    loadClients();

});


// ======================================
// LOGOUT
// ======================================

logoutBtn?.addEventListener(
    "click",
    async () => {

        await signOut(auth);

        window.location.href =
        "login.html";

    }
);


// ======================================
// LOAD CLIENTS
// ======================================

function loadClients() {

    const usersRef =
    collection(db, "users");

    onSnapshot(usersRef, async (snapshot) => {

        clients = [];

        snapshot.forEach((docSnap) => {

            const user = {

                id: docSnap.id,

                ...docSnap.data()

            };

            if (user.role === "manager")
                return;

            clients.push(user);

        });

        totalClients.textContent =
        clients.length;

        newClients.textContent =
        clients.length;

        let ordersSum = 0;

        try {

            const ordersSnapshot =
            await getDocs(
                collection(db, "orders")
            );

            activeOrders.textContent =
            ordersSnapshot.size;

            ordersSnapshot.forEach(doc => {

                const order =
                doc.data();

                ordersSum +=
                Number(order.price || 0);

            });

        }

        catch {

            activeOrders.textContent = 0;

        }

        totalRevenue.textContent =
        ordersSum.toLocaleString("ru-RU")
        + " ₽";

        renderClients(clients);

    });

}


// ======================================
// RENDER CLIENTS
// ======================================

async function renderClients(data) {

    clientsGrid.innerHTML = "";

    if (!data.length) {

        clientsGrid.innerHTML = `

            <div class="empty-state">

                Клиенты не найдены

            </div>

        `;

        return;
    }

    for (const client of data) {

        const ordersCount =
        await getOrdersCount(client.id);

        const messagesCount =
        await getMessagesCount(client.id);

        const card =
        document.createElement("div");

        card.className =
        "client-card";

        card.innerHTML = `

            <div class="client-header">

                <div class="client-avatar">

                    ${
                        (client.name || "К")
                        .charAt(0)
                        .toUpperCase()
                    }

                </div>

                <div>

                    <h3>

                        ${
                            client.name ||
                            "Клиент"
                        }

                    </h3>

                    <p>

                        ${
                            client.email ||
                            ""
                        }

                    </p>

                </div>

            </div>

            <div class="client-info">

                <p>
                    📞
                    ${
                        client.phone ||
                        "Не указан"
                    }
                </p>

                <p>
                    📍
                    ${
                        client.address ||
                        "Не указан"
                    }
                </p>

            </div>

            <div class="client-stats">

                <div>

                    <strong>
                        ${ordersCount}
                    </strong>

                    <span>
                        Заказов
                    </span>

                </div>

                <div>

                    <strong>
                        ${messagesCount}
                    </strong>

                    <span>
                        Сообщений
                    </span>

                </div>

            </div>

            <div class="client-actions">

                <button
                    class="view-btn"
                >
                    Подробнее
                </button>

                <button
                    class="delete-btn"
                >
                    Удалить
                </button>

            </div>

        `;

        card
        .querySelector(".view-btn")
        .addEventListener(
            "click",
            () => openProfile(client)
        );

        card
        .querySelector(".delete-btn")
        .addEventListener(
            "click",
            () => removeClient(client.id)
        );

        clientsGrid.appendChild(card);

    }

}


// ======================================
// SEARCH
// ======================================

searchInput?.addEventListener(
    "input",
    () => {

        const value =
        searchInput.value
        .toLowerCase();

        const filtered =
        clients.filter(client =>

            (
                client.name || ""
            )
            .toLowerCase()
            .includes(value)

            ||

            (
                client.email || ""
            )
            .toLowerCase()
            .includes(value)

            ||

            (
                client.phone || ""
            )
            .toLowerCase()
            .includes(value)

        );

        renderClients(filtered);

    }
);


// ======================================
// ORDERS COUNT
// ======================================

async function getOrdersCount(userId) {

    try {

        const q =
        query(
            collection(db, "orders"),
            where(
                "clientId",
                "==",
                userId
            )
        );

        const snapshot =
        await getDocs(q);

        return snapshot.size;

    }

    catch {

        return 0;

    }

}


// ======================================
// MESSAGES COUNT
// ======================================

async function getMessagesCount(userId) {

    try {

        const snapshot =
        await getDocs(
            collection(
                db,
                "messages",
                userId,
                "items"
            )
        );

        return snapshot.size;

    }

    catch {

        return 0;

    }

}


// ======================================
// PROFILE MODAL
// ======================================

async function openProfile(client) {

    document.getElementById(
        "modalAvatar"
    ).textContent =

    (
        client.name ||
        "К"
    )
    .charAt(0)
    .toUpperCase();

    document.getElementById(
        "modalName"
    ).textContent =

    client.name ||
    "Клиент";

    document.getElementById(
        "modalEmail"
    ).textContent =

    client.email ||
    "Не указан";

    document.getElementById(
        "modalPhone"
    ).textContent =

    client.phone ||
    "Не указан";

    document.getElementById(
        "modalAddress"
    ).textContent =

    client.address ||
    "Не указан";

    document.getElementById(
        "modalOrders"
    ).textContent =

    await getOrdersCount(client.id);

    document.getElementById(
        "modalMessages"
    ).textContent =

    await getMessagesCount(client.id);

    profileModal.style.display =
    "flex";

}


// ======================================
// CLOSE MODAL
// ======================================

closeModal?.addEventListener(
    "click",
    () => {

        profileModal.style.display =
        "none";

    }
);

window.addEventListener(
    "click",
    (e) => {

        if (
            e.target === profileModal
        ) {

            profileModal.style.display =
            "none";

        }

    }
);


// ======================================
// DELETE CLIENT
// ======================================

async function removeClient(id) {

    if (
        !confirm(
            "Удалить клиента?"
        )
    ) return;

    try {

        await deleteDoc(
            doc(
                db,
                "users",
                id
            )
        );

        alert(
            "Клиент удалён"
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Ошибка удаления"
        );

    }

}
