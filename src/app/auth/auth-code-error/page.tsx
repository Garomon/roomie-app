import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AuthCodeError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-red-500/10 p-4 rounded-full mb-6">
                <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Error de Autenticación</h1>
            <p className="text-gray-400 max-w-md mb-8">
                Hubo un problema al iniciar sesión con Google. Esto suele pasar si la configuración en Supabase no coincide con la URL actual.
            </p>
            <div className="flex gap-4">
                <Link href="/">
                    <Button variant="outline">Volver al Inicio</Button>
                </Link>
            </div>

            <div className="mt-12 p-4 border border-white/10 rounded-lg bg-white/5 max-w-lg text-left">
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Posibles causas:</h3>
                <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                    <li>No has agregado <code>http://localhost:3000/auth/callback</code> a los <strong>Redirect URIs</strong> en Supabase.</li>
                    <li>El servicio de autenticación de Google canceló la solicitud.</li>
                    <li>La conexión expiró.</li>
                </ul>
            </div>
        </div>
    );
}
