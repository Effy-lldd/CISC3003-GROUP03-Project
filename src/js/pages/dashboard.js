import { auth } from '../firebase/auth.js';
import { getUserIncomesFromCache, getUserExpensesFromCache, loadInitialCache } from '../api/mymoney.js';
import { formatCurrency, formatDate, getTransactionIcon } from '../modules/helpers.js';
import { mapCategoryToFrontend } from '../modules/transactions.js';

let transactions = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            
            await loadInitialCache(currentUser.email);
            
            await loadTransactionsFromCache();
            updateDashboard();
        } else {
            window.location.href = 'login.html';
        }
    });
});

async function loadTransactionsFromCache() {
    const userEmail = currentUser.email;
    const userName = userEmail.split('@')[0];
    
    showLoading();
    
    try {
        const incomesResult = await getUserIncomesFromCache(userEmail);
        const expensesResult = await getUserExpensesFromCache(userEmail);
        
        const incomes = (incomesResult.success ? incomesResult.data : []).map(inc => ({
            id: inc._id,
            type: 'income',
            amount: inc.amount,
            category: inc.category || 'Salary',
            description: inc.description,
            date: inc.date.split('T')[0],
            method: 'API'
        }));
        
        const expenses = (expensesResult.success ? expensesResult.data : []).map(exp => ({
            id: exp._id,
            type: 'expense',
            amount: exp.amount,
            category: mapCategoryToFrontend(exp.category, 'expense') || 'Other',
            description: exp.description,
            date: exp.date.split('T')[0],
            method: 'API'
        }));
        
        transactions = [...incomes, ...expenses];
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        console.log(`Loaded ${transactions.length} transactions from cache for user: ${userName}`);
        
    } catch (error) {
        console.error('Error loading transactions from cache:', error);
        transactions = [];
    }
    
    hideLoading();
}

function showLoading() {
    const elements = ['total-balance', 'total-income', 'total-expenses'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = 'Loading...';
    });
}

function hideLoading() {
    
}

function updateDashboard() {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    document.getElementById('total-balance').textContent = formatCurrency(balance);
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);

    const incomeCount = transactions.filter(t => t.type === 'income').length;
    const expenseCount = transactions.filter(t => t.type === 'expense').length;

    document.getElementById('income-count').textContent = '+' + incomeCount + ' transactions';
    document.getElementById('expense-count').textContent = expenseCount + ' transactions';

    const currentDate = new Date();
    document.getElementById('current-month').textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    document.getElementById('total-transactions').textContent = transactions.length;
    document.getElementById('income-transactions').textContent = incomeCount;
    document.getElementById('expense-transactions').textContent = expenseCount;

    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    document.getElementById('savings-rate').textContent = savingsRate.toFixed(1) + '%';
    document.getElementById('expense-ratio').textContent = expenseRatio.toFixed(1) + '%';
    document.getElementById('savings-progress').style.width = Math.min(savingsRate, 100) + '%';
    document.getElementById('expense-progress').style.width = Math.min(expenseRatio, 100) + '%';

    updateRecentTransactions();

    renderTransactionCalendar();
}

function updateRecentTransactions() {
    const container = document.getElementById('recent-transactions');
    const recent = transactions.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state">No transactions yet. Add your first transaction!</div>';
        return;
    }

    container.innerHTML = recent.map(t => `
        <div class="transaction-item">
            <div class="transaction-left">
                <div class="transaction-icon ${t.type}">${getTransactionIcon(t.type)}</div>
                <div class="transaction-info">
                    <h5>${t.description}</h5>
                    <p>${t.category} &bull; ${formatDate(t.date)}</p>
                </div>
            </div>
            <div class="transaction-right">
                <div class="transaction-amount ${t.type === 'income' ? 'green' : 'red'}">
                    ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                </div>
                ${t.method ? `<div class="transaction-method">${t.method}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function getMonthName(date) {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function renderTransactionCalendar() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const container = document.getElementById('calendar-dates-container');
    const monthLabel = document.getElementById('overview-current-month');

    monthLabel.textContent = getMonthName(today);
    container.innerHTML = '';

    const currentMonthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
    });

    const transactionMap = {};
    currentMonthTransactions.forEach(t => {
        const day = new Date(t.date).getDate();
        if (!transactionMap[day]) transactionMap[day] = { income: false, expense: false };
        if (t.type === 'income') transactionMap[day].income = true;
        if (t.type === 'expense') transactionMap[day].expense = true;
    });

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstWeekDay = firstDay.getDay();

    for (let i = 0; i < firstWeekDay; i++) {
        const empty = document.createElement('span');
        empty.className = 'date-item empty';
        container.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateEl = document.createElement('span');
        dateEl.className = 'date-item';
        dateEl.textContent = day;

        const txData = transactionMap[day];
        if (txData) {
            if (txData.income) dateEl.classList.add('income');
            if (txData.expense) dateEl.classList.add('expense');
        }

        container.appendChild(dateEl);
    }
}