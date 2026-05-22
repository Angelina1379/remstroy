import { db } from './firebase.js';
const sendBtn = document.getElementById('sendBtn');

const messageInput = document.getElementById('messageInput');

const messagesContainer =
document.getElementById('messagesContainer');

const fileInput =
document.getElementById('fileInput');



sendBtn.addEventListener('click', sendMessage);



messageInput.addEventListener('keypress', function(e){

    if(e.key === 'Enter'){

        sendMessage();

    }

});



function sendMessage(){

    const text = messageInput.value.trim();



    if(text !== ''){

        const message =
        document.createElement('div');

        message.classList.add(
            'message',
            'right-message'
        );

        message.innerText = text;

        messagesContainer.appendChild(message);

        messageInput.value = '';

    }



    if(fileInput.files.length > 0){

        const file = fileInput.files[0];

        const fileMessage =
        document.createElement('div');

        fileMessage.classList.add(
            'message',
            'right-message'
        );

        fileMessage.innerHTML =
        `📎 ${file.name}`;

        messagesContainer.appendChild(fileMessage);

        fileInput.value = '';

    }



    messagesContainer.scrollTop =
    messagesContainer.scrollHeight;

}