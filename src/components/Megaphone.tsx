"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone as MegaphoneIcon, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export default function Megaphone() {
    const { roomie } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    // Only allow access if user is logged in
    if (!roomie) return null;

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            toast.error("Completa todos los campos");
            return;
        }

        setLoading(true);
        try {
            // We use the current user's ID to find subscriptions, 
            // BUT for a broadcast we ideally want to send to ALL.
            // For now, let's assume the API handles broadcasting if we pass a special flag or 
            // we might need to update the API to support "broadcast".
            // 
            // WAIT: The current API /api/push/send sends to a specific roomieId.
            // We need to update the API to support broadcasting or loop through all roomies here.
            // Let's loop here for simplicity for now, or better, update the API.
            // Updating the API is safer. Let's send a "broadcast" flag.

            // Actually, let's just send to the API and let it handle it.
            // I'll update the API next.

            const res = await fetch("/api/push/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: roomie.id,
                    title,
                    message,
                    url: "/"
                })
            });

            if (!res.ok) throw new Error("Error al enviar");

            toast.success("¡Anuncio enviado a todos!");
            setOpen(false);
            setTitle("");
            setMessage("");
        } catch (error) {
            console.error(error);
            toast.error("Error al enviar anuncio");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                    title="Hacer Anuncio (Megáfono)"
                >
                    <MegaphoneIcon className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <MegaphoneIcon className="w-6 h-6 text-yellow-400" />
                        Megáfono del Depto
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Envía una notificación a todos los dispositivos conectados.
                        Úsalo con responsabilidad (o no 😈).
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Título</label>
                        <Input
                            placeholder="Ej: ¡Se fue el agua!"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-zinc-900 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Mensaje</label>
                        <Textarea
                            placeholder="Ej: No laven ropa hasta nuevo aviso..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-zinc-900 border-white/10 text-white min-h-[100px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-gray-400">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={loading}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                    >
                        {loading ? "Enviando..." : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Enviar a Todos
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
