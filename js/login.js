```javascript
import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const toast =
document.getElementById("toast");

function showToast(
    message,
    type = "success"
){

    toast.innerText = message;

    toast.className = "";

    toast.classList.add(
        type === "success"
        ? "toast-success"
        : "toast-error"
    );

    toast.style.display = "block";

    setTimeout(()=>{

        toast.style.display = "none";

    },3000);

}

function isValidEmail(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

async function redirectByRole(user){

    const userRef =
    doc(db,"users",user.uid);

    const userSnap =
    await getDoc(userRef);

    if(!userSnap.exists()){

        showToast(
            "Профиль пользователя не найден",
            "error"
        );

        return;
    }

    const userData =
    userSnap.data();

    if(userData.role === "manager"){

        window.location.href =
        "manager/manager-panel.html";

    }else{

        window.location.href =
        "client/client-cabinet.html";

    }

}

/* ВХОД */

document
.getElementById("loginBtn")
?.addEventListener(
"click",
async()=>{

    const email =
    document
    .getElementById("email")
    .value
    .trim();

    const password =
    document
    .getElementById("password")
    .value
    .trim();

    if(!email){

        showToast(
            "Введите Email",
            "error"
        );

        return;
    }

    if(!isValidEmail(email)){

        showToast(
            "Некорректный Email",
            "error"
        );

        return;
    }

    if(password.length < 6){

        showToast(
            "Пароль должен содержать минимум 6 символов",
            "error"
        );

        return;
    }

    try{

        const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        showToast(
            "Вход выполнен"
        );

        await redirectByRole(
            userCredential.user
        );

    }

    catch(error){

        console.log(error);

        showToast(
            "Неверный Email или пароль",
            "error"
        );

    }

});

/* ВОССТАНОВЛЕНИЕ */

document
.getElementById("forgotPasswordBtn")
?.addEventListener(
"click",
async(e)=>{

    e.preventDefault();

    const email =
    document
    .getElementById("email")
    .value
    .trim();

    if(!email){

        showToast(
            "Введите Email",
            "error"
        );

        return;
    }

    try{

        await sendPasswordResetEmail(
            auth,
            email
        );

        showToast(
            "Письмо отправлено на Email"
        );

    }

    catch(error){

        console.log(error);

        showToast(
            "Не удалось отправить письмо",
            "error"
        );

    }

});

/* РЕГИСТРАЦИЯ */

document
.getElementById("registerBtn")
?.addEventListener(
"click",
async()=>{

    const name =
    document
    .getElementById("regName")
    .value
    .trim();

    const email =
    document
    .getElementById("regEmail")
    .value
    .trim();

    const phone =
    document
    .getElementById("regPhone")
    .value
    .trim();

    const password =
    document
    .getElementById("regPassword")
    .value
    .trim();

    if(
        !name ||
        !email ||
        !phone ||
        !password
    ){

        showToast(
            "Заполните все поля",
            "error"
        );

        return;
    }

    if(!isValidEmail(email)){

        showToast(
            "Некорректный Email",
            "error"
        );

        return;
    }

    if(password.length < 6){

        showToast(
            "Минимум 6 символов",
            "error"
        );

        return;
    }

    try{

        const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user =
        userCredential.user;

        await setDoc(
            doc(
                db,
                "users",
                user.uid
            ),
            {
                uid:user.uid,
                name:name,
                email:email,
                phone:phone,
                role:"client",
                createdAt:
                new Date()
                .toISOString()
            }
        );

        showToast(
            "Аккаунт успешно создан"
        );

        setTimeout(()=>{

            window.location.href =
            "client/client-cabinet.html";

        },1500);

    }

    catch(error){

        console.log(error);

        if(
            error.code ===
            "auth/email-already-in-use"
        ){

            showToast(
                "Email уже используется",
                "error"
            );

            return;
        }

        showToast(
            "Ошибка регистрации",
            "error"
        );

    }

});
```
