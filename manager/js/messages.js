import { auth, db, storage } from "./firebase.js";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================================
// ELEMENTS
// ======================================

const clientsList = document.getElementById("clientsList");
const messagesContainer = document.getElementById("messagesContainer");

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");

const fileInput = document.getElementById("fileInput");

const chatUsername = document.getElementById("chatUsername");
const chatStatus = document.getElementById("chatStatus");

const profileBtn = document.getElementById("profileBtn");
const profileModal = document.getElementById("profileModal");

const closeModal = document.getElementById("closeModal");

const searchInput = document.getElementById("searchInput");

const voiceBtn = document.getElementById("voiceBtn");


// ======================================
// GLOBAL
// ======================================

let currentChat = null;
let currentUser = null;
let currentManager = null;

let mediaRecorder;
let audioChunks = [];


// ======================================
// AUTH
// ======================================

onAuthStateChanged(auth, async(user)=>{

  if(!user){
    window.location.href = "login.html";
    return;
  }

  currentManager = user;

  loadClients();

});


// ======================================
// LOAD CLIENTS
// ======================================

function loadClients(){

  const usersRef = query(
    collection(db,"users"),
    orderBy("lastTime","desc")
  );

  onSnapshot(usersRef,(snapshot)=>{

    clientsList.innerHTML = "";

    snapshot.forEach((docSnap)=>{

      const user = docSnap.data();

      if(user.role === "manager") return;

      const div = document.createElement("div");

      div.className = "client-item";

      div.innerHTML = `
        <div class="client-top">

          <div class="client-name">
            ${user.name || "Клиент"}
          </div>

          <div>
            ${user.online ? "🟢" : ""}
          </div>

        </div>

        <div class="client-last">
          ${user.lastMessage || "Сообщений нет"}
        </div>
      `;

      div.addEventListener("click",()=>{

        currentUser = {
          id:docSnap.id,
          ...user
        };

        openChat(docSnap.id,user.name);

      });

      clientsList.appendChild(div);

    });

  });

}


// ======================================
// SEARCH
// ======================================

searchInput.addEventListener("input",()=>{

  const value =
    searchInput.value.toLowerCase();

  const items =
    document.querySelectorAll(".client-item");

  items.forEach(item=>{

    const text =
      item.textContent.toLowerCase();

    item.style.display =
      text.includes(value)
      ? "block"
      : "none";

  });

});


// ======================================
// OPEN CHAT
// ======================================

function openChat(uid,name){

  currentChat = uid;

  chatUsername.textContent =
    name || "Клиент";

  const messagesRef = query(
    collection(db,"messages",uid,"items"),
    orderBy("time")
  );

  onSnapshot(messagesRef,(snapshot)=>{

    messagesContainer.innerHTML = "";

    snapshot.forEach(async(docSnap)=>{

      const msg = docSnap.data();

      const div =
        document.createElement("div");

      div.className = `
        message
        ${msg.sender === "manager"
          ? "manager"
          : "client"}
      `;

      let content = "";

      // TEXT
      if(msg.text){

        content += `
          <p>${msg.text}</p>
        `;

      }

      // IMAGE
      if(msg.imageUrl){

        content += `
          <img
            src="${msg.imageUrl}"
            class="chat-image"
          >
        `;

      }

      // FILE
      if(msg.fileUrl){

        content += `
          <a
            href="${msg.fileUrl}"
            target="_blank"
            class="file-link"
          >
            📎 ${msg.fileName || "Файл"}
          </a>
        `;

      }

      // VOICE
      if(msg.voiceUrl){

        content += `
          <audio controls>
            <source src="${msg.voiceUrl}">
          </audio>
        `;

      }

      // REPLY
      if(msg.replyText){

        content += `
          <div class="reply-preview">
            ${msg.replyText}
          </div>
        `;

      }

      // TIME
      content += `
        <div class="msg-time">
          ${
            msg.time?.toDate
            ? msg.time.toDate()
                .toLocaleTimeString()
            : ""
          }
        </div>
      `;

      div.innerHTML = content;

      // MARK READ
      if(
        msg.sender === "client" &&
        !msg.read
      ){

        await updateDoc(docSnap.ref,{
          read:true
        });

      }

      // DELETE
      div.addEventListener("contextmenu",
      async(e)=>{

        e.preventDefault();

        const confirmDelete =
          confirm("Удалить сообщение?");

        if(confirmDelete){

          await deleteDoc(docSnap.ref);

        }

      });

      messagesContainer.appendChild(div);

    });

    messagesContainer.scrollTop =
      messagesContainer.scrollHeight;

  });

}


