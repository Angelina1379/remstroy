import { auth, db, storage } from "./firebase.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    setDoc,
    deleteDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
    signOut,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================================
// ELEMENTS
// ======================================

const clientsList = document.getElementById("clientsList");
const messagesContainer = document.getElementById("messagesContainer");

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");

const fileInput = document.getElementById("fileInput");
const filePreview = document.getElementById("filePreview");

const searchInput = document.getElementById("searchInput");

const profileBtn = document.getElementById("profileBtn");

const profileModal = document.getElementById("profileModal");
const closeModal = document.getElementById("closeModal");

const voiceBtn = document.getElementById("voiceBtn");
const logoutBtn = document.getElementById("logoutBtn");


// ======================================
// GLOBAL
// ======================================

let currentClient = null;
let currentChat = null;
let selectedFile = null;

let mediaRecorder;
let audioChunks = [];


// ======================================
// AUTH
// ======================================

onAuthStateChanged(auth, async (user) => {

    console.log("AUTH USER:", user);

    if (!user) {
        console.log("Не авторизован");
        window.location.href = "login.html";
        return;
    }

    console.log("UID:", user.uid);

    await setDoc(
        doc(db, "users", user.uid),
        {
            online: true
        },
        { merge: true }
    );

    loadClients();

});


// ======================================
// CLIENTS
// ======================================

function loadClients() {

    console.log("loadClients START");

    const usersRef = collection(db, "users");

    onSnapshot(
        usersRef,

        (snapshot) => {

            console.log(
                "Количество пользователей:",
                snapshot.size
            );

            clientsList.innerHTML = "";

            snapshot.forEach((docSnap) => {

                const user = {
                    id: docSnap.id,
                    ...docSnap.data()
                };

                console.log(
                    "Пользователь:",
                    user
                );

                if (user.role === "manager") {
                    return;
                }

                const item =
                    document.createElement("div");

                item.className =
                    "client-item";

                item.innerHTML = `
                    <div class="client-top">

                        <div class="client-name">
                            ${user.name || "Клиент"}
                        </div>

                        <div class="client-time">
                            ${user.online ? "🟢" : ""}
                        </div>

                    </div>

                    <div class="client-last">
                        ${user.email || ""}
                    </div>
                `;

                item.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(".client-item")
                            .forEach(el =>
                                el.classList.remove("active")
                            );

                        item.classList.add("active");

                        currentClient = user;
                        currentChat = user.id;

                        document.getElementById(
                            "chatUsername"
                        ).textContent =
                            user.name || "Клиент";

                        document.getElementById(
                            "chatStatus"
                        ).textContent =
                            user.email || "";

                        loadMessages(user.id);

                    }
                );

                clientsList.appendChild(item);

            });

        },

        (error) => {

            console.error(
                "Ошибка Firestore:",
                error
        }
    );

}


// ======================================
// LOGOUT
// ======================================

logoutBtn?.addEventListener("click", async() => {

    await signOut(auth);

    window.location.href = "login.html";

});

// ======================================
// SEARCH
// ======================================

searchInput?.addEventListener("input", () => {

    const value =
        searchInput.value.toLowerCase();

    document
        .querySelectorAll(".client-item")
        .forEach(item => {

            item.style.display =
                item.textContent
                    .toLowerCase()
                    .includes(value)
                    ? "block"
                    : "none";

        });

});


// ======================================
// LOAD MESSAGES
// ======================================

function loadMessages(clientId) {

    const messagesRef = query(
        collection(
            db,
            "messages",
            clientId,
            "items"
        ),
        orderBy("time")
    );

    onSnapshot(messagesRef, (snapshot) => {

        messagesContainer.innerHTML = "";

        if (snapshot.empty) {

            messagesContainer.innerHTML = `
                <div class="empty-chat">
                    Сообщений пока нет
                </div>
            `;

            return;
        }

        snapshot.forEach((docSnap) => {

            const msg = docSnap.data();

            const div =
                document.createElement("div");

            div.className =
                `message ${
                    msg.sender === "manager"
                    ? "manager"
                    : "client"
                }`;

            let html = "";

            if (msg.text) {

                html += `
                    <div>${msg.text}</div>
                `;

            }

            if (msg.imageUrl) {

                html += `
                    <img
                        src="${msg.imageUrl}"
                        class="chat-image"
                    >
                `;

            }

            if (msg.fileUrl && !msg.imageUrl) {

                html += `
                    <div class="file-box">
                        <a
                            href="${msg.fileUrl}"
                            target="_blank"
                        >
                            📎 ${msg.fileName}
                        </a>
                    </div>
                `;

            }

            if (msg.voiceUrl) {

                html += `
                    <audio controls>
                        <source
                            src="${msg.voiceUrl}">
                    </audio>
                `;

            }

            const time =
                msg.time?.toDate
                    ? msg.time.toDate()
                    : new Date();

            html += `
                <div class="message-time">
                    ${time.toLocaleString("ru-RU")}
                </div>
            `;

            div.innerHTML = html;

            div.addEventListener(
                "contextmenu",
                async(e) => {

                    e.preventDefault();

                    if (
                        confirm(
                            "Удалить сообщение?"
                        )
                    ) {

                        await deleteDoc(
                            docSnap.ref
                        );

                    }

                }
            );

            messagesContainer.appendChild(div);

        });

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;

    });

}


