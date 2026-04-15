// ======================== DASHBOARD PAGE ========================
document.addEventListener('DOMContentLoaded', function () {
    loadTransactions();
    updateDashboard();
});

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
