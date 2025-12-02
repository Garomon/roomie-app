import { Roomie, RentInfo } from "@/types";

export const ROOMIES: Roomie[] = [
    {
        id: "alejandro",
        name: "Dora",
        rent: 7000,
        hasCloset: false,
        color: "from-blue-500 to-cyan-500",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alejandro",
        email: "alejandro@example.com"
    },
    {
        id: "edgardo",
        name: "Garo",
        rent: 14500,
        hasCloset: true,
        color: "from-purple-500 to-pink-500",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Edgardo",
        email: "edgardo@example.com"
    },
    {
        id: "james",
        name: "James",
        rent: 10500,
        hasCloset: true,
        color: "from-orange-500 to-red-500",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
        email: "james@example.com"
    }
];

// Rotation: Alejandro -> Edgardo -> James
// Base Date: November 2025 (Month 0 of the cycle)
const BOSS_ROTATION = ["alejandro", "edgardo", "james"];
const START_DATE = new Date(2025, 10, 1); // November 1, 2025 (Month is 0-indexed, so 10 is Nov)

export interface BossConfig {
    mode: 'fixed' | 'rotation';
    fixedBossId: string;
}

export const DEFAULT_BOSS_CONFIG: BossConfig = {
    mode: 'fixed',
    fixedBossId: 'alejandro'
};

export function calculateBoss(config: BossConfig = DEFAULT_BOSS_CONFIG): Roomie {
    // 1. Check for Fixed Mode
    if (config.mode === 'fixed') {
        return ROOMIES.find(r => r.id === config.fixedBossId) || ROOMIES[0];
    }

    // 2. Rotation Mode
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

/**
 * @deprecated Use useBoss hook instead for dynamic updates
 */
export function getBossOfTheMonth(): Roomie {
    return calculateBoss(DEFAULT_BOSS_CONFIG);
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

/**
 * Calculates the reliability score (0-100) based on performance.
 * Formula: 100 - (Overdue Chores * 5)
 * Future: Add late payments penalty
 */
export function calculateReliabilityScore(overdueChores: number): number {
    const score = 100 - (overdueChores * 5);
    return Math.max(0, Math.min(100, score));
}
