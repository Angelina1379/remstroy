import { auth } from "./firebase.js";

import {
    signOut,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ==========================================
// ELEMENTS
// ==========================================

const logoutBtn =
    document.getElementById("logoutBtn");

const documentsList =
    document.getElementById("documentsList");


// ==========================================
// AUTH
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }

    loadDocuments();

});


// ==========================================
// DOCUMENTS
// ==========================================

function loadDocuments() {

    if (!documentsList) return;

    documentsList.innerHTML = `

        <div class="empty-documents">

            <div class="empty-icon">
                📄
            </div>

            <h3>
                Документы отсутствуют
            </h3>

            <p>
                Здесь будут отображаться договоры,
                акты выполненных работ, сметы
                и другие документы по вашим заказам.
            </p>

        </div>

    `;

}


// ==========================================
// LOGOUT
// ==========================================

logoutBtn?.addEventListener(
    "click",
    async () => {

        await signOut(auth);

        window.location.href =
            "login.html";

    }
);
