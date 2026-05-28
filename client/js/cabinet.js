// ======================
// BUILDHOUSE CABINET
// ======================

const clientName = document.getElementById("clientName");
const clientPhone = document.getElementById("clientPhone");

const editName = document.getElementById("editName");
const editPhone = document.getElementById("editPhone");

const saveProfileBtn = document.getElementById("saveProfileBtn");


// ======================
// DEMO DATA
// ======================

let profile = JSON.parse(localStorage.getItem("clientProfile")) || {
    name: "Ангелина",
    phone: "+7 (999) 123-45-67"
};

let project = JSON.parse(localStorage.getItem("clientProject")) || {
    title: "Ремонт квартиры",
    status: "Черновые работы",
    address: "ул. Ленина 24",
    manager: "Александр",
    deadline: "25.08.2026",
    progress: 64
};

let stages = [
    {
        title: "Замеры",
        completed: true
    },
    {
        title: "Смета",
        completed: true
    },
    {
        title: "Закупка материалов",
        completed: true
    },
    {
        title: "Черновые работы",
        completed: false
    },
    {
        title: "Отделочные работы",
        completed: false
    },
    {
        title: "Сдача проекта",
        completed: false
    }
];


// ======================
// PROFILE
// ======================

function loadProfile(){

    clientName.textContent = profile.name;
    clientPhone.textContent = profile.phone;

    editName.value = profile.name;
    editPhone.value = profile.phone;
}

saveProfileBtn.addEventListener("click", () => {

    profile.name = editName.value;
    profile.phone = editPhone.value;

    localStorage.setItem(
        "clientProfile",
        JSON.stringify(profile)
    );

    loadProfile();

    saveProfileBtn.textContent = "Сохранено ✓";

    setTimeout(() => {
        saveProfileBtn.textContent = "Сохранить изменения";
    }, 2000);

});


// ======================
// PROJECT
// ======================

function loadProject(){

    const projectCard = document.querySelector(".project-card");

    projectCard.innerHTML = `
    
        <div class="project-top">
        
            <div>
                <p class="card-label">
                    Статус проекта
                </p>

                <h2>
                    ${project.title}
                </h2>
            </div>

            <div class="progress-circle">
                ${project.progress}%
            </div>

        </div>

        <div class="project-info">

            <div>
                <p class="card-label">
                    Этап
                </p>

                <h3>
                    ${project.status}
                </h3>
            </div>

            <div>
                <p class="card-label">
                    Адрес объекта
                </p>

                <h3>
                    ${project.address}
                </h3>
            </div>

            <div>
                <p class="card-label">
                    Менеджер
                </p>

                <h3>
                    ${project.manager}
                </h3>
            </div>

            <div>
                <p class="card-label">
                    Срок сдачи
                </p>

                <h3>
                    ${project.deadline}
                </h3>
            </div>

        </div>

        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
    
    `;

    const fill = document.querySelector(".progress-fill");

    setTimeout(() => {
        fill.style.width = project.progress + "%";
    }, 300);

}


// ======================
// STAGES
// ======================

function loadStages(){

    const statusSection =
        document.querySelector(".status-section");

    const stagesHTML = stages.map(stage => {

        return `
        
            <div class="stage-item
                ${stage.completed ? "done" : ""}
            ">

                <div class="stage-icon">
                    ${stage.completed ? "✓" : "•"}
                </div>

                <span>
                    ${stage.title}
                </span>

            </div>
        
        `;

    }).join("");

    statusSection.innerHTML = `
    
        <h2>
            Этапы ремонта
        </h2>

        <div class="stages-list">
            ${stagesHTML}
        </div>
    
    `;
}


// ======================
// MESSAGES PREVIEW
// ======================

function loadMessages(){

    const chatCard =
        document.querySelectorAll(".cabinet-card")[0];

    chatCard.innerHTML = `
    
        <div class="card-top">

            <h3>
                Сообщения
            </h3>

            <a href="messages.html">
                Открыть
            </a>

        </div>

        <div class="message-preview">

            <div class="message-user">
                Александр
            </div>

            <p>
                Завтра начинаем отделочные работы 👌
            </p>

            <span>
                12:45
            </span>

        </div>

        <div class="message-preview">

            <div class="message-user">
                Менеджер
            </div>

            <p>
                Фото прогресса загружены в проект
            </p>

            <span>
                Вчера
            </span>

        </div>
    
    `;
}


// ======================
// CALENDAR
// ======================

function loadCalendar(){

    const calendarCard =
        document.querySelectorAll(".cabinet-card")[1];

    calendarCard.innerHTML = `
    
        <div class="card-top">

            <h3>
                Ближайшие работы
            </h3>

        </div>

        <div class="calendar-work">

            <div>
                <strong>
                    15 июня
                </strong>

                <p>
                    Монтаж потолков
                </p>
            </div>

        </div>

        <div class="calendar-work">

            <div>
                <strong>
                    18 июня
                </strong>

                <p>
                    Укладка плитки
                </p>
            </div>

        </div>
    
    `;
}


// ======================
// DOCUMENTS
// ======================

function loadDocuments(){

    const docsCard =
        document.querySelectorAll(".cabinet-card")[2];

    docsCard.innerHTML = `
    
        <div class="card-top">

            <h3>
                Документы
            </h3>

        </div>

        <div class="document-item">

            <span>
                📄 Смета.pdf
            </span>

            <button>
                Скачать
            </button>

        </div>

        <div class="document-item">

            <span>
                📄 Договор.pdf
            </span>

            <button>
                Скачать
            </button>

        </div>
    
    `;
}


// ======================
// ANIMATIONS
// ======================

function animateCards(){

    const cards =
        document.querySelectorAll(
            ".cabinet-card, .project-card, .profile-settings"
        );

    cards.forEach((card, index) => {

        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";

        setTimeout(() => {

            card.style.transition =
                "0.5s ease";

            card.style.opacity = "1";
            card.style.transform =
                "translateY(0)";

        }, index * 150);

    });

}


// ======================
// INIT
// ======================

loadProfile();
loadProject();
loadStages();
loadMessages();
loadCalendar();
loadDocuments();
animateCards();

