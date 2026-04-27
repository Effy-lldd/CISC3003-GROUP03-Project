import { auth } from './config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    confirmPasswordReset,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// ========== AUTH FUNCTIONS ==========
export async function signUp(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    return userCredential.user;
}

export async function signIn(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
        throw new Error('Por favor, verifique seu email antes de fazer login.');
    }
    return userCredential.user;
}

export async function sendResetEmail(email) {
    await sendPasswordResetEmail(auth, email);
}

export async function resetPassword(oobCode, newPassword) {
    await confirmPasswordReset(auth, oobCode, newPassword);
}

export async function signOut() {
    await firebaseSignOut(auth);
    window.location.href = 'login.html';
}

export function getCurrentUser() {
    return auth.currentUser;
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export { auth };