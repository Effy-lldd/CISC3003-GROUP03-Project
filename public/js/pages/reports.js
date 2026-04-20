// ======================== REPORTS PAGE ========================
import { auth } from '../firebase/auth.js';
import { getUserIncomesFromCache, getUserExpensesFromCache, loadInitialCache } from '../api/mymoney.js';
import { formatCurrency } from '../modules/helpers.js';
import { mapCategoryToFrontend } from '../modules/transactions.js';

let transactions = [];
let currentUser = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    // 监听用户登录状态变化
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            
            // 确保缓存加载完成
            await loadInitialCache(currentUser.email);
            
            // 从缓存加载交易数据
            await loadTransactionsFromCache();
            // 更新报表展示
            updateReports();
        } else {
            // 未登录则跳转到登录页
            window.location.href = 'login.html';
        }
    });
});

// 从缓存加载收入和支出交易数据
async function loadTransactionsFromCache() {
    if (!currentUser) return;
    
    const userEmail = currentUser.email;
    
    try {
        // 获取缓存中的收入和支出数据
        const incomesResult = await getUserIncomesFromCache(userEmail);
        const expensesResult = await getUserExpensesFromCache(userEmail);
        
        // 格式化收入数据
        const incomes = (incomesResult.success ? incomesResult.data : []).map(inc => ({
            id: inc._id,
            type: 'income',
            amount: parseFloat(inc.amount) || 0, // 确保金额为数字
            category: inc.category || 'Salary',
            description: inc.description || '',
            date: inc.date.split('T')[0],
            method: 'API'
        }));
        
        // 格式化支出数据
        const expenses = (expensesResult.success ? expensesResult.data : []).map(exp => ({
            id: exp._id,
            type: 'expense',
            amount: parseFloat(exp.amount) || 0, // 确保金额为数字
            category: mapCategoryToFrontend(exp.category, 'expense') || 'Other',
            description: exp.description || '',
            date: exp.date.split('T')[0],
            method: 'API'
        }));
        
        // 合并收入和支出数据
        transactions = [...incomes, ...expenses];
        
        console.log(`Reports loaded ${transactions.length} transactions from cache`);
        
    } catch (error) {
        console.error('Error loading transactions for reports:', error);
        transactions = [];
    }
}

// 更新总览报表数据
function updateReports() {
    // 计算总收入、总支出、净储蓄
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;

    // 更新DOM展示
    document.getElementById('report-total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('report-total-expenses').textContent = formatCurrency(totalExpenses);

    // 处理净储蓄展示（颜色和状态文本）
    const netSavingsEl = document.getElementById('net-savings');
    netSavingsEl.textContent = formatCurrency(Math.abs(netSavings));
    netSavingsEl.className = netSavings >= 0 ? 'teal' : 'red';

    document.getElementById('net-savings-status').textContent = netSavings >= 0 ? 'Positive balance' : 'Negative balance';

    // 更新月度明细
    updateMonthlyBreakdown();
}

// 更新月度明细（图表+表格）
function updateMonthlyBreakdown() {
    const monthlyData = {};

    // 按月份分组统计数据
    transactions.forEach(t => {
        // 跳过金额为0的无效数据
        if (t.amount <= 0) return;
        
        const date = new Date(t.date);
        // 处理无效日期
        if (isNaN(date.getTime())) return;
        
        const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });

        // 初始化月度数据
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { 
                month: monthName, 
                income: 0, 
                expenses: 0, 
                date: date 
            };
        }

        // 累加收入/支出
        if (t.type === 'income') {
            monthlyData[monthKey].income += t.amount;
        } else {
            monthlyData[monthKey].expenses += t.amount;
        }
    });

    // 按时间排序
    const sortedData = Object.values(monthlyData).sort((a, b) => a.date - b.date);

    // 渲染月度趋势图表
    renderMonthlyChart(sortedData);
    
    // 渲染月度明细表格
    renderMonthlyTable(sortedData);
}

// 渲染月度趋势图表
function renderMonthlyChart(sortedData) {
    const chartCard = document.getElementById('chart-card');
    const chartContainer = document.getElementById('chart-container');

    if (sortedData.length > 0) {
        chartCard.style.display = 'block';
        // 计算最大值（用于图表高度比例）
        const maxVal = Math.max(...sortedData.map(s => Math.max(s.income, s.expenses)));
        const maxValue = maxVal === 0 ? 1 : maxVal;

        // 生成图表HTML
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
        // 无数据时隐藏图表
        chartCard.style.display = 'none';
    }
}

// 渲染月度明细表格
function renderMonthlyTable(sortedData) {
    const tbody = document.getElementById('monthly-table-body');

    if (sortedData.length === 0) {
        // 无数据时显示提示
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:48px 24px; color:#9ca3af;">No monthly data available</td></tr>';
    } else {
        // 生成表格行
        tbody.innerHTML = sortedData.map(data => {
            const net = data.income - data.expenses;
            // 计算储蓄率（避免除以0）
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