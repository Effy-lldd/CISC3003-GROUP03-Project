import { auth } from '../firebase/auth.js';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;

            if (password !== confirm) {
                showError('signup-error', 'Passwords do not match');
                return;
            }

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    updateProfile(userCredential.user, { displayName: name });
                    sendEmailVerification(userCredential.user);
                    alert("Cadastro feito! Verifique seu email.");
                    window.location.href = 'login.html';
                })
                .catch((error) => {
                    showError('signup-error', error.message);
                });
        });
    }
});