// ======================================
// SEND TEXT
// ======================================

sendBtn.addEventListener("click",
async()=>{

  if(!currentChat) return;

  const text =
    messageInput.value.trim();

  if(!text) return;

  await addDoc(
    collection(
      db,
      "messages",
      currentChat,
      "items"
    ),
    {
      text,
      sender:"manager",
      read:false,
      time:serverTimestamp()
    }
  );

  // UPDATE LAST MESSAGE
  await setDoc(
    doc(db,"users",currentChat),
    {
      lastMessage:text,
      lastTime:serverTimestamp()
    },
    { merge:true }
  );

  messageInput.value = "";

});


// ======================================
// SEND FILE
// ======================================

fileInput.addEventListener("change",
async(e)=>{

  if(!currentChat) return;

  const file = e.target.files[0];

  if(!file) return;

  const storageRef = ref(
    storage,
    `chatFiles/${Date.now()}_${file.name}`
  );

  await uploadBytes(storageRef,file);

  const url =
    await getDownloadURL(storageRef);

  const isImage =
    file.type.startsWith("image");

  await addDoc(
    collection(
      db,
      "messages",
      currentChat,
      "items"
    ),
    {
      sender:"manager",
      fileUrl:url,
      fileName:file.name,
      imageUrl:isImage ? url : "",
      time:serverTimestamp()
    }
  );

});


// ======================================
// VOICE MESSAGE
// ======================================

voiceBtn.addEventListener("click",
async()=>{

  if(!currentChat) return;

  const stream =
    await navigator.mediaDevices
      .getUserMedia({audio:true});

  mediaRecorder =
    new MediaRecorder(stream);

  mediaRecorder.start();

  audioChunks = [];

  mediaRecorder.ondataavailable =
    (e)=>{

      audioChunks.push(e.data);

    };

  mediaRecorder.onstop =
  async()=>{

    const audioBlob =
      new Blob(audioChunks,{
        type:"audio/mp3"
      });

    const storageRef = ref(
      storage,
      `voices/${Date.now()}.mp3`
    );

    await uploadBytes(
      storageRef,
      audioBlob
    );

    const url =
      await getDownloadURL(storageRef);

    await addDoc(
      collection(
        db,
        "messages",
        currentChat,
        "items"
      ),
      {
        sender:"manager",
        voiceUrl:url,
        time:serverTimestamp()
      }
    );

  };

  setTimeout(()=>{

    mediaRecorder.stop();

  },5000);

});


// ======================================
// TYPING STATUS
// ======================================

messageInput.addEventListener("input",
async()=>{

  if(!currentChat) return;

  await setDoc(
    doc(db,"typing",currentChat),
    {
      typing:true,
      user:"manager"
    }
  );

  clearTimeout(window.typingTimeout);

  window.typingTimeout =
    setTimeout(async()=>{

      await setDoc(
        doc(db,"typing",currentChat),
        {
          typing:false
        }
      );

    },1500);

});


// ======================================
// PROFILE MODAL
// ======================================

profileBtn.addEventListener("click",
()=>{

  if(!currentUser) return;

  profileModal.style.display =
    "flex";

  document.getElementById("modalName")
    .textContent =
      currentUser.name || "Клиент";

  document.getElementById("modalPhone")
    .textContent =
      currentUser.phone || "—";

  document.getElementById("modalEmail")
    .textContent =
      currentUser.email || "—";

});

closeModal.addEventListener("click",
()=>{

  profileModal.style.display =
    "none";

});


// ======================================
// ONLINE STATUS
// ======================================

window.addEventListener("beforeunload",
async()=>{

  if(!currentManager) return;

  await setDoc(
    doc(db,"users",currentManager.uid),
    {
      online:false,
      lastSeen:serverTimestamp()
    },
    { merge:true }
  );

});


// ======================================
// SET ONLINE
// ======================================

onAuthStateChanged(auth,
async(user)=>{

  if(!user) return;

  await setDoc(
    doc(db,"users",user.uid),
    {
      online:true
    },
    { merge:true }
  );

});
