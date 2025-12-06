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
    type: 'rent' | 'pool' | 'landlord';
    month_date: string;
    created_at: string;
    receipt_url?: string;
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
    receipt_url?: string;
}

export interface ExpenseSplit {
    id: number;
    expense_id: number;
    owed_by: string;
    amount: number;
    is_paid: boolean;
}

// Roomie Status Types (v5.0)
export type StatusType = 'available' | 'busy' | 'dnd' | 'lady_alert';

export interface RoomieStatus {
    id: string;
    roomie_id: string;
    status: StatusType;
    message?: string;
    updated_at: string;
}

export interface StatusOption {
    id: StatusType;
    label: string;
    emoji: string;
    color: string;
    description: string;
}

