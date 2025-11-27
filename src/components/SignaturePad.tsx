"use client";

import { useRef, useState, useEffect } from "react";
import { Eraser, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SignaturePad() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#ffffff";

        // Handle resize
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCanvas.getContext('2d')?.drawImage(canvas, 0, 0);

                canvas.width = parent.clientWidth;
                canvas.height = 200;
                ctx.lineWidth = 2;
                ctx.lineCap = "round";
                ctx.strokeStyle = "#ffffff";
            }
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.beginPath();
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = (e as React.MouseEvent).clientX - rect.left;
            y = (e as React.MouseEvent).clientY - rect.top;
        }

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        setHasSignature(true);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const saveSignature = async () => {
        if (!hasSignature) return;
        setIsSaving(true);

        try {
            // Debug: Log environment variables
            console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
            console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

            const canvas = canvasRef.current;
            const signatureData = canvas?.toDataURL();

            const name = prompt("Ingresa tu nombre para firmar:");
            if (!name) {
                setIsSaving(false);
                return;
            }

            console.log('Attempting to save signature...');
            const { data, error } = await supabase
                .from('signatures')
                .insert([
                    { roomie_name: name, signature_data: signatureData }
                ]);

            console.log('Supabase response:', { data, error });

            if (error) throw error;

            alert("¡Firma guardada exitosamente en la nube!");
            clearCanvas();
        } catch (error) {
            console.error('Error saving signature:', error);
            console.error('Error type:', typeof error);
            console.error('Error keys:', Object.keys(error as any));
            console.error('Full error:', JSON.stringify(error, null, 2));

            const errorMessage = (error as any)?.message ||
                (error as any)?.error_description ||
                (error as any)?.msg ||
                'Error desconocido. Revisa la consola del navegador.';
            alert(`Error al guardar la firma: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4">Firma Digital</h3>
            <p className="text-sm text-gray-400 mb-4">
                Al firmar, aceptas los términos del Manifiesto Anzures.
            </p>

            <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900/50 mb-4 touch-none">
                <canvas
                    ref={canvasRef}
                    className="w-full h-[200px] cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={clearCanvas}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
                >
                    <Eraser className="w-4 h-4 mr-2" />
                    Borrar
                </button>
                <button
                    onClick={saveSignature}
                    disabled={!hasSignature || isSaving}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ml-auto ${hasSignature && !isSaving
                            ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Firmar Manifiesto
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
