export interface Roomie {
    id: string;
    name: string;
    rent: number;
    hasCloset: boolean;
    color: string;
    avatar: string;
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
}

export interface RentInfo {
    daysLeft: number;
    dueDate: Date;
}
