import { auth, db } from './firebase-config.js';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Auth State එක Check කිරීම සහ User මාරු වන විට ක්‍රියාත්මක වීම
export const initAuth = (onUserIn, onUserOut) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            onUserIn(user);
        } else {
            onUserOut();
        }
    });
};

// Login Function එක සමඟ Logging Feature එක
export const login = async (email, pass) => {
    try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        
        // Admin Panel එකේ බලාගන්න ලොග් එකක් ඇතුළත් කිරීම
        await addDoc(collection(db, "logs"), {
            user: email,
            time: new Date().getTime(),
            action: "LOGIN_SUCCESS"
        });
        
        return res;
    } catch (error) {
        // ලොගින් එක fail වුණොත් ඒකත් ට්‍රැක් කරන්න පුළුවන් (Optional)
        throw error;
    }
};

// Signup Function එක - අලුතින් යූසර් කෙනෙක් හැදෙන විට Firestore එකේ User Document එකක් සෑදීම
export const signup = async (email, pass) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        const user = res.user;

        // අලුත් යූසර් කෙනෙක්ව Firestore 'users' collection එකට ඇතුළත් කිරීම
        // default විදියට isAdmin: false ලෙස සකසයි
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            isAdmin: false,
            createdAt: new Date().getTime()
        });

        return res;
    } catch (error) {
        throw error;
    }
};

// Logout Function එක
export const logout = () => {
    return signOut(auth);
};
