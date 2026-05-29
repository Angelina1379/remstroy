

import { auth, db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================
// LOGOUT
// ======================
document.getElementById("logoutBtn")
.addEventListener("click", async () => {

  await signOut(auth);

  window.location.href = "index.html";
});


// ======================
// CLIENTS
// ======================
const clientsList = document.getElementById("clientsList");

let currentClientId = null;

async function loadClients() {

  const snap = await getDocs(collection(db, "users"));

  clientsList.innerHTML = "";

  snap.forEach(docSnap => {

    const data = docSnap.data();

    const div = document.createElement("div");

    div.className = "client-item";

    div.innerHTML = `
      <h3>${data.name || "Без имени"}</h3>
      <p>${data.phone || "Нет телефона"}</p>
    `;

    div.addEventListener("click", () => {

      currentClientId = docSnap.id;

      document.getElementById("clientName").value =
        data.name || "";

      document.getElementById("clientPhone").value =
        data.phone || "";
    });

    clientsList.appendChild(div);

  });

}

loadClients();


// ======================
// ESTIMATE ITEMS
// ======================
const estimateItems =
document.getElementById("estimateItems");

document.getElementById("addItemBtn")
.addEventListener("click", addEstimateItem);

function addEstimateItem(title = "", qty = "", price = "") {

  const row = document.createElement("div");

  row.className = "estimate-item";

  row.innerHTML = `
    <input class="work-title" placeholder="Название работы" value="${title}">
    <input class="work-qty" type="number" placeholder="Количество" value="${qty}">
    <input class="work-price" type="number" placeholder="Цена" value="${price}">
    <button class="remove-btn">✕</button>
  `;

  row.querySelector(".remove-btn")
  .addEventListener("click", () => {
    row.remove();
    calculateTotal();
  });

  row.querySelectorAll("input")
  .forEach(input => {
    input.addEventListener("input", calculateTotal);
  });

  estimateItems.appendChild(row);

  calculateTotal();
}


// ======================
// TOTAL
// ======================
function calculateTotal() {

  let total = 0;

  document.querySelectorAll(".estimate-item")
  .forEach(item => {

    const qty =
      Number(item.querySelector(".work-qty").value);

    const price =
      Number(item.querySelector(".work-price").value);

    total += qty * price;

  });

  document.getElementById("totalPrice")
  .textContent = `${total.toLocaleString()} ₽`;

}

calculateTotal();


// ======================
// SAVE ESTIMATE
// ======================
document.getElementById("saveEstimateBtn")
.addEventListener("click", async () => {

  if (!currentClientId) {
    alert("Выберите клиента");
    return;
  }

  const items = [];

  document.querySelectorAll(".estimate-item")
  .forEach(item => {

    items.push({
      title:
        item.querySelector(".work-title").value,

      qty:
        Number(item.querySelector(".work-qty").value),

      price:
        Number(item.querySelector(".work-price").value)
    });

  });

  await setDoc(doc(db, "estimates", currentClientId), {

    clientName:
      document.getElementById("clientName").value,

    clientPhone:
      document.getElementById("clientPhone").value,

    address:
      document.getElementById("projectAddress").value,

    manager:
      document.getElementById("managerInput").value,

    deadline:
      document.getElementById("deadlineInput").value,

    items

  });

  alert("Смета сохранена");

});


// ======================
// EXCEL EXPORT
// ======================
document.getElementById("excelBtn")
.addEventListener("click", () => {

  const rows = [];

  rows.push([
    "Работа",
    "Количество",
    "Цена",
    "Сумма"
  ]);

  document.querySelectorAll(".estimate-item")
  .forEach(item => {

    const title =
      item.querySelector(".work-title").value;

    const qty =
      Number(item.querySelector(".work-qty").value);

    const price =
      Number(item.querySelector(".work-price").value);

    rows.push([
      title,
      qty,
      price,
      qty * price
    ]);

  });

  const wb = XLSX.utils.book_new();

  const ws =
    XLSX.utils.aoa_to_sheet(rows);

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Смета"
  );

  XLSX.writeFile(wb, "Смета.xlsx");

});


// ======================
// WORD EXPORT
// ======================
document.getElementById("docxBtn")
.addEventListener("click", async () => {

  const {
    Document,
    Packer,
    Paragraph,
    TextRun
  } = window.docx;

  const docFile = new Document({

    sections: [{
      properties: {},

      children: [

        new Paragraph({
          children: [
            new TextRun({
              text: "ДОГОВОР НА РЕМОНТНЫЕ РАБОТЫ",
              bold: true,
              size: 32
            })
          ]
        }),

        new Paragraph({
          text: ""
        }),

        new Paragraph({
          text:
          `Клиент: ${
            document.getElementById("clientName").value
          }`
        }),

        new Paragraph({
          text:
          `Телефон: ${
            document.getElementById("clientPhone").value
          }`
        }),

        new Paragraph({
          text:
          `Адрес объекта: ${
            document.getElementById("projectAddress").value
          }`
        }),

        new Paragraph({
          text:
          `Менеджер: ${
            document.getElementById("managerInput").value
          }`
        }),

        new Paragraph({
          text:
          `Срок сдачи: ${
            document.getElementById("deadlineInput").value
          }`
        })

      ]
    }]
  });

  const blob =
    await Packer.toBlob(docFile);

  saveAs(blob, "Договор.docx");

});


// ======================
// PDF EXPORT
// ======================
document.getElementById("pdfBtn")
.addEventListener("click", () => {

  const { jsPDF } = window.jspdf;

  const docPdf = new jsPDF();

  docPdf.setFontSize(18);

  docPdf.text(
    "Смета BuildHouse",
    20,
    20
  );

  let y = 40;

  document.querySelectorAll(".estimate-item")
  .forEach(item => {

    const title =
      item.querySelector(".work-title").value;

    const qty =
      item.querySelector(".work-qty").value;

    const price =
      item.querySelector(".work-price").value;

    docPdf.text(
      `${title} | ${qty} | ${price} ₽`,
      20,
      y
    );

    y += 10;

  });

  docPdf.save("Смета.pdf");

});
