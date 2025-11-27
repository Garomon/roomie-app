import { Roomie, RentInfo } from "@/types";

export const ROOMIES: Roomie[] = [
    {
        id: "alejandro",
        name: "Alejandro",
        rent: 7000,
        hasCloset: false,
        color: "from-blue-500 to-cyan-500",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alejandro"
    },
    {
        id: "edgardo",
        name: "Edgardo",
        rent: 14500,
        hasCloset: true,
        color: "from-purple-500 to-pink-500",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Edgardo"
    },
    {
        id: "james",
        name: "James",
        rent: 10500,
        hasCloset: true,
        color: "from-orange-500 to-red-500",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James"
    }
];

// Rotation: Alejandro -> Edgardo -> James
// Base Date: November 2025 (Month 0 of the cycle)
const BOSS_ROTATION = ["alejandro", "edgardo", "james"];
const START_DATE = new Date(2025, 10, 1); // November 1, 2025 (Month is 0-indexed, so 10 is Nov)

export function getBossOfTheMonth(): Roomie {
    const today = new Date();

    // Calculate months passed since start date
    const yearsDiff = today.getFullYear() - START_DATE.getFullYear();
    const monthsDiff = today.getMonth() - START_DATE.getMonth();
    const totalMonthsPassed = (yearsDiff * 12) + monthsDiff;

    // Ensure positive index even if system time is before start date (for testing)
    const rotationIndex = Math.abs(totalMonthsPassed) % 3;

    const bossId = BOSS_ROTATION[rotationIndex];
    return ROOMIES.find(r => r.id === bossId) || ROOMIES[0];
}

export type UrgencyLevel = 'normal' | 'warning' | 'critical';

export interface RentStatus extends RentInfo {
    urgency: UrgencyLevel;
    statusMessage: string;
}

export function getDaysUntilRentDue(): RentStatus {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Rent is due on the 30th of the current month
    let dueDate = new Date(currentYear, currentMonth, 30);

    // Handle February (28/29 days)
    if (currentMonth === 1) {
        const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
        dueDate = new Date(currentYear, currentMonth, lastDay);
    }

    // If today is past the 30th, the due date was this month (overdue) or next month?
    // The manifesto says "Pago al Boss dia 30".
    // If it's the 31st, it's technically overdue for the current month, or we start counting for next?
    // Let's assume if we are past the 25th, we are looking at the current month's deadline.
    // If we are past the 30th (e.g. 31st), we are overdue.

    // Logic: 
    // If today <= 30: Due date is this month's 30.
    // If today > 30: Due date is NEXT month's 30.

    if (today.getDate() > 30) {
        dueDate = new Date(currentYear, currentMonth + 1, 30);
        // Handle Feb next year
        if (dueDate.getMonth() === 1) {
            const lastDay = new Date(dueDate.getFullYear(), 2, 0).getDate();
            dueDate.setDate(lastDay);
        }
    }

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let urgency: UrgencyLevel = 'normal';
    let statusMessage = 'Tiempo de sobra';

    if (diffDays <= 2) {
        urgency = 'critical';
        statusMessage = '¡Paga YA!';
    } else if (diffDays <= 5) {
        urgency = 'warning';
        statusMessage = 'Se acerca la fecha';
    }

    return {
        daysLeft: diffDays,
        dueDate: dueDate,
        urgency,
        statusMessage
    };
}
