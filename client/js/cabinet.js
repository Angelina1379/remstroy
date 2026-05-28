import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================
// LOGOUT
// ======================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});


// ======================
// AUTH
// ======================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  initProject(user.uid);
  initNotifications(user.uid);
});


// ======================
// PROJECT (REALTIME)
// ======================
function initProject(uid) {
  const projectRef = doc(db, "projects", uid);

  onSnapshot(projectRef, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    setText("projectStatus", data.status);
    setText("projectAddress", data.address);
    setText("projectManager", data.manager);
    setText("projectDeadline", data.deadline);

    toggle("projectCard", true);
    toggle("statusSection", true);

    renderStages(data.stages || []);
    renderBlocks();
  });
}


// ======================
// STAGES
// ======================
function renderStages(stages) {
  const container = document.getElementById("stagesList");
  if (!container) return;

  container.innerHTML = "";

  stages.forEach((stage, i) => {
    const div = document.createElement("div");
    div.className = "stage-item";

    div.innerHTML = `
      <div class="stage-icon">${i + 1}</div>
      <div>${stage}</div>
    `;

    container.appendChild(div);
  });
}


// ======================
// DEFAULT BLOCKS
// ======================
function renderBlocks() {
  const msg = document.getElementById("messagesPreview");
  if (msg) msg.innerHTML = "<p>Сообщений пока нет</p>";

  const works = document.getElementById("worksList");
  if (works) works.innerHTML = "<p>Работы не назначены</p>";

  const docs = document.getElementById("documentsList");
  if (docs) docs.innerHTML = "<p>Документы отсутствуют</p>";
}


// ======================
// NOTIFICATIONS (REALTIME)
// ======================
function initNotifications(uid) {
  const notifBadge = document.getElementById("notifBadge");
  const container = document.getElementById("notificationsList");

  if (!notifBadge || !container) return;

  const notifRef = query(
    collection(db, "notifications", uid, "items"),
    orderBy("time", "desc")
  );

  onSnapshot(notifRef, (snap) => {
    container.innerHTML = "";

    let unread = 0;

    snap.forEach(doc => {
      const n = doc.data();

      if (!n.read) unread++;

      const time = n.time?.toDate
        ? n.time.toDate()
        : new Date(n.time);

      const div = document.createElement("div");
      div.className = "notification-item";

      div.innerHTML = `
        <p>${n.text || "Без текста"}</p>
        <span>${time.toLocaleString()}</span>
      `;

      container.appendChild(div);
    });

    updateBadge(unread);
  });
}


// ======================
// BADGE
// ======================
function updateBadge(count) {
  const badge = document.getElementById("notifBadge");
  if (!badge) return;

  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-block" : "none";
}


// ======================
// HELPERS
// ======================
function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value || "—";
}

function toggle(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = show ? "block" : "none";
}

const saveBtn = document.getElementById("saveProfileBtn");

saveBtn.addEventListener("click", async () => {

  const name = document.getElementById("editName").value;
  const phone = document.getElementById("editPhone").value;

  const user = auth.currentUser;

  if (!user) return;

  await setDoc(doc(db, "users", user.uid), {
    name: name,
    phone: phone
  }, { merge: true });

  alert("Сохранено!");
});
