"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Eraser, Save, PenTool } from "lucide-react";

export default function SignaturePad() {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const clear = () => {
        sigCanvas.current?.clear();
    };

    const save = async () => {
        if (!name.trim()) {
            toast.error("Por favor escribe tu nombre");
            return;
        }
        if (sigCanvas.current?.isEmpty()) {
            toast.error("Por favor firma el documento");
            return;
        }

        setLoading(true);
        const signatureData = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");

        try {
            const { error } = await supabase
                .from('signatures')
                .insert([{ name, signature_data: signatureData }]);

            if (error) throw error;

            toast.success("¡Firma guardada con éxito!", {
                description: "Has aceptado el Manifiesto Anzures."
            });
            clear();
            setName("");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar la firma");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto bg-white/5 border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-cyan-400" />
                    Firma Digital
                </CardTitle>
                <CardDescription>
                    Al firmar, aceptas las reglas de convivencia y la autoridad del Boss del Mes.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <input
                    type="text"
                    placeholder="Tu Nombre Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />

                <div className="border border-white/20 rounded-xl overflow-hidden bg-white">
                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{
                            className: "w-full h-40 cursor-crosshair"
                        }}
                    />
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={clear}
                        className="flex-1 border-white/10 hover:bg-white/5 text-gray-400"
                    >
                        <Eraser className="w-4 h-4 mr-2" />
                        Borrar
                    </Button>
                    <Button
                        onClick={save}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white border-0"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Guardando..." : "Firmar Manifiesto"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
