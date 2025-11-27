import ChoresTracker from "@/components/ChoresTracker";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ChoresPage() {
    return (
        <main className="min-h-screen p-4 md:p-8 pb-20">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-gradient">Tareas y Reglas</h1>
                </div>

                <ChoresTracker />
            </div>
        </main>
    );
}
