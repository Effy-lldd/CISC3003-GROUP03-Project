import { resetPassword } from '../firebase/auth.js';

function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function showError(message) {
    const el = document.getElementById('reset-error');
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

function showSuccess(message) {
    const el = document.getElementById('reset-success');
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const oobCode = getParameterByName('oobCode');
    const mode = getParameterByName('mode');

    if (!oobCode || mode !== 'resetPassword') {
        showError('Link inválido ou expirado. Solicite um novo reset de senha.');
        document.getElementById('reset-form').style.display = 'none';
        return;
    }

    const form = document.getElementById('reset-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('reset-password').value;
        const confirmPassword = document.getElementById('reset-confirm').value;

        if (newPassword !== confirmPassword) {
            showError('As senhas não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
            showError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            await resetPassword(oobCode, newPassword);
            showSuccess('Senha alterada com sucesso! Redirecionando...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (error) {
            showError(error.message);
        }
    });
});