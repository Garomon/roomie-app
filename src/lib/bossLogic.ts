export const ROOMIES = [
    {
        id: "alejandro",
        name: "Alejandro Dorantes",
        rent: 7000,
        hasCloset: false,
        color: "from-blue-500 to-cyan-500",
        avatar: "/avatars/alejandro.jpg" // Placeholder
    },
    {
        id: "edgardo",
        name: "Edgardo Montoya",
        rent: 14500,
        hasCloset: true,
        color: "from-purple-500 to-pink-500",
        avatar: "/avatars/edgardo.jpg"
    },
    {
        id: "james",
        name: "James Kennedy",
        rent: 10500,
        hasCloset: true,
        color: "from-amber-500 to-orange-500",
        avatar: "/avatars/james.jpg"
    }
];

// Month 1: Dec 2025 -> Alejandro (Index 0)
// Base date: December 1, 2025
const BASE_DATE = new Date("2025-12-01T00:00:00");

export function getBossOfTheMonth(currentDate: Date = new Date()) {
    // Calculate months difference from base date
    const yearDiff = currentDate.getFullYear() - BASE_DATE.getFullYear();
    const monthDiff = currentDate.getMonth() - BASE_DATE.getMonth();

    let totalMonths = yearDiff * 12 + monthDiff;

    // Handle negative if before start (shouldn't happen in prod but good for safety)
    if (totalMonths < 0) totalMonths = 0;

    // Rotation: 0->Alejandro, 1->Edgardo, 2->James
    const bossIndex = totalMonths % 3;

    return ROOMIES[bossIndex];
}

export function getDaysUntilRentDue(currentDate: Date = new Date()) {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Rent is due on the 30th of the CURRENT month for the NEXT month?
    // Prompt: "El pago de la renta individual al 'Boss' (Día 30) es final"
    // "El Boss... debe asegurar que el pago total llegue al Arrendador el Día 1 de cada mes"
    // So roomies pay on 30th.

    // Let's find the next 30th.
    let nextDue = new Date(currentYear, currentMonth, 30);

    // If today is past the 30th, next due is next month's 30th
    if (currentDate.getDate() > 30) {
        nextDue = new Date(currentYear, currentMonth + 1, 30);
    }

    // Handle February (no 30th) - usually rent is due end of month or 28th/29th
    // Simple logic: if month has < 30 days, use last day of month.
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    if (daysInMonth < 30) {
        nextDue = new Date(currentYear, currentMonth, daysInMonth);
    }

    const diffTime = Math.abs(nextDue.getTime() - currentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
        daysLeft: diffDays,
        dueDate: nextDue
    };
}
