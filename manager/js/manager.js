import { arrayUnion, updateDoc, doc } from "firebase/firestore";

async function addNotification(userId, message) {
  await updateDoc(doc(db, "projects", userId), {
    notifications: arrayUnion({
      text: message,
      time: Date.now(),
      read: false
    })
  });
}


import { auth, db } from "../../js/firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  doc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const createProjectBtn =
document.getElementById(
  "createProjectBtn"
);

const updateProjectBtn =
document.getElementById(
  "updateProjectBtn"
);

const projectsList =
document.getElementById(
  "projectsList"
);

const projectSelect =
document.getElementById(
  "projectSelect"
);

let projects = [];

/* ---------------------------
   Загрузка проектов
---------------------------- */

loadProjects();

/* ---------------------------
   Создание проекта
---------------------------- */

createProjectBtn.addEventListener(
  "click",
  createProject
);

async function createProject(){

  try{

    const title =
    document.getElementById(
      "projectTitle"
    ).value.trim();

    const address =
    document.getElementById(
      "projectAddress"
    ).value.trim();

    const email =
    document.getElementById(
      "clientEmail"
    ).value.trim();

    const budget =
    document.getElementById(
      "projectBudget"
    ).value.trim();

    const deadline =
    document.getElementById(
      "projectDeadline"
    ).value;

    if(
      !title ||
      !address ||
      !email
    ){

      alert(
        "Заполните обязательные поля"
      );

      return;

    }

    const q =
    query(
      collection(
        db,
        "users"
      ),
      where(
        "email",
        "==",
        email
      )
    );

    const clientSnapshot =
    await getDocs(q);

    if(
      clientSnapshot.empty
    ){

      alert(
        "Клиент не найден"
      );

      return;

    }

    const client =
    clientSnapshot.docs[0];

    await addDoc(
      collection(
        db,
        "projects"
      ),
      {

        title,

        address,

        budget:
        Number(budget || 0),

        deadline,

        status:
        "Замеры",

        progress:
        0,

        clientId:
        client.id,

        clientName:
        client.data().name,

        clientEmail:
        client.data().email,

        managerId:
        auth.currentUser.uid,

        createdAt:
        serverTimestamp()

      }
    );

    alert(
      "Проект успешно создан"
    );

    document.getElementById(
      "projectTitle"
    ).value = "";

    document.getElementById(
      "projectAddress"
    ).value = "";

    document.getElementById(
      "clientEmail"
    ).value = "";

    document.getElementById(
      "projectBudget"
    ).value = "";

    document.getElementById(
      "projectDeadline"
    ).value = "";

  }

  catch(error){

    console.error(error);

    alert(
      "Ошибка создания проекта"
    );

  }

}

/* ---------------------------
   Отображение проектов
---------------------------- */

function loadProjects(){

  onSnapshot(
    collection(
      db,
      "projects"
    ),
    (snapshot)=>{

      projects = [];

      projectsList.innerHTML = "";

      projectSelect.innerHTML =
      `
      <option value="">
      Выберите проект
      </option>
      `;

      let active = 0;
      let completed = 0;

      snapshot.forEach(
        (projectDoc)=>{

          const project = {

            id:
            projectDoc.id,

            ...projectDoc.data()

          };

          projects.push(
            project
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

          const option =
          document.createElement(
            "option"
          );

          option.value =
          project.id;

          option.textContent =
          project.title;

          projectSelect.appendChild(
            option
          );

          const card =
          document.createElement(
            "div"
          );

          card.className =
          "project-card";

          card.innerHTML = `

          <h3>
            ${project.title}
          </h3>

          <p>
            Клиент:
            ${project.clientName}
          </p>

          <p>
            Email:
            ${project.clientEmail}
          </p>

          <p>
            Статус:
            ${project.status}
          </p>

          <p>
            Готовность:
            ${project.progress}%
          </p>

          <p>
            Адрес:
            ${project.address}
          </p>

          <hr>

          `;

          projectsList.appendChild(
            card
          );

        }
      );

      document.getElementById(
        "totalProjects"
      ).textContent =
      projects.length;

      document.getElementById(
        "activeProjects"
      ).textContent =
      active;

      document.getElementById(
        "completedProjects"
      ).textContent =
      completed;

      const uniqueClients =
      new Set(
        projects.map(
          project =>
          project.clientId
        )
      );

      document.getElementById(
        "clientsCount"
      ).textContent =
      uniqueClients.size;

    }
  );

}

/* ---------------------------
   Обновление проекта
---------------------------- */

updateProjectBtn.addEventListener(
  "click",
  updateProject
);

async function updateProject(){

  try{

    const projectId =
    projectSelect.value;

    if(!projectId){

      alert(
        "Выберите проект"
      );

      return;

    }

    const status =
    document.getElementById(
      "statusSelect"
    ).value;

    const progress =
    Number(
      document.getElementById(
        "progressInput"
      ).value
    );

    await updateDoc(
      doc(
        db,
        "projects",
        projectId
      ),
      {

        status,

        progress

      }
    );

    alert(
      "Проект обновлён"
    );

  }

  catch(error){

    console.error(error);

    alert(
      "Ошибка обновления проекта"
    );

  }

}
