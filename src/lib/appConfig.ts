export const APP_CONFIG = {
    launchDate: "25 de Noviembre de 2025",
    appVersion: "v4.0",
    roomies: [
        {
            id: "edgardo",
            name: "Edgardo Montoya",
            fullName: "Edgardo Montoya De Tellitu",
            room: "Habitación con Baño y Estudio (PA)",
            rent: 14500,
            role: "admin"
        },
        {
            id: "james",
            name: "James Kennedy",
            fullName: "James Thomas Kennedy",
            room: "Habitación con Clóset (PB)",
            rent: 10500,
            role: "member"
        },
        {
            id: "alejandro",
            name: "Alejandro Dorantes",
            fullName: "Alejandro Dorantes Andrade",
            room: "Habitación sin Clóset (PB)",
            rent: 7000,
            role: "member"
        }
    ],
    finance: {
        totalRent: 32000,
        commonFund: 500,
        paymentDeadlineDay: 30,
        landlordPaymentDay: 1
    },
    bossRotation: [
        { month: 1, roomieId: "alejandro" },
        { month: 2, roomieId: "edgardo" },
        { month: 3, roomieId: "james" },
        { month: 4, roomieId: "alejandro" },
        { month: 5, roomieId: "edgardo" },
        { month: 6, roomieId: "james" },
        { month: 7, roomieId: "alejandro" },
        { month: 8, roomieId: "edgardo" },
        { month: 9, roomieId: "james" },
        { month: 10, roomieId: "alejandro" },
        { month: 11, roomieId: "edgardo" },
        { month: 12, roomieId: "james" }
    ]
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    }).format(amount);
};
