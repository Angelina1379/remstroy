import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    RecaptchaVerifier,
    signInWithPhoneNumber
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let confirmationResult;

const toast =
document.getElementById("toast");

function showToast(message,type="success"){

    toast.innerText = message;

    toast.className = "";

    toast.classList.add(
        type === "success"
        ? "toast-success"
        : "toast-error"
    );

    toast.style.display = "block";

    setTimeout(()=>{

        toast.style.display="none";

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

        switch(error.code){

            case "auth/user-not-found":
                showToast(
                    "Пользователь не найден",
                    "error"
                );
                break;

            case "auth/wrong-password":
                showToast(
                    "Неверный пароль",
                    "error"
                );
                break;

            case "auth/invalid-credential":
                showToast(
                    "Неверный email или пароль",
                    "error"
                );
                break;

            default:
                showToast(
                    "Ошибка авторизации",
                    "error"
                );

        }

    }

});

document
.getElementById("forgotPassword")
.addEventListener(
"click",
async(e)=>{

    e.preventDefault();

    const email =
    document
    .getElementById("email")
    .value
    .trim();

    if(!isValidEmail(email)){

        showToast(
            "Введите Email для восстановления",
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
            "Письмо для восстановления отправлено"
        );

    }

    catch{

        showToast(
            "Не удалось отправить письмо",
            "error"
        );

    }

});

window.recaptchaVerifier =
new RecaptchaVerifier(
auth,
"recaptcha-container",
{
    size:"normal"
}
);

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

    if(!phone.startsWith("+")){

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
        .style.display = "block";

        document
        .getElementById("verifyCodeBtn")
        .style.display = "block";

    }

    catch(error){

        console.error(error);

        showToast(
            "Не удалось отправить SMS",
            "error"
        );

    }

});

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

    catch{

        showToast(
            "Неверный код",
            "error"
        );

    }

});
