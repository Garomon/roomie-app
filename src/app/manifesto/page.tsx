import ManifestoViewer from "@/components/ManifestoViewer";
import SignaturePad from "@/components/SignaturePad";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ManifestoPage() {
    return (
        <main className="min-h-screen p-4 md:p-8 pb-20">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-gradient">El Manifiesto</h1>
                </div>

                <div className="grid gap-8">
                    <ManifestoViewer />

                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-6">Firma de Acuerdo</h2>
                        <SignaturePad />
                    </div>
                </div>
            </div>
        </main>
    );
}
