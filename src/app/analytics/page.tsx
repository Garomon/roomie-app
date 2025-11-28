import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold font-heading text-white mb-2">
                    📊 Analytics
                </h1>
                <p className="text-gray-400">
                    Visualiza las tendencias de gastos de los últimos 6 meses
                </p>
            </div>

            <AnalyticsDashboard />
        </div>
    );
}
