import { auth, db } from "../firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================
// LOGOUT
// ======================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}


// ======================
// AUTH CHECK
// ======================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadProject(user.uid);
  loadNotifications(user.uid);
  loadProfile(user.uid);
});


// ======================
// PROJECT (REALTIME)
// ======================
function loadProject(uid) {
  const ref = doc(db, "projects", uid);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    setText("projectStatus", data.status);
    setText("projectAddress", data.address);
    setText("projectManager", data.manager);
    setText("projectDeadline", data.deadline);

    toggle("projectCard", true);
    toggle("statusSection", true);

    renderStages(data.stages || []);
    renderEmptyBlocks();
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
    const item = document.createElement("div");
    item.className = "stage-item";

    item.innerHTML = `
      <div class="stage-icon">${i + 1}</div>
      <div>${stage}</div>
    `;

    container.appendChild(item);
  });
}


// ======================
// EMPTY BLOCKS
// ======================
function renderEmptyBlocks() {
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
function loadNotifications(uid) {
  const container = document.getElementById("notificationsList");
  const badge = document.getElementById("notifBadge");

  if (!container || !badge) return;

  const ref = query(
    collection(db, "notifications", uid, "items"),
    orderBy("time", "desc")
  );

  onSnapshot(ref, (snap) => {
    container.innerHTML = "";

    let unread = 0;

    snap.forEach(docSnap => {
      const n = docSnap.data();

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

    badge.textContent = unread;
    badge.style.display = unread > 0 ? "inline-block" : "none";
  });
}


// ======================
// PROFILE LOAD + SAVE
// ======================
function loadProfile(uid) {
  const ref = doc(db, "users", uid);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    const name = document.getElementById("clientName");
    const phone = document.getElementById("clientPhone");

    const editName = document.getElementById("editName");
    const editPhone = document.getElementById("editPhone");

    if (name) name.textContent = data.name || "Клиент";
    if (phone) phone.textContent = data.phone || "—";

    if (editName) editName.value = data.name || "";
    if (editPhone) editPhone.value = data.phone || "";
  });

  const saveBtn = document.getElementById("saveProfileBtn");

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const name = document.getElementById("editName")?.value || "";
      const phone = document.getElementById("editPhone")?.value || "";

      await setDoc(doc(db, "users", uid), {
        name,
        phone
      }, { merge: true });

      alert("Сохранено!");
    });
  }
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
