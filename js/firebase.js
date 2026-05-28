// Firebase SDK

import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getStorage } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";



// Конфиг Firebase

const firebaseConfig = {

  apiKey: "AIzaSyBuV2dJLDPxsk6E50e5p0E5Buk_NAc46-E",

  authDomain: "remont-f7644.firebaseapp.com",

  projectId: "remont-f7644",

  storageBucket: "remont-f7644.firebasestorage.app",

  messagingSenderId: "404840020044",

  appId: "1:404840020044:web:f81c9613321ac170c19ce9",

  measurementId: "G-J7S537NP48"

};



// Инициализация Firebase

const app = initializeApp(firebaseConfig);



// Сервисы

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);



// Экспорт

export { auth, db, storage };

import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
