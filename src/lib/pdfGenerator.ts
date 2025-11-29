import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Roomie, Payment } from '@/types';

export const generateMonthlyReport = (
    roomies: Roomie[],
    payments: Payment[],
    services: { name: string; amount: number }[],
    monthName: string
) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text(`Reporte Mensual - ${monthName}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Vibra Alta: El Manifiesto Anzures', 14, 30);

    // 1. Rent Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. Renta ($32,000 MXN)', 14, 45);

    const rentData = roomies.map(r => {
        const paid = payments.some(p => p.roomie_id === r.id && p.type === 'rent');
        return [
            r.name,
            `$${r.rent.toLocaleString()}`,
            paid ? 'PAGADO' : 'PENDIENTE'
        ];
    });

    autoTable(doc, {
        startY: 50,
        head: [['Roomie', 'Monto', 'Estado']],
        body: rentData,
        theme: 'grid',
        headStyles: { fillColor: [6, 182, 212] } // Cyan
    });

    // 2. Common Box
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('2. Caja Común ($500 MXN)', 14, finalY);

    const poolData = roomies.map(r => {
        const paid = payments.some(p => p.roomie_id === r.id && p.type === 'pool');
        return [
            r.name,
            `$500.00`,
            paid ? 'PAGADO' : 'PENDIENTE'
        ];
    });

    autoTable(doc, {
        startY: finalY + 5,
        head: [['Roomie', 'Monto', 'Estado']],
        body: poolData,
        theme: 'grid',
        headStyles: { fillColor: [168, 85, 247] } // Purple
    });

    // 3. Services
    finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('3. Servicios Fijos', 14, finalY);

    const servicesData = services.map(s => [s.name, `$${s.amount.toLocaleString()}`]);
    const totalServices = services.reduce((acc, s) => acc + s.amount, 0);
    const perPerson = totalServices / 3;

    servicesData.push(['TOTAL', `$${totalServices.toLocaleString()}`]);
    servicesData.push(['Por Persona (1/3)', `$${perPerson.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]);

    autoTable(doc, {
        startY: finalY + 5,
        head: [['Servicio', 'Monto']],
        body: servicesData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] } // Emerald
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Generado por Roomie App V6.2', 14, pageHeight - 10);

    doc.save(`Reporte_Mensual_${monthName.replace(' ', '_')}.pdf`);
};
