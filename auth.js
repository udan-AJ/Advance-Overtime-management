import { auth } from './firebase-config.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export const initAuth = (onUserIn, onUserOut) => {
    onAuthStateChanged(auth, (user) => {
        if (user) onUserIn(user);
        else onUserOut();
    });
};

export const login = (email, pass) => signInWithEmailAndPassword(auth, email, pass);
export const signup = (email, pass) => createUserWithEmailAndPassword(auth, email, pass);
export const logout = () => signOut(auth);
