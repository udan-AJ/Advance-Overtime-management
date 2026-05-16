import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. LOGIN FUNCTION (WITH AUTO LOGS)
export async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    try {
        // Firestore එකෙන් ලොග් වුණු යූසර්ගෙ ප්‍රොෆයිල් විස්තර ගන්නවා (නම ට්‍රැක් කරන්න)
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const displayName = userDoc.exists() && userDoc.data().name 
            ? userDoc.data().name 
            : user.email.split('@')[0].toUpperCase();

        // login_logs කන්සෝල් එකට විස්තර ඇතුළත් කිරීම
        await addDoc(collection(db, "login_logs"), {
            uid: user.uid,
            email: user.email,
            name: displayName,
            timestamp: serverTimestamp()
        });
    } catch (logError) {
        console.error("Error creating login log: ", logError);
        // ලොග් එක වැටුණෙ නැතත් යූසර්ගෙ ලොගින් එක බ්ලොක් වෙන්නෙ නැහැ
    }

    return userCredential;
}

// 2. LOGOUT FUNCTION
export async function logout() {
    return await signOut(auth);
}

// 3. AUTH STATE INITIALIZATION
export function initAuth(onLogin, onLogout) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            onLogin(user);
        } else {
            onLogout();
        }
    });
}
