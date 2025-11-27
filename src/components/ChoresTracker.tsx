"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, CheckCircle2, Plus, AlertCircle, Utensils, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chore } from "@/types";

export default function ChoresTracker() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [newChore, setNewChore] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChores();
  }, []);

  const fetchChores = async () => {
    try {
      const { data, error } = await supabase.from('chores').select('*').order('created_at', { ascending: false });
      if (data) setChores(data as Chore[]);
    } catch (error) {
      console.error("Error fetching chores", error);
    } finally {
      setLoading(false);
    }
  };

  const addChore = async () => {
    if (!newChore.trim()) return;
    try {
      await supabase.from('chores').insert([{ task: newChore, completed: false }]);
      setNewChore("");
      fetchChores();
    } catch (error) {
      alert("Error al agregar tarea");
    }
  };

  const toggleChore = async (id: number, completed: boolean) => {
    try {
      await supabase.from('chores').update({ completed: !completed }).eq('id', id);
      fetchChores();
    } catch (error) {
      alert("Error al actualizar tarea");
    }
  };

  const deleteChore = async (id: number) => {
    try {
      await supabase.from('chores').delete().eq('id', id);
      fetchChores();
    } catch (error) {
      alert("Error al eliminar tarea");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white">Código de Orden</h2>
          <p className="text-gray-400">Si lo usas, lo levantas. Si lo ensucias, lo limpias.</p>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/10">
          <TabsTrigger value="tasks">Tareas Activas</TabsTrigger>
          <TabsTrigger value="rules">Reglas de Cocina</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pendientes</CardTitle>
              <CardDescription>Mantengamos el depa al 100.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar nueva tarea..."
                  value={newChore}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewChore(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addChore()}
                />
                <Button onClick={addChore} size="icon" className="shrink-0 bg-cyan-600 hover:bg-cyan-500">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {chores.map((chore) => (
                    <div
                      key={chore.id}
                      className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${chore.completed
                        ? "bg-emerald-900/10 border-emerald-500/20 opacity-60"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleChore(chore.id, chore.completed)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${chore.completed
                            ? "bg-emerald-500 border-emerald-500 text-black"
                            : "border-gray-500 hover:border-cyan-400"
                            }`}
                        >
                          {chore.completed && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <span className={`font-medium ${chore.completed ? "line-through text-gray-500" : "text-white"}`}>
                          {chore.task}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteChore(chore.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {chores.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>¡Todo limpio! Disfruten la vibra alta.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <div className="grid gap-6">
            <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  <Utensils className="w-5 h-5" />
                  Cocina y Trastes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-start p-4 bg-black/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white mb-1">Cero "Dejar para después"</h4>
                    <p className="text-sm text-gray-300">
                      Si cocinas, lavas. Los trastes sucios se lavan <strong>inmediatamente</strong>.
                      Nada de "se remoja" ni "mañana temprano".
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start p-4 bg-black/20 rounded-lg">
                  <Trash2 className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white mb-1">Domingo de Descarte</h4>
                    <p className="text-sm text-gray-300">
                      Los alimentos caducados se tiran. La limpieza del refri es obligatoria cada domingo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limpieza General</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-300">
                    <Badge variant="outline">Limpieza Pro</Badge>
                    Se paga con la Caja Común (Semanal/Quincenal).
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Badge variant="outline">Cuarto de Servicio</Badge>
                    Área Chill común. No es bodega ni habitación privada.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
