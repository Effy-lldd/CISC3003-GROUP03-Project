// public/js/api/mymoney.js
// VERSÃO COMPLETA COM CACHE

const API_URL = window.location.hostname === 'localhost' 
    ? '/api'  // Proxy do Vite
    : import.meta.env.VITE_MY_MONEY_API_URL;
const API_TOKEN = import.meta.env.VITE_MY_MONEY_API_AUTH;
const API_AUTH = 'Basic ' + API_TOKEN;

// ========== CACHE SYSTEM ==========
let cachedIncomes = [];
let cachedExpenses = [];

const CACHE_KEY_INCOMES = 'finomic_cache_incomes';
const CACHE_KEY_EXPENSES = 'finomic_cache_expenses';
const CACHE_TIMESTAMP_KEY = 'finomic_cache_timestamp';
const CACHE_MAX_AGE = 30 * 60 * 1000; // 30 minutos

function persistCache() {
    localStorage.setItem(CACHE_KEY_INCOMES, JSON.stringify(cachedIncomes));
    localStorage.setItem(CACHE_KEY_EXPENSES, JSON.stringify(cachedExpenses));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    console.log('💾 Cache persisted');
}

function loadPersistedCache() {
    const savedIncomes = localStorage.getItem(CACHE_KEY_INCOMES);
    const savedExpenses = localStorage.getItem(CACHE_KEY_EXPENSES);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (savedIncomes && savedExpenses && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < CACHE_MAX_AGE) {
            cachedIncomes = JSON.parse(savedIncomes);
            cachedExpenses = JSON.parse(savedExpenses);
            console.log(`📦 Cache restored: ${cachedIncomes.length} incomes, ${cachedExpenses.length} expenses`);
            return true;
        } else {
            clearPersistedCache();
        }
    }
    return false;
}

function clearPersistedCache() {
    localStorage.removeItem(CACHE_KEY_INCOMES);
    localStorage.removeItem(CACHE_KEY_EXPENSES);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
}

export function getCachedIncomes() {
    return [...cachedIncomes];
}

export function getCachedExpenses() {
    return [...cachedExpenses];
}

export async function loadInitialCache(userEmail) {
    if (loadPersistedCache() && cachedIncomes.length > 0) {
        console.log('📦 Using persisted cache');
        return;
    }
    
    console.log('🌐 Loading initial cache from API...');
    const userName = userEmail.split('@')[0];
    
    const incomesResult = await request('/income');
    if (incomesResult.ok) {
        cachedIncomes = incomesResult.data.data.filter(item => item.user === userName);
        console.log(`📦 Loaded ${cachedIncomes.length} incomes`);
    }
    
    const expensesResult = await request('/expenses');
    if (expensesResult.ok) {
        cachedExpenses = expensesResult.data.data.filter(item => item.user === userName);
        console.log(`📦 Loaded ${cachedExpenses.length} expenses`);
    }
    
    persistCache();
}

export async function forceRefreshCache(userEmail) {
    clearPersistedCache();
    cachedIncomes = [];
    cachedExpenses = [];
    await loadInitialCache(userEmail);
    console.log('🔄 Cache force refreshed');
}

// ========== FUNÇÕES COM CACHE (PARA ADD/DELETE) ==========

export async function addIncomeAndUpdateCache(incomeData) {
    const result = await addIncome(incomeData);
    if (result.success && result.data) {
        cachedIncomes.push(result.data);
        persistCache();
        console.log(`📦 Cache updated: +1 income (total: ${cachedIncomes.length})`);
    }
    return result;
}

export async function addExpenseAndUpdateCache(expenseData) {
    const result = await addExpense(expenseData);
    if (result.success && result.data) {
        cachedExpenses.push(result.data);
        persistCache();
        console.log(`📦 Cache updated: +1 expense (total: ${cachedExpenses.length})`);
    }
    return result;
}

export async function deleteIncomeAndUpdateCache(id) {
    const result = await deleteIncome(id);
    if (result.success) {
        const removed = cachedIncomes.find(i => i._id === id);
        cachedIncomes = cachedIncomes.filter(i => i._id !== id);
        persistCache();
        console.log(`📦 Cache updated: -1 income "${removed?.description}"`);
    }
    return result;
}

export async function deleteExpenseAndUpdateCache(id) {
    const result = await deleteExpense(id);
    if (result.success) {
        const removed = cachedExpenses.find(e => e._id === id);
        cachedExpenses = cachedExpenses.filter(e => e._id !== id);
        persistCache();
        console.log(`📦 Cache updated: -1 expense "${removed?.description}"`);
    }
    return result;
}

