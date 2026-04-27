import { onAuthChange } from '../firebase/auth.js';

const PUBLIC_PAGES = ['index.html', '', 'login.html', 'signup.html', 'forgot-password.html', 'reset-password.html'];
const PROTECTED_PAGES = ['dashboard.html', 'transactions.html', 'categories.html', 'reports.html', 'help.html'];

export function initAuthGuard() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    onAuthChange((user) => {
        const isPublic = PUBLIC_PAGES.includes(currentPage);
        const isProtected = PROTECTED_PAGES.includes(currentPage);

        if (user && isPublic && currentPage !== 'reset-password.html') {
            window.location.href = 'dashboard.html';
        } else if (!user && isProtected) {
            window.location.href = 'login.html';
        }
    });
}