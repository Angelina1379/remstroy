import { auth, db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
doc,
updateDoc,
deleteDoc,
onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* LOGOUT */

document.getElementById("logoutBtn")
.addEventListener("click", async () => {

await signOut(auth);

window.location.href = "index.html";

});

/* ELEMENTS */

const projectsList =
document.getElementById("projectsList");

const searchInput =
document.getElementById("searchInput");

let selectedProjectId = null;
let clients = [];

/* LOAD PROJECTS */

async function loadProjects(){

const snap =
await getDocs(collection(db,"projects"));

projectsList.innerHTML = "";

snap.forEach(project => {

const data = project.data();

const card =
document.createElement("div");

card.className = "project-card";

card.innerHTML = `
<div class="project-top">

<h3>${data.clientName || "Без имени"}</h3>

<div class="status ${
data.status === "Новая заявка"
? "new"
: data.status === "Назначен замер"
? "measure"
: data.status === "В работе"
? "work"
: "done"
}">
${data.status}
</div>

</div>

<p>${data.address || "Без адреса"}</p>

`;

card.addEventListener("click", () => {

selectedProjectId = project.id;

fillProject(data);

document
.querySelectorAll(".project-card")
.forEach(c => c.classList.remove("active"));

card.classList.add("active");

});

projectsList.appendChild(card);

});

}

loadProjects();
    loadClients();

async function loadClients(){

    const select =
    document.getElementById(
        "clientName"
    );

    const snapshot =
    await getDocs(
        collection(
            db,
            "users"
        )
    );

    clients = [];

    select.innerHTML =
    `<option value="">
        Выберите клиента
    </option>`;

    snapshot.forEach(docSnap => {

        const client = {
            id: docSnap.id,
            ...docSnap.data()
        };

        if(
            client.role === "client"
        ){

            clients.push(client);

            select.innerHTML += `
                <option value="${client.uid}">
                    ${client.name}
                </option>
            `;

        }

    });

}

  document
.getElementById("clientName")
.addEventListener(
    "change",
    () => {

        const uid =
        document.getElementById(
            "clientName"
        ).value;

        const client =
        clients.find(
            c => c.uid === uid
        );

        if(!client) return;

        document.getElementById(
            "clientPhone"
        ).value =
        client.phone || "";

        document.getElementById(
            "clientEmail"
        ).value =
        client.email || "";

    }
);

/* CREATE */

document
.getElementById("createProjectBtn")
.addEventListener("click", async () => {

const data = collectForm();

await addDoc(
collection(db,"projects"),
{
...data,
createdAt: Date.now()
}
);

alert("Проект создан");

clearForm();

loadProjects();

});

/* UPDATE */

document
.getElementById("updateProjectBtn")
.addEventListener("click", async () => {

if(!selectedProjectId){
alert("Выберите проект");
return;
}

await updateDoc(
doc(db,"projects",selectedProjectId),
collectForm()
);

alert("Проект обновлен");

loadProjects();

});

/* DELETE */

document
.getElementById("deleteProjectBtn")
.addEventListener("click", async () => {

if(!selectedProjectId){
alert("Выберите проект");
return;
}

await deleteDoc(
doc(db,"projects",selectedProjectId)
);

alert("Проект удален");

clearForm();

loadProjects();

});

/* FORM */

function collectForm(){

return{

clientName:
document.getElementById("clientName").value,

phone:
document.getElementById("clientPhone").value,

email:
document.getElementById("clientEmail").value,

address:
document.getElementById("projectAddress").value,

type:
document.getElementById("projectType").value,

budget:
document.getElementById("projectBudget").value,

measureDate:
document.getElementById("measureDate").value,

deadline:
document.getElementById("deadline").value,

status:
document.getElementById("projectStatus").value,

priority:
document.getElementById("priority").value,

comment:
document.getElementById("comment").value

};

}

function fillProject(data){

document.getElementById("clientName").value =
data.clientName || "";

document.getElementById("clientPhone").value =
data.phone || "";

document.getElementById("clientEmail").value =
data.email || "";

document.getElementById("projectAddress").value =
data.address || "";

document.getElementById("projectType").value =
data.type || "";

document.getElementById("projectBudget").value =
data.budget || "";

document.getElementById("measureDate").value =
data.measureDate || "";

document.getElementById("deadline").value =
data.deadline || "";

document.getElementById("projectStatus").value =
data.status || "";

document.getElementById("priority").value =
data.priority || "";

document.getElementById("comment").value =
data.comment || "";

document.getElementById("infoStatus")
.textContent = data.status || "—";

document.getElementById("infoBudget")
.textContent = data.budget
? data.budget + " ₽"
: "—";

document.getElementById("infoMeasure")
.textContent = data.measureDate || "—";

document.getElementById("infoDeadline")
.textContent = data.deadline || "—";

renderTimeline(data);

}

function clearForm(){

selectedProjectId = null;

document
.querySelectorAll("input, textarea")
.forEach(el => el.value = "");

}

/* SEARCH */

searchInput.addEventListener("input", () => {

const value =
searchInput.value.toLowerCase();

document
.querySelectorAll(".project-card")
.forEach(card => {

card.style.display =
card.innerText.toLowerCase()
.includes(value)
? "block"
: "none";

});

});

/* TIMELINE */

function renderTimeline(data){

const timeline =
document.getElementById("timeline");

timeline.innerHTML = `
<div class="timeline-item">
<div class="timeline-dot"></div>

<div>
<h4>Проект создан</h4>
<p>${new Date().toLocaleDateString()}</p>
</div>
</div>

<div class="timeline-item">
<div class="timeline-dot"></div>

<div>
<h4>Текущий статус</h4>
<p>${data.status}</p>
</div>
</div>

<div class="timeline-item">
<div class="timeline-dot"></div>

<div>
<h4>Комментарий менеджера</h4>
<p>${data.comment || "Нет комментария"}</p>
</div>
</div>
`;

}