// ========== LEITURA DO CACHE (PARA DASHBOARD, CATEGORIES, REPORTS) ==========

export async function getUserIncomesFromCache(userEmail) {
    const userName = userEmail.split('@')[0];
    const filteredData = cachedIncomes.filter(item => item.user === userName);
    return { success: true, data: filteredData, fromCache: true };
}

export async function getUserExpensesFromCache(userEmail) {
    const userName = userEmail.split('@')[0];
    const filteredData = cachedExpenses.filter(item => item.user === userName);
    return { success: true, data: filteredData, fromCache: true };
}

export async function getUserStatementFromCache(userEmail, year, month) {
    const userName = userEmail.split('@')[0];
    
    const monthIncomes = cachedIncomes.filter(item => {
        if (item.user !== userName) return false;
        const date = new Date(item.date);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
    
    const monthExpenses = cachedExpenses.filter(item => {
        if (item.user !== userName) return false;
        const date = new Date(item.date);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
    
    const totalIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const categoryMap = {
        'Alimentação': 0, 'Saúde': 0, 'Moradia': 0, 'Transporte': 0,
        'Educação': 0, 'Lazer': 0, 'Imprevistos': 0, 'Outras': 0
    };
    
    monthExpenses.forEach(exp => {
        const cat = exp.category || 'Outras';
        if (categoryMap[cat] !== undefined) {
            categoryMap[cat] += exp.amount;
        } else {
            categoryMap['Outras'] += exp.amount;
        }
    });
    
    const categoryExpenses = Object.keys(categoryMap).map(cat => ({
        category: cat,
        total: categoryMap[cat]
    }));
    
    return {
        success: true,
        data: {
            totalIncome,
            totalExpenses,
            monthBalance: totalIncome - totalExpenses,
            categoryExpenses
        },
        fromCache: true
    };
}

// ========== FUNÇÕES BASE (REQUEST E CRUD ORIGINAIS) ==========

async function request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': API_AUTH,
        ...options.headers
    };

    console.log(`📡 ${options.method || 'GET'} ${url}`);

    try {
        const response = await fetch(url, { ...options, headers });
        const data = await response.json();

        const result = {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            data: data,
            error: !response.ok ? data.error || data.message || `HTTP ${response.status}` : null
        };

        console.log('📦 Response:', result);
        return result;
    } catch (networkError) {
        return {
            ok: false,
            status: 0,
            statusText: 'Network Error',
            data: null,
            error: networkError.message,
            networkError: true
        };
    }
}

// ========== INCOMES ==========

export async function getAllIncomes() {
    const result = await request('/income');
    if (result.ok) {
        return { success: true, data: result.data.data, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

export async function addIncome(incomeData) {
    const requiredFields = ['user', 'description', 'amount', 'date'];
    for (const field of requiredFields) {
        if (!incomeData[field]) {
            return {
                success: false,
                error: `Campo '${field}' é obrigatório para criar uma receita.`,
                validationError: true
            };
        }
    }
    
    const result = await request('/income', {
        method: 'POST',
        body: JSON.stringify(incomeData)
    });
    
    if (result.ok) {
        return { success: true, data: result.data.data, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

export async function getIncomeById(id) {
    const result = await request(`/income/${id}`);
    if (result.ok) {
        return { success: true, data: result.data.data, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

export async function getIncomesByMonth(year, month) {
    const result = await request(`/income/${year}/${month}`);
    if (result.ok) {
        return { success: true, data: result.data.data, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

export async function updateIncome(id, incomeData) {
    const requiredFields = ['user', 'description', 'amount', 'date'];
    for (const field of requiredFields) {
        if (!incomeData[field]) {
            return {
                success: false,
                error: `Campo '${field}' é obrigatório para atualizar uma receita.`,
                validationError: true
            };
        }
    }
    
    const result = await request(`/income/${id}`, {
        method: 'PUT',
        body: JSON.stringify(incomeData)
    });
    
    if (result.ok) {
        return { success: true, data: result.data.data, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

export async function deleteIncome(id) {
    const result = await request(`/income/${id}`, { method: 'DELETE' });
    if (result.ok) {
        return { success: true, message: result.data.message, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

// ========== EXPENSES ==========

export async function getAllExpenses() {
    const result = await request('/expenses');
    if (result.ok) {
        return { success: true, data: result.data.data, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

export async function addExpense(expenseData) {
    const requiredFields = ['user', 'description', 'amount', 'date'];
    for (const field of requiredFields) {
        if (!expenseData[field]) {
            return {
                success: false,
                error: `Campo '${field}' é obrigatório para criar uma despesa.`,
                validationError: true
            };
        }
    }
    
    let endpoint = '/expenses';
    if (expenseData.category) {
        endpoint += `?category=${encodeURIComponent(expenseData.category)}`;
    }
    
    const result = await request(endpoint, {
        method: 'POST',
        body: JSON.stringify(expenseData)
    });
    
    if (result.ok) {
        return { success: true, data: result.data.data, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

export async function getExpenseById(id) {
    const result = await request(`/expenses/${id}`);
    if (result.ok) {
        return { success: true, data: result.data.data, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

export async function getExpensesByMonth(year, month) {
    const result = await request(`/expenses/${year}/${month}`);
    if (result.ok) {
        return { success: true, data: result.data.data, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

export async function updateExpense(id, expenseData) {
    const requiredFields = ['user', 'description', 'amount', 'date'];
    for (const field of requiredFields) {
        if (!expenseData[field]) {
            return {
                success: false,
                error: `Campo '${field}' é obrigatório para atualizar uma despesa.`,
                validationError: true
            };
        }
    }
    
    let endpoint = `/expenses/${id}`;
    if (expenseData.category) {
        endpoint += `?category=${encodeURIComponent(expenseData.category)}`;
    }
    
    const result = await request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(expenseData)
    });
    
    if (result.ok) {
        return { success: true, data: result.data.data, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

export async function deleteExpense(id) {
    const result = await request(`/expenses/${id}`, { method: 'DELETE' });
    if (result.ok) {
        return { success: true, message: result.data.message, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

// ========== STATEMENT ==========

export async function getMonthlyStatement(year, month, userEmail) {
    const userName = userEmail.split('@')[0];
    const result = await request(`/statement/${year}/${month}?user=${userName}`);
    if (result.ok) {
        return { success: true, data: result.data.data, fullResponse: result };
    }
    return { success: false, error: result.error, status: result.status, fullResponse: result };
}

// ========== FUNÇÕES FILTRADAS POR USUÁRIO (ORIGINAIS - MANTIDAS) ==========

export async function getUserIncomes(userEmail) {
    const userName = userEmail.split('@')[0];
    const result = await getAllIncomes();
    if (!result.success) {
        return { success: false, error: result.error, data: [] };
    }
    const filteredData = result.data.filter(item => item.user === userName);
    return { success: true, data: filteredData, fullResponse: result };
}

export async function getUserExpenses(userEmail) {
    const userName = userEmail.split('@')[0];
    const result = await getAllExpenses();
    if (!result.success) {
        return { success: false, error: result.error, data: [] };
    }
    const filteredData = result.data.filter(item => item.user === userName);
    return { success: true, data: filteredData, fullResponse: result };
}

export async function addUserIncome(userEmail, incomeData) {
    const userName = userEmail.split('@')[0];
    const incomeWithUser = { ...incomeData, user: userName };
    return await addIncome(incomeWithUser);
}

export async function addUserExpense(userEmail, expenseData) {
    const userName = userEmail.split('@')[0];
    const expenseWithUser = { ...expenseData, user: userName };
    return await addExpense(expenseWithUser);
}

export async function getUserStatement(userEmail, year, month) {
    const incomesResult = await getUserIncomes(userEmail);
    const expensesResult = await getUserExpenses(userEmail);
    
    if (!incomesResult.success || !expensesResult.success) {
        return { 
            success: false, 
            error: 'Failed to fetch user data',
            data: {
                totalIncome: 0,
                totalExpenses: 0,
                monthBalance: 0,
                categoryExpenses: []
            }
        };
    }
    
    const monthIncomes = incomesResult.data.filter(item => {
        const date = new Date(item.date);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
    
    const monthExpenses = expensesResult.data.filter(item => {
        const date = new Date(item.date);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
    
    const totalIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const categoryMap = {};
    const categories = ['Alimentação', 'Saúde', 'Moradia', 'Transporte', 'Educação', 'Lazer', 'Imprevistos', 'Outras'];
    categories.forEach(cat => { categoryMap[cat] = 0; });
    
    monthExpenses.forEach(exp => {
        const cat = exp.category || 'Outras';
        if (categoryMap[cat] !== undefined) {
            categoryMap[cat] += exp.amount;
        } else {
            categoryMap['Outras'] += exp.amount;
        }
    });
    
    const categoryExpenses = categories.map(cat => ({
        category: cat,
        total: categoryMap[cat] || 0
    }));
    
    return {
        success: true,
        data: {
            totalIncome,
            totalExpenses,
            monthBalance: totalIncome - totalExpenses,
            categoryExpenses
        }
    };
}