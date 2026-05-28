import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================
// LOGOUT
// ======================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});


// ======================
// AUTH + REALTIME DATA
// ======================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const projectRef = doc(db, "projects", user.uid);

  onSnapshot(projectRef, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    // ----------------------
    // PROJECT INFO
    // ----------------------
    setText("projectStatus", data.status);
    setText("projectAddress", data.address);
    setText("projectManager", data.manager);
    setText("projectDeadline", data.deadline);

    toggle("projectCard", true);
    toggle("statusSection", true);

    // ----------------------
    // STAGES
    // ----------------------
    const stagesList = document.getElementById("stagesList");
    stagesList.innerHTML = "";

    if (Array.isArray(data.stages)) {
      data.stages.forEach((stage, i) => {
        const item = document.createElement("div");
        item.className = "stage-item";
        item.innerHTML = `
          <div style="padding:12px;background:#f5f5f5;border-radius:12px;margin-bottom:10px;">
            ${i + 1}. ${stage}
          </div>
        `;
        stagesList.appendChild(item);
      });
    }

    // ----------------------
    // DEFAULT BLOCKS
    // ----------------------
    setText("messagesPreview", "Сообщений пока нет");
    setText("worksList", "Работы не назначены");
    setText("documentsList", "Документы отсутствуют");
  });
});


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
