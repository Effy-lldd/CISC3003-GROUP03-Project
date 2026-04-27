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
            await loadInitialCache(currentUser.email);
            await loadTransactionsFromCache();
            updateReports();
        } else {
            window.location.href = 'login.html';
        }
    });
});

async function loadTransactionsFromCache() {
    if (!currentUser) return;
    
    const userEmail = currentUser.email;
    
    try {
        const incomesResult = await getUserIncomesFromCache(userEmail);
        const expensesResult = await getUserExpensesFromCache(userEmail);
        
        const incomes = (incomesResult.success ? incomesResult.data : []).map(inc => ({
            id: inc._id,
            type: 'income',
            amount: parseFloat(inc.amount) || 0,
            category: inc.category || 'Salary',
            description: inc.description || '',
            date: inc.date.split('T')[0],
            method: 'API'
        }));
        
        const expenses = (expensesResult.success ? expensesResult.data : []).map(exp => ({
            id: exp._id,
            type: 'expense',
            amount: parseFloat(exp.amount) || 0,
            category: mapCategoryToFrontend(exp.category, 'expense') || 'Other',
            description: exp.description || '',
            date: exp.date.split('T')[0],
            method: 'API'
        }));
        
        transactions = [...incomes, ...expenses];
        
        console.log(`Reports loaded ${transactions.length} transactions from cache`);
        
    } catch (error) {
        console.error('Error loading transactions for reports:', error);
        transactions = [];
    }
}

function updateReports() {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;

    document.getElementById('report-total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('report-total-expenses').textContent = formatCurrency(totalExpenses);

    const netSavingsEl = document.getElementById('net-savings');
    netSavingsEl.textContent = formatCurrency(Math.abs(netSavings));
    netSavingsEl.className = netSavings >= 0 ? 'teal' : 'red';

    document.getElementById('net-savings-status').textContent = netSavings >= 0 ? 'Positive balance' : 'Negative balance';

    updateMonthlyBreakdown();
}

function updateMonthlyBreakdown() {
    const monthlyData = {};

    transactions.forEach(t => {
        if (t.amount <= 0) return;
        
        const date = new Date(t.date);
        if (isNaN(date.getTime())) return;
        
        const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { 
                month: monthName, 
                income: 0, 
                expenses: 0, 
                date: date 
            };
        }

        if (t.type === 'income') {
            monthlyData[monthKey].income += t.amount;
        } else {
            monthlyData[monthKey].expenses += t.amount;
        }
    });

    const sortedData = Object.values(monthlyData).sort((a, b) => a.date - b.date);

    renderMonthlyChart(sortedData);
    
    renderMonthlyTable(sortedData);
}

function renderMonthlyChart(sortedData) {
    const chartCard = document.getElementById('chart-card');
    const chartContainer = document.getElementById('chart-container');

    if (sortedData.length > 0) {
        chartCard.style.display = 'block';
        const maxVal = Math.max(...sortedData.map(s => Math.max(s.income, s.expenses)));
        const maxValue = maxVal === 0 ? 1 : maxVal;

        chartContainer.innerHTML = sortedData.map(d => {
            const incomeHeight = (d.income / maxValue) * 100;
            const expenseHeight = (d.expenses / maxValue) * 100;
            return `
                <div class="chart-bar-group">
                    <div class="chart-bars">
                        <div class="chart-bar-income" style="height:${Math.max(incomeHeight, 2)}%;" title="Income: ${formatCurrency(d.income)}"></div>
                        <div class="chart-bar-expense" style="height:${Math.max(expenseHeight, 2)}%;" title="Expenses: ${formatCurrency(d.expenses)}"></div>
                    </div>
                    <span class="chart-bar-label">${d.month}</span>
                </div>
            `;
        }).join('');
    } else {
        chartCard.style.display = 'none';
    }
}

function renderMonthlyTable(sortedData) {
    const tbody = document.getElementById('monthly-table-body');

    if (sortedData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:48px 24px; color:#9ca3af;">No monthly data available</td></tr>';
    } else {
        tbody.innerHTML = sortedData.map(data => {
            const net = data.income - data.expenses;
            const savingsRate = data.income > 0 ? ((net / data.income) * 100) : 0;

            return `
                <tr>
                    <td>${data.month}</td>
                    <td class="text-right green">${formatCurrency(data.income)}</td>
                    <td class="text-right red">${formatCurrency(data.expenses)}</td>
                    <td class="text-right ${net >= 0 ? 'teal' : 'red'}">
                        ${net >= 0 ? '+' : '-'}${formatCurrency(Math.abs(net))}
                    </td>
                    <td class="text-right">${savingsRate.toFixed(1)}%</td>
                </tr>
            `;
        }).join('');
    }
}