import { auth } from '../firebase/auth.js';
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
const forgotForm = document.getElementById('forgot-form');
        if (forgotForm) {
            forgotForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const email = document.getElementById('forgot-email').value;

                sendPasswordResetEmail(auth, email)
                    .then(() => {
                        document.getElementById('forgot-email-display').textContent = email;
                        hideElement('forgot-form');
                        showElement('forgot-success');
                    })
                    .catch((error) => {
                        showError('forgot-subtitle', error.message);
                    });
            });
        }
});
