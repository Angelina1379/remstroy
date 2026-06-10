import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    RecaptchaVerifier,
    signInWithPhoneNumber
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let confirmationResult;



/* ===========================
   TOAST
=========================== */

const toast =
document.getElementById("toast");

function showToast(
    message,
    type = "success"
){

    toast.textContent = message;

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



/* ===========================
   ПРОВЕРКА EMAIL
=========================== */

function isValidEmail(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);

}



/* ===========================
   ПЕРЕХОД ПО РОЛИ
=========================== */

async function redirectByRole(user){

    const userRef =
    doc(
        db,
        "users",
        user.uid
    );

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

    if(
        userData.role === "manager"
    ){

        window.location.href =
        "manager/manager-panel.html";

    }

    else{

        window.location.href =
        "client/client-cabinet.html";

    }

}



/* ===========================
   ВХОД
=========================== */

document
.getElementById("loginBtn")
.addEventListener(
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



/* ===========================
   REGISTRATION
=========================== */

document
.getElementById("registerBtn")
.addEventListener(
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
            "Минимум 6 символов в пароле",
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
            "Аккаунт создан"
        );

        setTimeout(()=>{

            window.location.href =
            "client/client-cabinet.html";

        },1000);

    }

    catch(error){

        console.log(error);

        if(
            error.code ===
            "auth/email-already-in-use"
        ){

            showToast(
                "Такой Email уже зарегистрирован",
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



/* ===========================
   ВОССТАНОВЛЕНИЕ ПО ТЕЛЕФОНУ
=========================== */

window.recaptchaVerifier =
new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
        size:"normal"
    }
);



/* ===========================
   ОТПРАВКА SMS
=========================== */

document
.getElementById("sendCodeBtn")
.addEventListener(
"click",
async()=>{

    const phone =
    document
    .getElementById("phone")
    .value
    .trim();

    if(
        !phone.startsWith("+")
    ){

        showToast(
            "Введите номер в формате +7XXXXXXXXXX",
            "error"
        );

        return;
    }

    try{

        confirmationResult =
        await signInWithPhoneNumber(
            auth,
            phone,
            window.recaptchaVerifier
        );

        showToast(
            "Код отправлен"
        );

        document
        .getElementById("smsCode")
        .style.display =
        "block";

        document
        .getElementById("verifyCodeBtn")
        .style.display =
        "block";

    }

    catch(error){

        console.log(error);

        showToast(
            "Ошибка отправки SMS",
            "error"
        );

    }

});



/* ===========================
   ПОДТВЕРЖДЕНИЕ КОДА
=========================== */

document
.getElementById("verifyCodeBtn")
.addEventListener(
"click",
async()=>{

    const code =
    document
    .getElementById("smsCode")
    .value
    .trim();

    if(!code){

        showToast(
            "Введите код из SMS",
            "error"
        );

        return;
    }

    try{

        const result =
        await confirmationResult.confirm(
            code
        );

        showToast(
            "Телефон подтвержден"
        );

        await redirectByRole(
            result.user
        );

    }

    catch(error){

        console.log(error);

        showToast(
            "Неверный код",
            "error"
        );

    }

});
