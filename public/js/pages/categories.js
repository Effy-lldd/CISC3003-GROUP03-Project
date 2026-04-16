// ======================== CATEGORIES PAGE ========================
import { auth } from '../firebase/auth.js';
import { getUserIncomesFromCache, getUserExpensesFromCache, loadInitialCache } from '../api/mymoney.js';
import { formatCurrency } from '../modules/helpers.js';
import { mapCategoryToFrontend } from '../modules/transactions.js';

let transactions = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            
            // Garantir que cache está carregado
            await loadInitialCache(currentUser.email);
            
            // Carregar transações do cache
            await loadTransactionsFromCache();
            updateCategories();
        } else {
            window.location.href = 'login.html';
        }
    });
});

// NOVA FUNÇÃO: Carrega transações DO CACHE
async function loadTransactionsFromCache() {
    const userEmail = currentUser.email;
    
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
        
        console.log(`Categories loaded ${transactions.length} transactions from cache`);
        
    } catch (error) {
        console.error('Error loading transactions for categories:', error);
        transactions = [];
    }
}

function updateCategories() {
    const gradients = [
        'linear-gradient(to bottom right, #10b981, #06b6d4)',
        'linear-gradient(to bottom right, #3b82f6, #6366f1)',
        'linear-gradient(to bottom right, #a855f7, #ec4899)',
        'linear-gradient(to bottom right, #f97316, #ef4444)',
        'linear-gradient(to bottom right, #facc15, #f97316)',
        'linear-gradient(to bottom right, #22c55e, #10b981)'
    ];

    function buildCatData(type) {
        const filtered = transactions.filter(t => t.type === type);
        const grouped = {};
        filtered.forEach(t => {
            grouped[t.category] = (grouped[t.category] || 0) + t.amount;
        });
        const total = Object.values(grouped).reduce((s, a) => s + a, 0);
        return Object.keys(grouped).map(category => ({
            category: category,
            amount: grouped[category],
            percentage: total > 0 ? (grouped[category] / total) * 100 : 0,
            count: filtered.filter(t => t.category === category).length
        })).sort((a, b) => b.amount - a.amount);
    }

    const expenseData = buildCatData('expense');
    const incomeData = buildCatData('income');
    const totalExpenses = expenseData.reduce((s, d) => s + d.amount, 0);

    document.getElementById('total-categories').textContent = expenseData.length + incomeData.length;
    document.getElementById('categories-breakdown').textContent = `${expenseData.length} expense, ${incomeData.length} income`;
    document.getElementById('top-category').textContent = expenseData[0] ? expenseData[0].category : 'N/A';
    document.getElementById('top-category-amount').textContent = expenseData[0] ? formatCurrency(expenseData[0].amount) : '$0.00';
    document.getElementById('avg-category').textContent = expenseData.length > 0 ? formatCurrency(totalExpenses / expenseData.length) : '$0.00';

    // Expense categories
    const expenseContainer = document.getElementById('expense-categories');
    if (expenseData.length === 0) {
        expenseContainer.innerHTML = '<div class="empty-state">No expense data available</div>';
    } else {
        expenseContainer.innerHTML = expenseData.map((item, index) => `
            <div class="category-item">
                <div class="category-header">
                    <div class="category-left">
                        <div class="category-icon" style="background:${gradients[index % 6]};">${item.category.substring(0, 2).toUpperCase()}</div>
                        <div class="category-name"><h5>${item.category}</h5><p>${item.count} transactions</p></div>
                    </div>
                    <div class="category-right">
                        <div class="category-amount">${formatCurrency(item.amount)}</div>
                        <div class="category-percentage">${item.percentage.toFixed(1)}%</div>
                    </div>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${item.percentage}%; background:${gradients[index % 6]};"></div></div>
            </div>
        `).join('');
    }

    // Income categories
    const incomeContainer = document.getElementById('income-categories');
    if (incomeData.length === 0) {
        incomeContainer.innerHTML = '<div class="empty-state">No income data available</div>';
    } else {
        incomeContainer.innerHTML = incomeData.map(item => `
            <div class="category-item">
                <div class="category-header">
                    <div class="category-left">
                        <div class="category-icon" style="background-color:rgba(34,197,94,0.2); color:#22c55e;">${item.category.substring(0, 2).toUpperCase()}</div>
                        <div class="category-name"><h5>${item.category}</h5><p>${item.count} transactions</p></div>
                    </div>
                    <div class="category-right">
                        <div class="category-amount green">${formatCurrency(item.amount)}</div>
                        <div class="category-percentage">${item.percentage.toFixed(1)}%</div>
                    </div>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${item.percentage}%; background-color:#22c55e;"></div></div>
            </div>
        `).join('');
    }
}