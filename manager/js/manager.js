import { auth, db }
from "./firebase.js";

import {
signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
collection,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// LOGOUT
// ======================================

const logoutBtn =
document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {

await signOut(auth);

window.location.href = "login.html";

});

// ======================================
// ELEMENTS
// ======================================

const activeProjects =
document.getElementById("activeProjects");

const completedProjects =
document.getElementById("completedProjects");

const lateProjects =
document.getElementById("lateProjects");

const repeatClients =
document.getElementById("repeatClients");

const monthProfit =
document.getElementById("monthProfit");

const yearProfit =
document.getElementById("yearProfit");

const unpaidList =
document.getElementById("unpaidList");

const forecastList =
document.getElementById("forecastList");

const projectsList =
document.getElementById("projectsList");

// ======================================
// CHART
// ======================================

const ctx =
document.getElementById("profitChart");

const profitChart =
new Chart(ctx, {

type:"line",

data:{
labels:[
"Янв",
"Фев",
"Мар",
"Апр",
"Май",
"Июн",
"Июл",
"Авг",
"Сен",
"Окт",
"Ноя",
"Дек"
],

```
datasets:[{

  label:"Прибыль",

  data:[
    0,0,0,0,0,0,0,0,0,0,0,0
  ],

  borderWidth:3,
  tension:0.4

}]
```

},

options:{
responsive:true,
plugins:{
legend:{
display:false
}
}
}

});

// ======================================
// LOAD PROJECTS
// ======================================

const projectsRef =
collection(db, "projects");

onSnapshot(projectsRef, (snapshot) => {

let active = 0;
let completed = 0;
let late = 0;

let monthMoney = 0;
let yearMoney = 0;

let repeats = 0;

let monthlyStats =
[0,0,0,0,0,0,0,0,0,0,0,0];

let clientsMap = {};

unpaidList.innerHTML = "";
forecastList.innerHTML = "";
projectsList.innerHTML = "";

const today =
new Date();

snapshot.forEach(docSnap => {

```
const project =
docSnap.data();

const status =
project.status || "";

const budget =
Number(project.budget || 0);

const paid =
project.paid || false;

const client =
project.clientName || "Клиент";

const email =
project.clientEmail || "";

const deadline =
new Date(project.deadline);

const progress =
Number(project.progress || 0);

// ==================================
// ACTIVE / COMPLETED
// ==================================

if(status === "Завершён"){

  completed++;

}else{

  active++;

}

// ==================================
// LATE
// ==================================

if(deadline < today &&
   status !== "Завершён"){

  late++;

}

// ==================================
// PROFITS
// ==================================

const created =
project.createdAt?.toDate
? project.createdAt.toDate()
: new Date();

const month =
created.getMonth();

const year =
created.getFullYear();

const currentYear =
today.getFullYear();

if(year === currentYear){

  yearMoney += budget;

  monthlyStats[month] += budget;

  if(month === today.getMonth()){

    monthMoney += budget;

  }

}

// ==================================
// REPEAT CLIENTS
// ==================================

if(email){

  if(clientsMap[email]){

    clientsMap[email]++;

  }else{

    clientsMap[email] = 1;

  }

}

// ==================================
// UNPAID
// ==================================

if(!paid){

  const div =
  document.createElement("div");

  div.className = "list-item";

  div.innerHTML = `
    <h3>
      ${project.title || "Проект"}
    </h3>

    <p>
      👤 ${client}
    </p>

    <p>
      ✉ ${email}
    </p>

    <p>
      💰 ${budget.toLocaleString()} ₽
    </p>

    <button onclick="
      window.location.href=
      'messages.html'
    ">
      Связаться
    </button>
  `;

  unpaidList.appendChild(div);

}

// ==================================
// FORECAST
// ==================================

let forecast = "";

if(progress < 30){

  forecast =
  "Высокий риск задержки";

}else if(progress < 70){

  forecast =
  "Проект идёт стабильно";

}else{

  forecast =
  "Проект близок к завершению";

}

const forecastDiv =
document.createElement("div");

forecastDiv.className =
"list-item";

forecastDiv.innerHTML = `
  <h3>
    ${project.title || "Проект"}
  </h3>

  <p>
    Готовность:
    ${progress}%
  </p>

  <p>
    ${forecast}
  </p>
`;

forecastList.appendChild(forecastDiv);

// ==================================
// PROJECTS LIST
// ==================================

const projectDiv =
document.createElement("div");

projectDiv.className =
"project-item";

projectDiv.innerHTML = `
  <div>

    <h3>
      ${project.title || "Проект"}
    </h3>

    <p>
      ${project.address || ""}
    </p>

  </div>

  <div>

    <p>
      ${status}
    </p>

    <strong>
      ${budget.toLocaleString()} ₽
    </strong>

  </div>
`;

projectsList.appendChild(projectDiv);
```

});

// ====================================
// REPEATS
// ====================================

Object.values(clientsMap)
.forEach(count => {

```
if(count > 1){

  repeats++;

}
```

});

// ====================================
// UPDATE UI
// ====================================

activeProjects.textContent =
active;

completedProjects.textContent =
completed;

lateProjects.textContent =
late;

repeatClients.textContent =
repeats;

monthProfit.textContent =
monthMoney.toLocaleString() + " ₽";

yearProfit.textContent =
yearMoney.toLocaleString() + " ₽";

// ====================================
// CHART UPDATE
// ====================================

profitChart.data.datasets[0].data =
monthlyStats;

profitChart.update();

});
