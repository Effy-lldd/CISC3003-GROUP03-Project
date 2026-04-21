import { getCurrentUser, signOut, onAuthChange } from '../firebase/auth.js';

// 初始化移动端菜单交互
function initializeMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    if (!menuBtn || !sidebar) return;

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        menuBtn.innerHTML = sidebar.classList.contains('open') 
            ? '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
            : '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        menuBtn.innerHTML = '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        document.body.style.overflow = '';
    });

    const navLinks = sidebar.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        if (link.tagName === 'A') {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('active');
                    menuBtn.innerHTML = '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
                    document.body.style.overflow = '';
                }
            });
        }
    });
}

// 新增：初始化主题（页面加载自动应用）
function initTheme() {
    const isLight = localStorage.getItem('lightMode') === 'true';
    document.body.classList.toggle('light-mode', isLight);
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme(); // 初始化主题
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    onAuthChange((user) => {
        if (!user) {
            sidebarContainer.style.display = 'none';
            return;
        }

        sidebarContainer.style.display = 'block';
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        
        sidebarContainer.innerHTML = `
            <aside class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <div class="logo">
                        <div class="logo-icon">$</div>
                        <div class="logo-text">
                            <h1>Finomic</h1>
                            <p>Financial Assistant</p>
                        </div>
                    </div>
                </div>
                <nav class="sidebar-nav">
                    <p class="nav-label">MENU</p>
                    <a href="dashboard.html" class="nav-item ${currentPage === 'dashboard' ? 'active' : ''}">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        <span>Dashboard</span>
                    </a>
                    <a href="transactions.html" class="nav-item ${currentPage === 'transactions' ? 'active' : ''}">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9 a4 4 0 0 1 4 -4 h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1 -4 4H3"></path></svg>
                        <span>Transactions</span>
                    </a>
                    <a href="categories.html" class="nav-item ${currentPage === 'categories' ? 'active' : ''}">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                        <span>Categories</span>
                    </a>
                    <a href="reports.html" class="nav-item ${currentPage === 'reports' ? 'active' : ''}">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                        <span>Reports</span>
                    </a>
                    <a href="help.html" class="nav-item ${currentPage === 'help' ? 'active' : ''}">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <span>Help & Tips</span>
                    </a>
                </nav>
                <div class="sidebar-footer">
                    <div class="sidebar-user-info">
                        <p class="user-name">${user.displayName || 'Usuário'}</p>
                        <p class="user-email">${user.email}</p>
                    </div>
                    <div class="theme-toggle-btn nav-item" id="theme-toggle">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        <span id="theme-text">${localStorage.getItem('lightMode') === 'true' ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                    <button class="nav-item signout-btn" id="signout-btn">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
            <button class="mobile-menu-btn" id="mobile-menu-btn">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        `;

        const signoutBtn = document.getElementById('signout-btn');
        if (signoutBtn) {
            signoutBtn.addEventListener('click', async () => {
                try {
                    await signOut();
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Sign out error:', error);
                }
            });
        }

        // 主题切换逻辑
        const themeToggle = document.getElementById('theme-toggle');
        const themeText = document.getElementById('theme-text');
        if (themeToggle && themeText) {
            themeToggle.addEventListener('click', () => {
                const isLight = localStorage.getItem('lightMode') === 'true';
                localStorage.setItem('lightMode', !isLight);
                document.body.classList.toggle('light-mode', !isLight);
                themeText.textContent = !isLight ? 'Light Mode' : 'Dark Mode';
            });
        }

        initializeMobileMenu();
    });
});