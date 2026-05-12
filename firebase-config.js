import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {    
    apiKey: "AIzaSyBT3joJWX-dsz4C9-wKsffepSpXypn1n9E",    
    authDomain: "time-management-28962.firebaseapp.com",    
    projectId: "time-management-28962",    
    storageBucket: "time-management-28962.firebasestorage.app",    
    messagingSenderId: "813174935711",    
    appId: "1:813174935711:web:066f4442e08e600cf512aa"    
};    

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
