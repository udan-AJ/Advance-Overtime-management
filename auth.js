import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const initAuth = (onUserIn, onUserOut) => {
    onAuthStateChanged(auth, (user) => {
        if (user) onUserIn(user);
        else onUserOut();
    });
};

export const login = async (email, pass) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    // Login Log ekak add kirima
    await addDoc(collection(db, "logs"), {
        user: email,
        time: new Date().getTime(),
        status: "success"
    });
    return res;
};

export const signup = async (email, pass) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const user = res.user;
    // Firestore eke user document eka create kirima
    await setDoc(doc(db, "users", user.uid), {
        email: email,
        isAdmin: false,
        createdAt: new Date().getTime()
    });
    return res;
};

export const logout = () => signOut(auth);
