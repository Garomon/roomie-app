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
const BOSS_ROTATION = ["alejandro", "edgardo", "james"];

export function getBossOfTheMonth(): Roomie {
    const today = new Date();
    const monthIndex = today.getMonth(); // 0-11
    // Simple rotation logic based on month index
    // Adjust offset as needed to match current reality
    const bossId = BOSS_ROTATION[monthIndex % 3];
    return ROOMIES.find(r => r.id === bossId) || ROOMIES[0];
}

export function getDaysUntilRentDue(): RentInfo {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Rent is due on the 30th of the current month
    // If today is past the 30th, it's due next month
    let dueDate = new Date(currentYear, currentMonth, 30);

    // Handle February (28/29 days)
    if (currentMonth === 1) {
        const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
        dueDate = new Date(currentYear, currentMonth, lastDay);
    }

    if (today > dueDate) {
        dueDate = new Date(currentYear, currentMonth + 1, 30);
        // Handle Feb next year if needed
        if (dueDate.getMonth() === 1) {
            const lastDay = new Date(dueDate.getFullYear(), 2, 0).getDate();
            dueDate.setDate(lastDay);
        }
    }

    const diffTime = Math.abs(dueDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
        daysLeft: diffDays,
        dueDate: dueDate
    };
}
