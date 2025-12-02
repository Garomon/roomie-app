"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ROOMIES } from "@/lib/bossLogic";
import { Trash2, CheckCircle2, AlertCircle, Utensils, Sparkles, Calendar, User, Filter, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chore } from "@/types";
import { useAuth } from "@/components/AuthProvider";
import ChoreForm from "@/components/ChoreForm";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export default function ChoresTracker() {
  const { roomie } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [filter, setFilter] = useState<"all" | "mine" | string>("all");
  const [sortBy, setSortBy] = useState<"priority" | "due_date" | "created">("due_date");

  const fetchChores = async () => {
    try {
      const { data } = await supabase.from('chores').select('*').order('created_at', { ascending: false });
      if (data) setChores(data as Chore[]);
    } catch (error) {
      console.error("Error fetching chores", error);
    }
  };

  useEffect(() => {
    fetchChores();

    const channel = supabase
      .channel('chores_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chores' },
        () => {
          fetchChores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addChore = async (choreData: {
    task: string;
    assigned_to: string;
    due_date?: string;
    priority: 'low' | 'medium' | 'high';
    recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  }) => {
    try {
      const { error } = await supabase.from('chores').insert([{
        task: choreData.task,
        completed: false,
        assigned_to: choreData.assigned_to,
        due_date: choreData.due_date || null,
        priority: choreData.priority,
        recurring: choreData.recurring
      }]);

      if (error) {
        console.error("Supabase insert error:", error);
        toast.error(`Error al agregar tarea: ${error.message}`);
        return;
      }

      toast.success("Tarea agregada");
      fetchChores();
    } catch (error) {
      console.error("Unexpected error adding chore:", error);
      toast.error("Error inesperado al agregar tarea");
    }
  };

  const toggleChore = async (id: number, currentCompletedStatus: boolean) => {
    const chore = chores.find(c => c.id === id);
    if (!chore) return;

    const newCompletedStatus = !currentCompletedStatus;

    try {
      const { error } = await supabase.from('chores').update({
        completed: newCompletedStatus,
        completed_at: newCompletedStatus ? new Date().toISOString() : null,
        completed_by: newCompletedStatus ? roomie?.id : null
      }).eq('id', id);

      if (error) {
        console.error("Supabase update error:", error);
        toast.error(`Error al actualizar tarea: ${error.message}`);
        return;
      }

      // Handle Recurring Logic
      if (newCompletedStatus && chore.recurring && chore.recurring !== 'none') {
        let newDueDate = new Date();
        // If it had a due date, base next one on that? Or on today?
        // Usually better to base on today (completion date) to avoid stacking overdue tasks, 
        // OR base on original due date to keep schedule strict.
        // Let's base on TODAY for simplicity and "fresh start" feeling.

        if (chore.recurring === 'daily') newDueDate.setDate(newDueDate.getDate() + 1);
        if (chore.recurring === 'weekly') newDueDate.setDate(newDueDate.getDate() + 7);
        if (chore.recurring === 'monthly') newDueDate.setMonth(newDueDate.getMonth() + 1);

        const { error: recurError } = await supabase.from('chores').insert([{
          task: chore.task,
          assigned_to: chore.assigned_to,
          priority: chore.priority,
          recurring: chore.recurring,
          due_date: newDueDate.toISOString(),
          completed: false
        }]);

        if (recurError) {
          console.error("Error creating recurring task:", recurError);
          toast.error("Error al crear tarea recurrente");
        } else {
          toast.success("Tarea recurrente programada para la próxima vez");
        }
      }

      fetchChores();
    } catch (error) {
      console.error("Unexpected error updating chore:", error);
      toast.error("Error inesperado al actualizar tarea");
    }
  };

  const deleteChore = async (id: number) => {
    try {
      const { error } = await supabase.from('chores').delete().eq('id', id);

      if (error) {
        console.error("Supabase delete error:", error);
        toast.error(`Error al eliminar tarea: ${error.message}`);
        return;
      }

      toast.success("Tarea eliminada");
      fetchChores();
    } catch (error) {
      console.error("Unexpected error deleting chore:", error);
      toast.error("Error inesperado al eliminar tarea");
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDueDateStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Vencida hace ${Math.abs(diffDays)}d`, className: 'text-red-400' };
    if (diffDays === 0) return { text: 'Vence hoy', className: 'text-orange-400' };
    if (diffDays <= 3) return { text: `Vence en ${diffDays}d`, className: 'text-yellow-400' };
    return { text: `Vence en ${diffDays}d`, className: 'text-gray-400' };
  };

  const getAssignedRoomie = (assignedTo?: string) => {
    return ROOMIES.find(r => r.id === assignedTo);
  };

  const filteredChores = chores.filter(chore => {
    if (filter === "all") return true;
    if (filter === "mine") return chore.assigned_to === roomie?.id;
    return chore.assigned_to === filter;
  });

  const sortedChores = [...filteredChores].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2, undefined: 3 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
    }
    if (sortBy === "due_date") {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

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

        <TabsContent value="tasks" className="mt-6 space-y-4">
          <ChoreForm onSubmit={addChore} />

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-gray-400" />
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Todas
            </Button>
            <Button
              variant={filter === "mine" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("mine")}
            >
              Mis tareas
            </Button>
            {ROOMIES.map((r) => (
              <Button
                key={r.id}
                variant={filter === r.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(r.id)}
              >
                {r.name}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Pendientes</CardTitle>
              <CardDescription>Mantengamos el depa al 100.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {sortedChores.map((chore) => {
                    const assignedRoomie = getAssignedRoomie(chore.assigned_to);
                    const dueStatus = getDueDateStatus(chore.due_date);

                    return (
                      <div
                        key={chore.id}
                        className={`group flex items-start justify-between p-4 rounded-xl border transition-all ${chore.completed
                          ? "bg-emerald-900/10 border-emerald-500/20 opacity-60"
                          : dueStatus?.className.includes('red')
                            ? "bg-red-900/10 border-red-500/20"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                          }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => toggleChore(chore.id, chore.completed)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-1 ${chore.completed
                              ? "bg-emerald-500 border-emerald-500 text-black"
                              : "border-gray-500 hover:border-cyan-400"
                              }`}
                          >
                            {chore.completed && <CheckCircle2 className="w-4 h-4" />}
                          </button>

                          <div className="flex-1 space-y-2">
                            <span className={`font-medium block ${chore.completed ? "line-through text-gray-500" : "text-white"}`}>
                              {chore.task}
                            </span>

                            <div className="flex flex-wrap gap-2">
                              {assignedRoomie && (
                                <div>
                                  <h4 className="font-bold text-white mb-1">Cero &quot;Dejar para después&quot;</h4>
                                  <p className="text-sm text-gray-300">
                                    Si cocinas, lavas. Los trastes sucios se lavan <strong>inmediatamente</strong>.
                                    Nada de &quot;se remoja&quot; ni &quot;mañana temprano&quot;.
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
    </div>
                );
}
