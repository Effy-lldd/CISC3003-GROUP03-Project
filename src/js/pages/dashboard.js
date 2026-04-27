import { auth } from '../firebase/auth.js';
import { getUserIncomesFromCache, getUserExpensesFromCache, loadInitialCache } from '../api/mymoney.js';
import { formatCurrency, formatDate, getTransactionIcon } from '../modules/helpers.js';
import { mapCategoryToFrontend } from '../modules/transactions.js';
import { addGoal, getUserGoalsFromCache, initGoalsCache, loadGoalsFromAPI } from '../api/mymoney.js';

let transactions = [];
let currentUser = null;
let goals = [];

document.addEventListener('DOMContentLoaded', function () {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            
            await loadInitialCache(currentUser.email);
            await loadGoals();
            await loadTransactionsFromCache();
            updateDashboard();
            renderGoals();
            renderTransactionCalendar(); 
        } else {
            window.location.href = 'login.html';
        }
    });
});

// 在 DOMContentLoaded 中添加事件监听
document.getElementById('setGoalBtn')?.addEventListener('click', () => {
    const modal = document.getElementById('goalModal');
    modal.style.display = 'flex';
    // 设置默认日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('goalStartDate').value = today;
    document.getElementById('goalEndDate').value = today;
});

document.querySelector('.close-modal')?.addEventListener('click', () => {
    document.getElementById('goalModal').style.display = 'none';
});
document.getElementById('cancelModalBtn')?.addEventListener('click', () => {
    document.getElementById('goalModal').style.display = 'none';
});

document.getElementById('goalForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const goalData = {
        user: currentUser.email.split('@')[0],
        name: document.getElementById('goalName').value,
        startDate: document.getElementById('goalStartDate').value,
        endDate: document.getElementById('goalEndDate').value,
        description: document.getElementById('goalDescription').value,
        targetType: document.getElementById('goalTargetType').value,
        targetAmount: parseFloat(document.getElementById('goalTargetAmount').value)
    };
    const result = await addGoal(goalData);
    if (result.success) {
        document.getElementById('goalModal').style.display = 'none';
        await loadGoals();
        renderTransactionCalendar();
    } else {
        alert('Error saving goal');
    }
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

async function loadGoals() {
    const result = await getUserGoalsFromCache(currentUser.email);
    if (result.success) goals = result.data;
    else goals = [];
    renderGoals();
    renderTransactionCalendar();
}

function renderGoals() {
    const container = document.getElementById('goalsList');
    if (!container) return;
    if (goals.length === 0) {
        container.innerHTML = '<div class="empty-state">No goals set. Click "Set Goal" to start.</div>';
        return;
    }
    container.innerHTML = goals.map(goal => {
        // 计算时间进度（基于当前日期在 startDate 和 endDate 之间的位置）
        const now = new Date();
        const start = new Date(goal.startDate);
        const end = new Date(goal.endDate);
        let progressPercent = 0;
        if (now >= end) progressPercent = 100;
        else if (now <= start) progressPercent = 0;
        else {
            const total = end - start;
            const elapsed = now - start;
            progressPercent = (elapsed / total) * 100;
        }
        // 财务进度（根据 targetType 计算实际值）
        let actualValue = 0;
        if (goal.targetType === 'save') {
            const totalIncome = transactions.filter(t => t.type === 'income' && new Date(t.date) >= start && new Date(t.date) <= end).reduce((s, t) => s + t.amount, 0);
            const totalExpense = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= start && new Date(t.date) <= end).reduce((s, t) => s + t.amount, 0);
            actualValue = totalIncome - totalExpense;
        } else if (goal.targetType === 'income') {
            actualValue = transactions.filter(t => t.type === 'income' && new Date(t.date) >= start && new Date(t.date) <= end).reduce((s, t) => s + t.amount, 0);
        } else if (goal.targetType === 'expense') {
            actualValue = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= start && new Date(t.date) <= end).reduce((s, t) => s + t.amount, 0);
        }
        const financialProgress = Math.min((actualValue / goal.targetAmount) * 100, 100);
        const displayProgress = (goal.targetType === 'expense') ? Math.min((goal.targetAmount / actualValue) * 100, 100) : financialProgress; // expense 越低越好
        return `
            <div class="goal-item">
                <div style="display: flex; justify-content: space-between;">
                    <strong>${goal.name}</strong>
                    <button class="delete-goal-btn" data-id="${goal._id}" style="background: none; border: none; color: #eeb58f; cursor: pointer;">✕</button>
                </div>
                <p style="font-size: 13px; color: #9ca3af;">${goal.description || ''} (${goal.startDate} → ${goal.endDate})</p>
                <div>Progress: ${displayProgress.toFixed(1)}%</div>
                <div class="goal-progress"><div class="goal-progress-fill" style="width: ${displayProgress}%;"></div></div>
                <div>${formatCurrency(actualValue)} / ${formatCurrency(goal.targetAmount)}</div>
            </div>
        `;
    }).join('');
    // 绑定删除按钮事件
    document.querySelectorAll('.delete-goal-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = btn.getAttribute('data-id');
            if (confirm('Delete this goal?')) {
                await deleteGoal(id);
                await loadGoals();
                renderTransactionCalendar();
            }
        });
    });
}


// 直接覆盖原有函数（不再使用 window 或临时变量）
renderTransactionCalendar = function() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const container = document.getElementById('calendar-dates-container');
    const monthLabel = document.getElementById('overview-current-month');

    monthLabel.textContent = getMonthName(today);
    container.innerHTML = '';

    // 原有 transactions 高亮
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

    // 新增 goals 高亮
    const goalDays = new Set();
    goals.forEach(goal => {
        const start = new Date(goal.startDate);
        const end = new Date(goal.endDate);
        if (start.getFullYear() === currentYear && start.getMonth() === currentMonth) {
            const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const endDay = (end.getMonth() === currentMonth) ? end.getDate() : lastDayOfMonth;
            for (let d = start.getDate(); d <= endDay; d++) goalDays.add(d);
        } else if (end.getFullYear() === currentYear && end.getMonth() === currentMonth) {
            for (let d = 1; d <= end.getDate(); d++) goalDays.add(d);
        } else if (start < new Date(currentYear, currentMonth, 1) && end > new Date(currentYear, currentMonth + 1, 0)) {
            for (let d = 1; d <= new Date(currentYear, currentMonth + 1, 0).getDate(); d++) goalDays.add(d);
        }
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
        if (goalDays.has(day)) {
            dateEl.classList.add('goal-range');
            dateEl.style.boxShadow = '0 0 0 2px #98e5db';
        }
        container.appendChild(dateEl);
    }
};

// 删除 updateCalendarWithGoals 函数（或确保不被调用）
// 如果其他地方调用 updateCalendarWithGoals，请改为 renderTransactionCalendar()

// 确保重新绑定新函数
const originalRender = renderTransactionCalendar;
renderTransactionCalendar = window.renderTransactionCalendar;