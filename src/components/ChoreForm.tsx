"use client";

import { useState } from "react";
import { ROOMIES } from "@/lib/bossLogic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface ChoreFormProps {
    onSubmit: (chore: {
        task: string;
        assigned_to: string;
        due_date?: string;
        priority: 'low' | 'medium' | 'high';
        recurring: 'none' | 'daily' | 'weekly' | 'monthly';
    }) => void;
}

export default function ChoreForm({ onSubmit }: ChoreFormProps) {
    const { roomie } = useAuth();
    const [task, setTask] = useState("");
    const [assignedTo, setAssignedTo] = useState(roomie?.id || "");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

    const handleSubmit = () => {
        if (!task.trim() || !assignedTo) return;

        onSubmit({
            task: task.trim(),
            assigned_to: assignedTo,
            due_date: dueDate || undefined,
            priority,
            recurring
        });

        // Send Push Notification
        fetch("/api/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                roomieId: assignedTo,
                title: "Nueva Tarea Asignada 🧹",
                message: `Te toca: ${task.trim()}`,
                url: "/chores"
            })
        }).catch(err => console.error("Error sending push:", err));

        // Reset form
        setTask("");
        setDueDate("");
        setPriority('medium');
        setRecurring('none');
    };

    return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task Input */}
                <div className="md:col-span-2">
                    <label className="text-sm text-gray-300">Tarea</label>
                    <Input
                        placeholder="¿Qué hay que hacer?"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        className="mt-1"
                    />
                </div>

                {/* Assigned To */}
                <div>
                    <label className="text-sm text-gray-300">Asignado a</label>
                    <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="mt-1 w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="">Selecciona...</option>
                        {ROOMIES.map((r) => (
                            <option key={r.id} value={r.id} className="bg-gray-900">
                                {r.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Due Date */}
                <div>
                    <label className="text-sm text-gray-300">Fecha límite</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>

                {/* Priority */}
                <div>
                    <label className="text-sm text-gray-300">Prioridad</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="mt-1 w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="low" className="bg-gray-900">🟢 Baja</option>
                        <option value="medium" className="bg-gray-900">🟡 Media</option>
                        <option value="high" className="bg-gray-900">🔴 Alta</option>
                    </select>
                </div>

                {/* Recurring */}
                <div>
                    <label className="text-sm text-gray-300">Recurrente</label>
                    <select
                        value={recurring}
                        onChange={(e) => setRecurring(e.target.value as any)}
                        className="mt-1 w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="none" className="bg-gray-900">No se repite</option>
                        <option value="daily" className="bg-gray-900">Diaria</option>
                        <option value="weekly" className="bg-gray-900">Semanal</option>
                        <option value="monthly" className="bg-gray-900">Mensual</option>
                    </select>
                </div>
            </div>

            <Button
                onClick={handleSubmit}
                disabled={!task.trim() || !assignedTo}
                className="w-full bg-cyan-600 hover:bg-cyan-500"
            >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Tarea
            </Button>
        </div>
    );
}
