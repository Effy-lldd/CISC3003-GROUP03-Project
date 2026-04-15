// ======================== TRANSACTIONS PAGE ========================
document.addEventListener('DOMContentLoaded', function () {
    loadTransactions();
    initializeTransactionForm();
    initializeFilters();
    updateTransactionsTable();
});

function initializeTransactionForm() {
    const addBtn = document.getElementById('add-transaction-btn');
    const cancelBtn = document.getElementById('cancel-form-btn');
    const form = document.getElementById('add-transaction-form');
    const formContainer = document.getElementById('transaction-form');
    const typeSelect = document.getElementById('transaction-type');
    const dateInput = document.getElementById('transaction-date');

    dateInput.value = new Date().toISOString().split('T')[0];

    typeSelect.addEventListener('change', updateCategoryOptions);
    updateCategoryOptions();

    addBtn.addEventListener('click', function () {
        formContainer.style.display = 'block';
    });

    cancelBtn.addEventListener('click', function () {
        formContainer.style.display = 'none';
        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        updateCategoryOptions();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const transaction = {
            type: document.getElementById('transaction-type').value,
            amount: parseFloat(document.getElementById('transaction-amount').value),
            category: document.getElementById('transaction-category').value,
            date: document.getElementById('transaction-date').value,
            method: document.getElementById('transaction-method').value,
            description: document.getElementById('transaction-description').value
        };

        addTransaction(transaction);
        updateTransactionsTable();
        updateFilterCategories();

        formContainer.style.display = 'none';
        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        updateCategoryOptions();
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
                <td class="text-center"><button class="delete-btn" onclick="handleDelete('${t.id}')">${getDeleteIcon()}</button></td>
            </tr>
        `).join('');
    }

    document.getElementById('transactions-count').textContent = `Showing ${filtered.length} of ${transactions.length} transactions`;
}

window.handleDelete = function (id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        deleteTransaction(id);
        updateTransactionsTable();
        updateFilterCategories();
    }
};
