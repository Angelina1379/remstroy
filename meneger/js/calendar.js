document.addEventListener('DOMContentLoaded', function () {

    // БАЗА КЛИЕНТОВ

    const clients = {

        "Клиент 1": {
            address: "ул. Центральная, д. 15"
        },

        "Клиент 2": {
            address: "пр. Победы, д. 21"
        },

        "Клиент 3": {
            address: "ул. Лесная, д. 7"
        },

        "Клиент 4": {
            address: "ул. Садовая, д. 48"
        }

    };



    // ЭЛЕМЕНТЫ

    const calendarEl = document.getElementById('calendar');

    const modal = document.getElementById('taskModal');

    const openModalBtn = document.getElementById('openModalBtn');

    const saveTaskBtn = document.getElementById('saveTaskBtn');

    const clientSelect = document.getElementById('clientName');

    const addressInput = document.getElementById('clientAddress');



    // СОЗДАНИЕ КАЛЕНДАРЯ

    let calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: 'timeGridWeek',

        locale: 'ru',

        height: 'auto',

        slotMinTime: "08:00:00",

        slotMaxTime: "22:00:00",

        nowIndicator: true,

        selectable: true,

        headerToolbar: {

            left: 'prev,next today',

            center: 'title',

            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'

        },



        // КЛИК ПО ДАТЕ

        dateClick: function(info){

            modal.style.display = 'flex';



            // АВТОМАТИЧЕСКАЯ ДАТА И ВРЕМЯ

            const clickedDate = info.dateStr + 'T10:00';

            document.getElementById('eventDate').value =
            clickedDate;

        },



        // КЛИК ПО СОБЫТИЮ

        eventClick: function(info){

            const props = info.event.extendedProps;

            alert(
                'Клиент: ' + info.event.title +
                '\nАдрес: ' + props.address +
                '\nТип работ: ' + props.workType +
                '\nКомментарий: ' + props.comment +
                '\nДата: ' + info.event.start
            );

        },



        events: []

    });



    // РЕНДЕР КАЛЕНДАРЯ

    calendar.render();



    // КНОПКА "ДОБАВИТЬ ЗАДАЧУ"

    openModalBtn.addEventListener('click', () => {

        modal.style.display = 'flex';

    });



    // ПОДТЯГИВАНИЕ АДРЕСА

    clientSelect.addEventListener('change', function(){

        const selectedClient = clientSelect.value;

        if(clients[selectedClient]){

            addressInput.value =
            clients[selectedClient].address;

        }

    });



    // СОХРАНЕНИЕ ЗАДАЧИ

    saveTaskBtn.addEventListener('click', () => {

        const client = document.getElementById('clientName').value;

        const address = document.getElementById('clientAddress').value;

        const workType = document.getElementById('workType').value;

        const comment = document.getElementById('comment').value;

        const date = document.getElementById('eventDate').value;



        // ПРОВЕРКА

        if (!client || !date) {

            alert('Заполните обязательные поля');

            return;

        }



        // СОЗДАНИЕ СОБЫТИЯ

        calendar.addEvent({

            title: client,

            start: date,



            extendedProps: {

                address,
                workType,
                comment

            }

        });



        // ЗАКРЫТИЕ МОДАЛКИ

        modal.style.display = 'none';



        // ОЧИСТКА ПОЛЕЙ

        document.getElementById('clientName').value = '';

        document.getElementById('clientAddress').value = '';

        document.getElementById('workType').value = '';

        document.getElementById('comment').value = '';

        document.getElementById('eventDate').value = '';

    });

});