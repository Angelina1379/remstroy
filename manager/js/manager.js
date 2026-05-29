import { auth, db } from "../../js/firebase.js";

import {
collection,
getDocs,
onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ------------------ */
/* Глобальные элементы */
/* ------------------ */

const activeProjectsEl =
document.getElementById(
"activeProjects"
);

const completedProjectsEl =
document.getElementById(
"completedProjects"
);

const lateProjectsEl =
document.getElementById(
"lateProjects"
);

const repeatClientsEl =
document.getElementById(
"repeatClients"
);

const monthProfitEl =
document.getElementById(
"monthProfit"
);

const yearProfitEl =
document.getElementById(
"yearProfit"
);

const projectsList =
document.getElementById(
"projectsList"
);

const unpaidList =
document.getElementById(
"unpaidList"
);

const forecastList =
document.getElementById(
"forecastList"
);

const managerName =
document.getElementById(
"managerName"
);

/* ------------------ */
/* Авторизация */
/* ------------------ */

onAuthStateChanged(
auth,
(user)=>{

if(!user){

window.location.href =
"../login.html";

return;

}

loadManager(user);

}
);

/* ------------------ */
/* Имя менеджера */
/* ------------------ */

async function loadManager(user){

try{

const usersSnapshot =
await getDocs(
collection(
db,
"users"
)
);

usersSnapshot.forEach(doc=>{

const data =
doc.data();

if(
data.uid ===
user.uid
){

managerName.textContent =
data.name;

}

});

}
catch(error){

console.log(error);

}

}

/* ------------------ */
/* Загрузка проектов */
/* ------------------ */

loadProjects();

function loadProjects(){

onSnapshot(
collection(
db,
"projects"
),
(snapshot)=>{

let active = 0;
let completed = 0;
let late = 0;

let monthProfit = 0;
let yearProfit = 0;

let clients = [];

let statuses = {

"Замеры":0,
"Смета":0,
"Черновые работы":0,
"Отделочные работы":0,
"Завершён":0

};

projectsList.innerHTML = "";
unpaidList.innerHTML = "";
forecastList.innerHTML = "";

const today =
new Date();

snapshot.forEach(projectDoc=>{

const project =
projectDoc.data();

clients.push(
project.clientEmail
);

if(
project.status ===
"Завершён"
){

completed++;

}
else{

active++;

}

if(
project.deadline
){

const deadline =
new Date(
project.deadline
);

if(
deadline < today &&
project.status !==
"Завершён"
){

late++;

}

}

const budget =
Number(
project.budget || 0
);

yearProfit +=
budget;

if(
project.createdAt
){

const date =
project.createdAt
.toDate();

if(
date.getMonth() ===
today.getMonth()
){

monthProfit +=
budget;

}

}

if(
statuses[
project.status
] !== undefined
){

statuses[
project.status
]++;

}

projectsList.innerHTML += `

<div class="project-item">

<h3>
${project.title}
</h3>

<p>
Клиент:
${project.clientName}
</p>

<p>
Статус:
${project.status}
</p>

<p>
Бюджет:
${budget.toLocaleString()} ₽
</p>

</div>

`;

if(
project.status !==
"Завершён"
){

forecastList.innerHTML += `

<div class="forecast-item">

<strong>
${project.title}
</strong>

<p>
Срок:
${project.deadline || "-"}
</p>

</div>

`;

}

});

activeProjectsEl.textContent =
active;

completedProjectsEl.textContent =
completed;

lateProjectsEl.textContent =
late;

repeatClientsEl.textContent =
new Set(clients).size;

monthProfitEl.textContent =
monthProfit.toLocaleString()

* " ₽";

yearProfitEl.textContent =
yearProfit.toLocaleString()

* " ₽";

drawChart(statuses);

}
);

}

/* ------------------ */
/* Диаграмма */
/* ------------------ */

let chart = null;

function drawChart(statuses){

const ctx =
document.getElementById(
"profitChart"
);

if(!ctx) return;

if(chart){

chart.destroy();

}

chart =
new Chart(
ctx,
{

type:"doughnut",

data:{

labels:
Object.keys(
statuses
),

datasets:[{

data:
Object.values(
statuses
)

}]

},

options:{

responsive:true,

plugins:{

legend:{

position:"bottom"

}

}

}

}
);

}
