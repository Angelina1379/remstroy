import { initializeAconst firebaseConfig = {

  apiKey: "AIzaSyBuV2dJLDPxsk6E50e5p0E5Buk_NAc46-E",

  authDomain: "remont-f7644.firebaseapp.com",

  projectId: "remont-f7644",

  storageBucket: "remont-f7644.appspot.com",

  messagingSenderId: "404840020044",

  appId: "1:404840020044:web:f81c9613321ac170c19ce9",

  measurementId: "G-J7S537NP48"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
