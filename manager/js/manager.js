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

/* =========================
   ЭЛЕМЕНТЫ
========================= */

const activeProjectsEl =
document.getElementById("activeProjects");

const completedProjectsEl =
document.getElementById("completedProjects");

const lateProjectsEl =
document.getElementById("lateProjects");

const repeatClientsEl =
document.getElementById("repeatClients");

const monthProfitEl =
document.getElementById("monthProfit");

const yearProfitEl =
document.getElementById("yearProfit");

const forecastList =
document.getElementById("forecastList");

const managerName =
document.getElementById("managerName");

const ordersTable =
document.getElementById("ordersTable");

/* =========================
   АВТОРИЗАЦИЯ
========================= */

onAuthStateChanged(
    auth,
    async(user)=>{

        if(!user){

            window.location.href =
            "../login.html";

            return;
        }

        await loadManager(user);
        loadProjects();
    }
);

/* =========================
   ИМЯ МЕНЕДЖЕРА
========================= */

async function loadManager(user){

    try{

        const usersSnapshot =
        await getDocs(
            collection(db,"users")
        );

        usersSnapshot.forEach(doc=>{

            const data =
            doc.data();

            if(data.uid === user.uid){

                managerName.textContent =
                data.name || "Менеджер";
            }

        });

    }
    catch(error){

        console.error(
            "Ошибка загрузки пользователя:",
            error
        );

    }

}

/* =========================
   ЗАГРУЗКА ПРОЕКТОВ
========================= */

function loadProjects(){

    onSnapshot(
        collection(db,"projects"),

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

            ordersTable.innerHTML = "";
            forecastList.innerHTML = "";

            const today =
            new Date();

            snapshot.forEach(projectDoc=>{

                const project =
                projectDoc.data();

                clients.push(
                    project.clientEmail || ""
                );

                /* -----------------
                   СТАТИСТИКА
                ------------------ */

                if(
                    project.status ===
                    "Завершён"
                ){
                    completed++;
                }
                else{
                    active++;
                }

                /* -----------------
                   ПРОСРОЧКА
                ------------------ */

                let isLate = false;

                if(project.deadline){

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
                        isLate = true;

                    }

                }

                /* -----------------
                   ПРИБЫЛЬ
                ------------------ */

                const budget =
                Number(
                    project.budget || 0
                );

                yearProfit += budget;

                if(project.createdAt){

                    const date =
                    project.createdAt.toDate();

                    if(
                        date.getMonth() ===
                        today.getMonth() &&

                        date.getFullYear() ===
                        today.getFullYear()
                    ){

                        monthProfit += budget;

                    }

                }

                /* -----------------
                   ДИАГРАММА
                ------------------ */

                if(
                    statuses[
                        project.status
                    ] !== undefined
                ){

                    statuses[
                        project.status
                    ]++;

                }

                /* -----------------
                   ТАБЛИЦА ПРОЕКТОВ
                ------------------ */

                let statusClass =
                "status-badge";

                if(isLate){

                    statusClass +=
                    " status-late";

                }

                ordersTable.innerHTML += `

                <tr>

                    <td>
                        ${project.title || "-"}
                    </td>

                    <td>
                        ${project.clientName || "-"}
                    </td>

                    <td>

                        <span class="${statusClass}">
                            ${project.status || "-"}
                        </span>

                    </td>

                    <td>
                        ${project.deadline || "-"}
                    </td>

                </tr>

                `;

                /* -----------------
                   ПРОГНОЗ
                ------------------ */

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
                            Клиент:
                            ${project.clientName || "-"}
                        </p>

                        <p>
                            Срок:
                            ${project.deadline || "-"}
                        </p>

                    </div>

                    `;

                }

            });

            /* -----------------
               KPI
            ------------------ */

            activeProjectsEl.textContent =
            active;

            completedProjectsEl.textContent =
            completed;

            lateProjectsEl.textContent =
            late;

            repeatClientsEl.textContent =
            new Set(clients).size;

            monthProfitEl.textContent =
            monthProfit.toLocaleString("ru-RU")
            + " ₽";

            yearProfitEl.textContent =
            yearProfit.toLocaleString("ru-RU")
            + " ₽";

            drawChart(statuses);

        }

    );

}

/* =========================
   ДИАГРАММА
========================= */

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
    new Chart(ctx,{

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
                ),

                backgroundColor:[

                    "#ffb547",
                    "#0b1220",
                    "#3b82f6",
                    "#f59e0b",
                    "#22c55e"

                ],

                borderWidth:0

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    position:"bottom",

                    labels:{

                        padding:20,

                        usePointStyle:true,

                        pointStyle:"circle"

                    }

                }

            }

        }

    });

}
