// ======================== DATA & STATE ========================
let transactions = [];
let currentUser = null;

const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other Income'],
    expense: ['Rent', 'Groceries', 'Utilities', 'Entertainment', 'Transport', 'Healthcare', 'Shopping', 'Other']
};

// ======================== USER MANAGEMENT ========================
function loadUser() {
    const saved = localStorage.getItem('finomic_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        return currentUser;
    }
    return null;
}

function saveUser(user) {
    if (user) {
        localStorage.setItem('finomic_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('finomic_user');
    }
}

function signOut() {
    currentUser = null;
    saveUser(null);
    window.location.href = 'login.html';
}

// ======================== TRANSACTION DATA ========================
function loadTransactions() {
    const saved = localStorage.getItem('finomic_transactions');
    if (saved) {
        transactions = JSON.parse(saved);
    } else {
        transactions = [
            { id: '1', type: 'income', amount: 5000, category: 'Salary', description: 'Monthly Salary', date: '2024-04-01', method: 'Bank Transfer' },
            { id: '2', type: 'expense', amount: 1200, category: 'Rent', description: 'Apartment Rent', date: '2024-04-02', method: 'Bank Transfer' },
            { id: '3', type: 'expense', amount: 450, category: 'Groceries', description: 'Weekly Groceries', date: '2024-04-05', method: 'Credit Card' },
            { id: '4', type: 'income', amount: 800, category: 'Freelance', description: 'Web Design Project', date: '2024-04-08', method: 'PayPal' },
            { id: '5', type: 'expense', amount: 85, category: 'Utilities', description: 'Electricity Bill', date: '2024-04-10', method: 'Credit Card' },
            { id: '6', type: 'expense', amount: 200, category: 'Entertainment', description: 'Concert Tickets', date: '2024-04-12', method: 'Credit Card' },
            { id: '7', type: 'income', amount: 300, category: 'Investment', description: 'Stock Dividend', date: '2024-04-14', method: 'Bank Transfer' },
            { id: '8', type: 'expense', amount: 60, category: 'Transport', description: 'Gas Station', date: '2024-04-15', method: 'Debit Card' },
            { id: '9', type: 'expense', amount: 150, category: 'Shopping', description: 'New Headphones', date: '2024-04-16', method: 'Credit Card' },
            { id: '10', type: 'income', amount: 1200, category: 'Freelance', description: 'Mobile App Project', date: '2024-04-18', method: 'Bank Transfer' },
            { id: '11', type: 'expense', amount: 95, category: 'Healthcare', description: 'Doctor Visit', date: '2024-04-20', method: 'Cash' },
            { id: '12', type: 'expense', amount: 320, category: 'Groceries', description: 'Monthly Groceries', date: '2024-03-05', method: 'Credit Card' },
            { id: '13', type: 'income', amount: 5000, category: 'Salary', description: 'Monthly Salary', date: '2024-03-01', method: 'Bank Transfer' },
            { id: '14', type: 'expense', amount: 1200, category: 'Rent', description: 'Apartment Rent', date: '2024-03-02', method: 'Bank Transfer' }
        ];
        saveTransactions();
    }
    return transactions;
}

function saveTransactions() {
    localStorage.setItem('finomic_transactions', JSON.stringify(transactions));
}

function addTransaction(transaction) {
    transaction.id = Date.now().toString();
    transactions.unshift(transaction);
    saveTransactions();
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
}

// ======================== UTILITY FUNCTIONS ========================
function formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTransactionIcon(type) {
    if (type === 'income') {
        return '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>';
    }
    return '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>';
}

function getDeleteIcon() {
    return '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
}

// ======================== CHECK AUTH ========================
function checkAuth() {
    const user = loadUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    currentUser = user;
    return true;
}
