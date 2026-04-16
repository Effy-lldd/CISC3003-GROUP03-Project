export const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other Income'],
    expense: ['Rent', 'Groceries', 'Utilities', 'Entertainment', 'Transport', 'Healthcare', 'Shopping', 'Other']
};


// Mapeamento de categorias do frontend (inglês) para a API (português)
export const categoryMappingToAPI = {
    // Expense categories (inglês -> português)
    'Rent': 'Moradia',
    'Groceries': 'Alimentação',
    'Utilities': 'Moradia',
    'Entertainment': 'Lazer',
    'Transport': 'Transporte',
    'Healthcare': 'Saúde',
    'Shopping': 'Outras',
    'Other': 'Outras',
    
    // Income categories (inglês -> português)
    'Salary': 'Salário',
    'Freelance': 'Freelance',
    'Investment': 'Investimento',
    'Business': 'Negócios',
    'Other Income': 'Outras Receitas'
};

// Mapeamento reverso (português -> inglês) para exibição
export const categoryMappingToFrontend = {
    // Expense categories
    'Moradia': 'Rent',
    'Alimentação': 'Groceries',
    'Lazer': 'Entertainment',
    'Transporte': 'Transport',
    'Saúde': 'Healthcare',
    'Outras': 'Other',
    
    // Income categories
    'Salário': 'Salary',
    'Freelance': 'Freelance',
    'Investimento': 'Investment',
    'Negócios': 'Business',
    'Outras Receitas': 'Other Income'
};

// Função para converter categoria do frontend para API
export function mapCategoryToAPI(category, type) {
    if (type === 'expense') {
        const mapping = {
            'Rent': 'Moradia',
            'Groceries': 'Alimentação',
            'Utilities': 'Moradia',
            'Entertainment': 'Lazer',
            'Transport': 'Transporte',
            'Healthcare': 'Saúde',
            'Shopping': 'Outras',
            'Other': 'Outras'
        };
        return mapping[category] || 'Outras';
    } else {
        const mapping = {
            'Salary': 'Salário',
            'Freelance': 'Freelance',
            'Investment': 'Investimento',
            'Business': 'Negócios',
            'Other Income': 'Outras Receitas'
        };
        return mapping[category] || 'Outras Receitas';
    }
}

// Função para converter categoria da API para frontend
export function mapCategoryToFrontend(apiCategory, type) {
    if (type === 'expense') {
        const mapping = {
            'Moradia': 'Rent',
            'Alimentação': 'Groceries',
            'Lazer': 'Entertainment',
            'Transporte': 'Transport',
            'Saúde': 'Healthcare',
            'Outras': 'Other'
        };
        return mapping[apiCategory] || 'Other';
    } else {
        const mapping = {
            'Salário': 'Salary',
            'Freelance': 'Freelance',
            'Investimento': 'Investment',
            'Negócios': 'Business',
            'Outras Receitas': 'Other Income'
        };
        return mapping[apiCategory] || 'Other Income';
    }
}