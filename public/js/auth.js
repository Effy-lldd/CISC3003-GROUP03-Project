// ======================== AUTH PAGE LOGIC ========================
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop();

    // Check if already logged in, redirect to dashboard
    const user = localStorage.getItem('finomic_user');
    if (user && (currentPage === 'login.html' || currentPage === 'signup.html')) {
        window.location.href = 'dashboard.html';
        return;
    }

    // ======================== LOGIN PAGE ========================
    if (currentPage === 'login.html') {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;

                if (!email || !password) {
                    showError('login-error', 'Please fill in all fields');
                    return;
                }

                const user = { email: email, name: email.split('@')[0] };
                localStorage.setItem('finomic_user', JSON.stringify(user));
                window.location.href = 'dashboard.html';
            });
        }
    }

    // ======================== SIGNUP PAGE ========================
    if (currentPage === 'signup.html') {
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const confirm = document.getElementById('signup-confirm').value;

                if (!name || !email || !password || !confirm) {
                    showError('signup-error', 'Please fill in all fields');
                    return;
                }
                if (password.length < 6) {
                    showError('signup-error', 'Password must be at least 6 characters');
                    return;
                }
                if (password !== confirm) {
                    showError('signup-error', 'Passwords do not match');
                    return;
                }

                const user = { email: email, name: name };
                localStorage.setItem('finomic_user', JSON.stringify(user));
                localStorage.setItem('finomic_pending_email', email);
                window.location.href = 'verify-email.html';
            });
        }
    }

    // ======================== VERIFY EMAIL PAGE ========================
    if (currentPage === 'verify-email.html') {
        const pendingEmail = localStorage.getItem('finomic_pending_email');
        if (pendingEmail) {
            document.getElementById('verify-email-display').textContent = pendingEmail;
        }

        const verifyForm = document.getElementById('verify-form');
        if (verifyForm) {
            verifyForm.addEventListener('submit', function (e) {
                e.preventDefault();
                hideElement('verify-form');
                showElement('verify-success');
                localStorage.removeItem('finomic_pending_email');
                setTimeout(function () {
                    window.location.href = 'dashboard.html';
                }, 1500);
            });
        }

        // OTP auto-advance
        const otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach(function (input, index) {
            input.addEventListener('input', function () {
                if (this.value && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Backspace' && !this.value && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });
        });
    }

    // ======================== FORGOT PASSWORD PAGE ========================
    if (currentPage === 'forgot-password.html') {
        const forgotForm = document.getElementById('forgot-form');
        if (forgotForm) {
            forgotForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const email = document.getElementById('forgot-email').value;
                if (!email) return;

                document.getElementById('forgot-email-display').textContent = email;
                hideElement('forgot-form');
                showElement('forgot-success');
            });
        }
    }

    // ======================== RESET PASSWORD PAGE ========================
    if (currentPage === 'reset-password.html') {
        const resetForm = document.getElementById('reset-form');
        if (resetForm) {
            resetForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const password = document.getElementById('reset-password').value;
                const confirm = document.getElementById('reset-confirm').value;

                if (password.length < 6) {
                    showError('reset-error', 'Password must be at least 6 characters');
                    return;
                }
                if (password !== confirm) {
                    showError('reset-error', 'Passwords do not match');
                    return;
                }

                hideElement('reset-form');
                showElement('reset-success');
                setTimeout(function () {
                    window.location.href = 'login.html';
                }, 2000);
            });
        }
    }
});

// ======================== HELPER FUNCTIONS ========================
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

function hideElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

function showElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
}
