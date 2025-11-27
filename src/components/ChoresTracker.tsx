"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Trash2, Utensils, Calendar, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ChoresTracker() {
  const [chores, setChores] = useState<any[]>([]);
  const [newChore, setNewChore] = useState("");

  useEffect(() => {
    fetchChores();
  }, []);

  const fetchChores = async () => {
    const { data } = await supabase.from('chores').select('*').order('created_at', { ascending: false });
    if (data) setChores(data);
  };

  const addChore = async () => {
    if (!newChore.trim()) return;

    const { error } = await supabase.from('chores').insert([
      { title: newChore, assigned_to: 'all', is_completed: false }
    ]);

    if (!error) {
      setNewChore("");
      fetchChores();
    }
  };

  const toggleChore = async (id: string, currentStatus: boolean) => {
    await supabase.from('chores').update({ is_completed: !currentStatus }).eq('id', id);
    fetchChores();
  };

  return (
    <div className="space-y-8">
      {/* Cleaning Schedule */}
      <section className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-cyan-400" />
          Calendario de Limpieza
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="font-bold text-lg mb-2 text-cyan-300">Limpieza Pro (Externa)</h3>
            <p className="text-sm text-gray-400 mb-4">Servicio contratado con Caja Común.</p>
            <div className="flex items-center justify-between bg-black/20 p-3 rounded">
              <span>Próxima Visita:</span>
              <span className="font-mono font-bold text-white">Vie 28 Nov</span>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="font-bold text-lg mb-2 text-cyan-300">Descarte de Refri</h3>
            <p className="text-sm text-gray-400 mb-4">Limpieza obligatoria de alimentos caducados.</p>
            <div className="flex items-center justify-between bg-black/20 p-3 rounded">
              <span>Responsable esta semana:</span>
              <span className="font-bold text-white">Todos (Domingo)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Chores List */}
      <section className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Tareas Adicionales</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newChore}
            onChange={(e) => setNewChore(e.target.value)}
            placeholder="Agregar nueva tarea..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
          />
          <button onClick={addChore} className="bg-cyan-600 p-2 rounded-lg text-white">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {chores.map(chore => (
            <div key={chore.id} className="flex items-center justify-between bg-white/5 p-3 rounded hover:bg-white/10 transition-colors">
              <span className={chore.is_completed ? "line-through text-gray-500" : "text-white"}>
                {chore.title}
              </span>
              <button
                onClick={() => toggleChore(chore.id, chore.is_completed)}
                className={`p-1 rounded ${chore.is_completed ? "text-green-400" : "text-gray-400"}`}
              >
                <CheckSquare className="w-5 h-5" />
              </button>
            </div>
          ))}
          {chores.length === 0 && <p className="text-gray-500 text-sm italic">No hay tareas pendientes.</p>}
        </div>
      </section>

      {/* Kitchen Rules */}
      <section className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Utensils className="w-6 h-6 mr-2 text-purple-400" />
          Reglas de Cocina
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="p-2 bg-purple-500/20 rounded-full text-purple-400 mt-1">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-purple-300">Etiquetado</h3>
              <p className="text-sm text-gray-400">
                Todo lo que entra al refri debe tener nombre si es personal.
                Si no tiene nombre, es dominio público (Community Chest).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
