import { auth, db } from './firebase.js';

import {

    signInWithEmailAndPassword

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

    doc,
    getDoc

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



const loginBtn =
document.getElementById('loginBtn');



loginBtn.addEventListener('click', async () => {

    const email =
    document.getElementById('email').value;

    const password =
    document.getElementById('password').value;



    try{

        const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );



        const user =
        userCredential.user;



        const docRef =
        doc(db, "users", user.uid);



        const docSnap =
        await getDoc(docRef);



        if(docSnap.exists()){

            const userData =
            docSnap.data();



            // МЕНЕДЖЕР

            if(userData.role === "manager"){

                window.location.href =
                "manager.html";

            }



            // КЛИЕНТ

            else if(userData.role === "client"){

                window.location.href =
                "cabinet.html";

            }

        }



    }catch(error){

        alert(error.message);

    }

});