export const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other Income'],
    expense: ['Rent', 'Groceries', 'Utilities', 'Entertainment', 'Transport', 'Healthcare', 'Shopping', 'Other']
};


export const categoryMappingToAPI = {
    'Rent': 'Moradia',
    'Groceries': 'Alimentação',
    'Utilities': 'Moradia',
    'Entertainment': 'Lazer',
    'Transport': 'Transporte',
    'Healthcare': 'Saúde',
    'Shopping': 'Outras',
    'Other': 'Outras',
    
    'Salary': 'Salário',
    'Freelance': 'Freelance',
    'Investment': 'Investimento',
    'Business': 'Negócios',
    'Other Income': 'Outras Receitas'
};

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