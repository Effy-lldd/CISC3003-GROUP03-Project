// ======================== TRANSACTIONS PAGE ========================
import { auth } from '../firebase/auth.js';
import { 
    getUserIncomesFromCache, 
    getUserExpensesFromCache,
    addIncomeAndUpdateCache,
    addExpenseAndUpdateCache,
    deleteIncomeAndUpdateCache,
    deleteExpenseAndUpdateCache,
    loadInitialCache
} from '../api/mymoney.js';
import { formatCurrency, formatDate, getTransactionIcon, getDeleteIcon } from '../modules/helpers.js';
import { categories, mapCategoryToAPI, mapCategoryToFrontend } from '../modules/transactions.js';


let transactions = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            console.log('User logged in:', currentUser.email);
            
            // Garantir que cache está carregado
            await loadInitialCache(currentUser.email);
            
            // Carregar transações do cache
            await loadTransactionsFromCache();
            initializeTransactionForm();
            initializeFilters();
            updateTransactionsTable();
        } else {
            window.location.href = 'login.html';
        }
    });
});

// MODIFICADA: Carrega transações DO CACHE (não da API)
async function loadTransactionsFromCache() {
    const userEmail = currentUser.email;
    const userName = userEmail.split('@')[0];
    console.log('Loading transactions from cache for user:', userName);
    
    try {
        const incomesResult = await getUserIncomesFromCache(userEmail);
        const expensesResult = await getUserExpensesFromCache(userEmail);
        
        const incomes = (incomesResult.success && incomesResult.data ? incomesResult.data : []).map(inc => ({
            id: inc._id,
            type: 'income',
            amount: inc.amount,
            category: inc.category || 'Salary',
            description: inc.description,
            date: inc.date.split('T')[0],
            method: 'API'
        }));
        
        const expenses = (expensesResult.success && expensesResult.data ? expensesResult.data : []).map(exp => ({
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
        
        console.log(`Loaded ${transactions.length} transactions from cache for user ${userName}`);
        
    } catch (error) {
        console.error('Error loading transactions from cache:', error);
        transactions = [];
    }
}

// MODIFICADA: Usa função com cache automático
async function addTransactionToAPI(transaction) {
    const userEmail = currentUser.email;
    const userName = userEmail.split('@')[0];
    console.log('Adding transaction for user:', userName);
    console.log('Transaction data:', transaction);
    
    let result;
    
    if (transaction.type === 'income') {
        result = await addIncomeAndUpdateCache({
            user: userName,
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date
        });
    } else {
        const categoryInPortuguese = mapCategoryToAPI(transaction.category, 'expense');
        result = await addExpenseAndUpdateCache({
            user: userName,
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date,
            category: categoryInPortuguese
        });
    }
    
    console.log('API result:', result);
    
    if (result.success) {
        console.log('Transaction added, cache already updated');
        // Recarregar do cache (já atualizado)
        await loadTransactionsFromCache();
        return true;
    } else {
        console.error('Failed to add transaction:', result.error);
        alert('Error adding transaction: ' + result.error);
        return false;
    }
}

function initializeTransactionForm() {
    const addBtn = document.getElementById('add-transaction-btn');
    const cancelBtn = document.getElementById('cancel-form-btn');
    const form = document.getElementById('add-transaction-form');
    const formContainer = document.getElementById('transaction-form');
    const typeSelect = document.getElementById('transaction-type');
    const dateInput = document.getElementById('transaction-date');

    if (!addBtn) {
        console.error('Add button not found!');
        return;
    }

    dateInput.value = new Date().toISOString().split('T')[0];

    typeSelect.addEventListener('change', updateCategoryOptions);
    updateCategoryOptions();

    addBtn.addEventListener('click', function () {
        console.log('Add button clicked');
        formContainer.style.display = 'block';
    });

    cancelBtn.addEventListener('click', function () {
        console.log('Cancel button clicked');
        formContainer.style.display = 'none';
        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        updateCategoryOptions();
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        console.log('Form submitted');

        const transaction = {
            type: document.getElementById('transaction-type').value,
            amount: parseFloat(document.getElementById('transaction-amount').value),
            category: document.getElementById('transaction-category').value,
            date: document.getElementById('transaction-date').value,
            method: document.getElementById('transaction-method').value,
            description: document.getElementById('transaction-description').value
        };

        console.log('Transaction to add:', transaction);

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        const success = await addTransactionToAPI(transaction);
        
        if (success) {
            console.log('Updating UI after successful add');
            updateTransactionsTable();
            updateFilterCategories();
            formContainer.style.display = 'none';
            form.reset();
            dateInput.value = new Date().toISOString().split('T')[0];
            updateCategoryOptions();
        }
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

function updateCategoryOptions() {
    const type = document.getElementById('transaction-type').value;
    const categorySelect = document.getElementById('transaction-category');

    categorySelect.innerHTML = '<option value="">Select category</option>';
    categories[type].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

function initializeFilters() {
    document.getElementById('search-input').addEventListener('input', updateTransactionsTable);
    document.getElementById('filter-type').addEventListener('change', updateTransactionsTable);
    document.getElementById('filter-category').addEventListener('change', updateTransactionsTable);
    updateFilterCategories();
}

function updateFilterCategories() {
    const filterCategory = document.getElementById('filter-category');
    const allCategories = [];
    transactions.forEach(t => {
        if (allCategories.indexOf(t.category) === -1) {
            allCategories.push(t.category);
        }
    });

    filterCategory.innerHTML = '<option value="all">All Categories</option>';
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filterCategory.appendChild(option);
    });
}

function updateTransactionsTable() {
    console.log('Updating transactions table, total transactions:', transactions.length);
    
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filterType = document.getElementById('filter-type').value;
    const filterCategory = document.getElementById('filter-category').value;

    const filtered = transactions.filter(t => {
        const matchesSearch = searchTerm === '' ||
            t.description.toLowerCase().indexOf(searchTerm) !== -1 ||
            t.category.toLowerCase().indexOf(searchTerm) !== -1;
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
        return matchesSearch && matchesType && matchesCategory;
    });

    console.log('Filtered transactions:', filtered.length);

    const tbody = document.getElementById('transactions-table-body');

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:48px 24px; color:#9ca3af;">No transactions found</td></tr>';
    } else {
        tbody.innerHTML = filtered.map(t => `
            <tr>
                <td>${formatDate(t.date)}</td>
                <td><strong>${t.description}</strong></td>
                <td>${t.category}</td>
                <td style="color:#9ca3af;">${t.method || '-'}</td>
                <td><span class="type-badge ${t.type}">${getTransactionIcon(t.type)}${t.type}</span></td>
                <td class="text-right ${t.type === 'income' ? 'green' : 'red'}">
                    ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                </td>
                <td class="text-center"><button class="delete-btn" data-id="${t.id}" data-type="${t.type}">${getDeleteIcon()}</button></td>
            </tr>
        `).join('');
    }

    document.getElementById('transactions-count').textContent = `Showing ${filtered.length} of ${transactions.length} transactions`;
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            const type = this.getAttribute('data-type');
            
            if (confirm('Are you sure you want to delete this transaction?')) {
                await deleteTransactionFromAPI(id, type);
                updateTransactionsTable();
                updateFilterCategories();
            }
        });
    });
}

// MODIFICADA: Usa função com cache automático
async function deleteTransactionFromAPI(id, type) {
    let result;
    
    if (type === 'income') {
        result = await deleteIncomeAndUpdateCache(id);
    } else {
        result = await deleteExpenseAndUpdateCache(id);
    }
    
    if (result.success) {
        console.log('Transaction deleted, cache already updated');
        await loadTransactionsFromCache();
        return true;
    } else {
        console.error('Failed to delete:', result.error);
        alert('Error deleting: ' + result.error);
        return false;
    }
}