// ======================================
// FILE SELECT
// ======================================

fileInput?.addEventListener(
    "change",
    () => {

        selectedFile =
            fileInput.files[0];

        if (!selectedFile) return;

        filePreview.innerHTML = `
            <p>
                📎 ${selectedFile.name}
            </p>
        `;

    }
);


// ======================================
// SEND MESSAGE
// ======================================

sendBtn?.addEventListener(
    "click",
    async() => {

        if (!currentChat) {

            alert(
                "Выберите клиента"
            );

            return;
        }

        const text =
            messageInput.value.trim();

        let fileUrl = "";
        let imageUrl = "";
        let fileName = "";

        if (selectedFile) {

            const storageRef = ref(
                storage,
                `chatFiles/${Date.now()}_${selectedFile.name}`
            );

            await uploadBytes(
                storageRef,
                selectedFile
            );

            fileUrl =
                await getDownloadURL(
                    storageRef
                );

            fileName =
                selectedFile.name;

            if (
                selectedFile.type.startsWith("image/")
            ) {

                imageUrl = fileUrl;

            }

        }

        if (!text && !selectedFile) return;

        await addDoc(
            collection(
                db,
                "messages",
                currentChat,
                "items"
            ),
            {
                text,
                sender: "manager",
                fileUrl,
                fileName,
                imageUrl,
                time: serverTimestamp(),
                read: false
            }
        );

        messageInput.value = "";
        fileInput.value = "";
        filePreview.innerHTML = "";

        selectedFile = null;

    }
);


// ======================================
// ENTER SEND
// ======================================

messageInput?.addEventListener(
    "keydown",
    (e) => {

        if (e.key === "Enter") {

            e.preventDefault();

            sendBtn.click();

        }

    }
);


// ======================================
// VOICE MESSAGE
// ======================================

voiceBtn?.addEventListener(
    "click",
    async() => {

        if (!currentChat) {

            alert("Выберите клиента");
            return;

        }

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        mediaRecorder =
            new MediaRecorder(stream);

        audioChunks = [];

        mediaRecorder.start();

        mediaRecorder.ondataavailable =
            e => {

                audioChunks.push(e.data);

            };

        mediaRecorder.onstop =
            async() => {

                const blob =
                    new Blob(
                        audioChunks,
                        {
                            type: "audio/webm"
                        }
                    );

                const storageRef = ref(
                    storage,
                    `voices/${Date.now()}.webm`
                );

                await uploadBytes(
                    storageRef,
                    blob
                );

                const url =
                    await getDownloadURL(
                        storageRef
                    );

                await addDoc(
                    collection(
                        db,
                        "messages",
                        currentChat,
                        "items"
                    ),
                    {
                        sender: "manager",
                        voiceUrl: url,
                        time: serverTimestamp()
                    }
                );

            };

        setTimeout(() => {

            mediaRecorder.stop();

        }, 5000);

    }
);


// ======================================
// PROFILE MODAL
// ======================================

profileBtn?.addEventListener(
    "click",
    () => {

        if (!currentClient) {

            alert("Выберите клиента");
            return;

        }

        document.getElementById("modalName").textContent =
            currentClient.name || "Клиент";

        document.getElementById("modalPhone").textContent =
            currentClient.phone || "Не указан";

        document.getElementById("modalEmail").textContent =
            currentClient.email || "Не указан";

        profileModal.style.display = "flex";

    }
);

closeModal?.addEventListener(
    "click",
    () => {

        profileModal.style.display = "none";

    }
);

window.addEventListener(
    "click",
    (e) => {

        if (e.target === profileModal) {

            profileModal.style.display = "none";

        }

    }
);
