import { auth, db, storage } from "./firebase.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp
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

const messagesContainer =
document.getElementById("messagesContainer");

const sendBtn =
document.getElementById("sendBtn");

const messageInput =
document.getElementById("messageInput");

const fileInput =
document.getElementById("fileInput");

const filePreview =
document.getElementById("filePreview");

const voiceBtn =
document.getElementById("voiceBtn");

const logoutBtn =
document.getElementById("logoutBtn");


// ======================================
// GLOBAL
// ======================================

let currentUser = null;

let selectedFile = null;

let mediaRecorder;

let audioChunks = [];


// ======================================
// AUTH
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href =
        "login.html";

        return;
    }

    currentUser = user;

    loadMessages(user.uid);

});


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


// ======================================
// LOAD MESSAGES
// ======================================

function loadMessages(uid) {

    console.log(
        "Загрузка сообщений:",
        uid
    );

    const messagesRef = query(

        collection(
            db,
            "messages",
            uid,
            "items"
        ),

        orderBy("time", "asc")

    );

    onSnapshot(

        messagesRef,

        (snapshot) => {

            console.log(
                "Сообщений найдено:",
                snapshot.size
            );

            messagesContainer.innerHTML = "";

            if (snapshot.empty) {

                messagesContainer.innerHTML = `
                    <div class="empty-chat">
                        Пока нет сообщений
                    </div>
                `;

                return;
            }

            snapshot.forEach((docSnap) => {

                const msg =
                    docSnap.data();

                console.log(
                    "Сообщение:",
                    msg
                );

                const div =
                    document.createElement("div");

                div.className =
                    `message ${
                        msg.sender === "client"
                            ? "client"
                            : "manager"
                    }`;

                let html = "";

                if (msg.text) {

                    html += `
                        <div class="message-text">
                            ${msg.text}
                        </div>
                    `;
                }

                if (msg.imageUrl) {

                    html += `
                        <img
                            src="${msg.imageUrl}"
                            class="chat-image"
                            alt="Изображение"
                        >
                    `;
                }

                if (
                    msg.fileUrl &&
                    !msg.imageUrl
                ) {

                    html += `
                        <div class="file-box">

                            <a
                                href="${msg.fileUrl}"
                                target="_blank"
                            >
                                📎 ${msg.fileName || "Файл"}
                            </a>

                        </div>
                    `;
                }

                if (msg.voiceUrl) {

                    html += `
                        <audio controls>
                            <source src="${msg.voiceUrl}">
                        </audio>
                    `;
                }

                const messageTime =
                    msg.time?.toDate
                        ? msg.time.toDate()
                        : new Date();

                html += `
                    <div class="message-time">
                        ${messageTime.toLocaleString("ru-RU")}
                    </div>
                `;

                div.innerHTML = html;

                messagesContainer.appendChild(div);

            });

            messagesContainer.scrollTop =
                messagesContainer.scrollHeight;

        },

        (error) => {

            console.error(
                "Ошибка Firestore:",
                error
            );

        }

    );

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
            📎 ${selectedFile.name}
        `;
    }
);


// ======================================
// SEND MESSAGE
// ======================================

sendBtn?.addEventListener(
    "click",
    async() => {

        if (!currentUser) return;

        const text =
        messageInput.value.trim();

        let fileUrl = "";
        let imageUrl = "";
        let fileName = "";

        if (selectedFile) {

            const storageRef = ref(

                storage,

                `chatFiles/${
                    Date.now()
                }_${
                    selectedFile.name
                }`

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
                selectedFile.type.startsWith(
                    "image/"
                )
            ) {

                imageUrl =
                fileUrl;
            }

        }

        if (
            !text &&
            !selectedFile
        ) return;

        await addDoc(

            collection(
                db,
                "messages",
                currentUser.uid,
                "items"
            ),

            {
                text,
                sender: "client",
                fileUrl,
                imageUrl,
                fileName,
                read: false,
                time: serverTimestamp()
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

        if (!currentUser) return;

        const stream =
        await navigator.mediaDevices.getUserMedia({

            audio:true

        });

        mediaRecorder =
        new MediaRecorder(stream);

        audioChunks = [];

        mediaRecorder.start();

        mediaRecorder.ondataavailable =
        (e) => {

            audioChunks.push(
                e.data
            );

        };

        mediaRecorder.onstop =
        async() => {

            const blob =
            new Blob(
                audioChunks,
                {
                    type:"audio/webm"
                }
            );

            const storageRef = ref(

                storage,

                `voices/${
                    Date.now()
                }.webm`

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
                    currentUser.uid,
                    "items"
                ),

                {
                    sender:"client",
                    voiceUrl:url,
                    time:serverTimestamp()
                }

            );

        };

        setTimeout(() => {

            mediaRecorder.stop();

        }, 5000);

    }
);
