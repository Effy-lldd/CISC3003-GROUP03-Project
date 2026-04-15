// ======================== SIDEBAR COMPONENT ========================
document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    if (!checkAuth()) return;

    // Load sidebar HTML
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
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
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
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
                        <p class="user-name">${currentUser.name}</p>
                        <p class="user-email">${currentUser.email}</p>
                    </div>
                    <button class="nav-item signout-btn" id="signout-btn">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <!-- Mobile Menu Button -->
            <button class="mobile-menu-btn" id="mobile-menu-btn">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        `;

        // Setup signout button
        document.getElementById('signout-btn').addEventListener('click', signOut);

        // Setup mobile menu
        initializeMobileMenu();
    }
});

function initializeMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    menuBtn.addEventListener('click', function () {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', function () {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
}
