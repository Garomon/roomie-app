export interface Roomie {
    id: string;
    name: string;
    rent: number;
    hasCloset: boolean;
    color: string;
    avatar: string;
    email?: string;
}

export interface Payment {
    id: number;
    roomie_id: string;
    amount: number;
    status: string;
    type: 'rent' | 'pool';
    month_date: string;
    created_at: string;
}

export interface Chore {
    id: number;
    task: string;
    completed: boolean;
    created_at: string;
    assigned_to?: string;
    due_date?: string;
    completed_at?: string;
    completed_by?: string;
    recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
    priority?: 'low' | 'medium' | 'high';
}

export interface RentInfo {
    daysLeft: number;
    dueDate: Date;
}

export interface Expense {
    id: number;
    created_at: string;
    description: string;
    amount: number;
    paid_by: string;
    date: string;
    category: 'food' | 'services' | 'fun' | 'other';
}

export interface ExpenseSplit {
    id: number;
    expense_id: number;
    owed_by: string;
    amount: number;
    is_paid: boolean;
}
