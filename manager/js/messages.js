import { auth, db } from "./firebase.js";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentChat = null;
let currentUser = null;

// ELEMENTS

const clientsList = document.getElementById("clientsList");
const messagesContainer = document.getElementById("messagesContainer");

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");

const chatUsername = document.getElementById("chatUsername");

const profileBtn = document.getElementById("profileBtn");
const profileModal = document.getElementById("profileModal");

// LOAD CLIENTS

loadClients();

function loadClients(){

  const usersRef = collection(db,"users");

  onSnapshot(usersRef,(snapshot)=>{

    clientsList.innerHTML = "";

    snapshot.forEach((docSnap)=>{

      const user = docSnap.data();

      const div = document.createElement("div");

      div.className = "client-item";

      div.innerHTML = `
        <div class="client-top">
          <div class="client-name">${user.name || "Клиент"}</div>
        </div>

        <div class="client-last">
          Нажмите чтобы открыть чат
        </div>
      `;

      div.addEventListener("click",()=>{

        currentUser = {
          id: docSnap.id,
          ...user
        };

        openChat(docSnap.id,user.name);
      });

      clientsList.appendChild(div);

    });

  });

}

// OPEN CHAT

function openChat(uid,name){

  currentChat = uid;

  chatUsername.textContent = name || "Клиент";

  const messagesRef = query(
    collection(db,"messages",uid,"items"),
    orderBy("time")
  );

  onSnapshot(messagesRef,(snapshot)=>{

    messagesContainer.innerHTML = "";

    snapshot.forEach((docSnap)=>{

      const msg = docSnap.data();

      const div = document.createElement("div");

      div.className = `
        message
        ${msg.sender === "manager" ? "manager" : "client"}
      `;

      div.innerHTML = `
        <p>${msg.text || ""}</p>
      `;

      messagesContainer.appendChild(div);

    });

    messagesContainer.scrollTop =
      messagesContainer.scrollHeight;

  });

}

// SEND MESSAGE

sendBtn.addEventListener("click",async ()=>{

  if(!currentChat) return;

  const text = messageInput.value.trim();

  if(!text) return;

  await addDoc(
    collection(db,"messages",currentChat,"items"),
    {
      text,
      sender:"manager",
      time:serverTimestamp()
    }
  );

  messageInput.value = "";

});

// PROFILE MODAL

profileBtn.addEventListener("click",()=>{

  if(!currentUser) return;

  profileModal.style.display = "flex";

  document.getElementById("modalName").textContent =
    currentUser.name || "Клиент";

  document.getElementById("modalPhone").textContent =
    currentUser.phone || "—";

  document.getElementById("modalEmail").textContent =
    currentUser.email || "—";

});

document.getElementById("closeModal")
.addEventListener("click",()=>{

  profileModal.style.display = "none";

});
