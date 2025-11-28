"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Roomie, Expense, ExpenseSplit } from "@/types";
import { ROOMIES } from "@/lib/bossLogic";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Receipt, Check, Clock, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ExpenseWithSplits extends Expense {
    splits: ExpenseSplit[];
}

export default function SharedExpenses() {
    const { roomie: currentRoomie } = useAuth();
    const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchExpenses();

        const channel = supabase
            .channel('expenses_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, fetchExpenses)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_splits' }, fetchExpenses)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchExpenses = async () => {
        try {
            const { data: expensesData, error } = await supabase
                .from('expenses')
                .select(`
                    *,
                    splits:expense_splits(*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setExpenses(expensesData as ExpenseWithSplits[]);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveExpense = async () => {
        if (!currentRoomie || !description || !amount) return;

        const totalAmount = parseFloat(amount);
        if (isNaN(totalAmount) || totalAmount <= 0) {
            toast.error("Monto inválido");
            return;
        }

        try {
            if (editingId) {
                // UPDATE EXISTING EXPENSE
                const { error: updateError } = await supabase
                    .from('expenses')
                    .update({
                        description,
                        amount: totalAmount,
                        // Don't update paid_by or date usually, unless requested. Keeping simple.
                    })
                    .eq('id', editingId);

                if (updateError) throw updateError;

                // Re-calculate splits if amount changed (simplest approach: delete and recreate)
                // We could optimize to only update if amount diff, but recreating ensures consistency.
                const { error: deleteSplitsError } = await supabase
                    .from('expense_splits')
                    .delete()
                    .eq('expense_id', editingId);

                if (deleteSplitsError) throw deleteSplitsError;

                const splitAmount = totalAmount / 3;
                const splits = ROOMIES.filter(r => r.id !== currentRoomie.id).map(r => ({
                    expense_id: editingId,
                    owed_by: r.id,
                    amount: splitAmount,
                    is_paid: false
                }));

                const { error: insertSplitsError } = await supabase
                    .from('expense_splits')
                    .insert(splits);

                if (insertSplitsError) throw insertSplitsError;

                toast.success("Gasto actualizado");
            } else {
                // CREATE NEW EXPENSE
                const { data: expense, error: expenseError } = await supabase
                    .from('expenses')
                    .insert([{
                        description,
                        amount: totalAmount,
                        paid_by: currentRoomie.id,
                        date: new Date().toISOString(),
                        category: 'other'
                    }])
                    .select()
                    .single();

                if (expenseError) throw expenseError;

                const splitAmount = totalAmount / 3;
                const splits = ROOMIES.filter(r => r.id !== currentRoomie.id).map(r => ({
                    expense_id: expense.id,
                    owed_by: r.id,
                    amount: splitAmount,
                    is_paid: false
                }));

                const { error: splitError } = await supabase
                    .from('expense_splits')
                    .insert(splits);

                if (splitError) throw splitError;

                toast.success("Gasto compartido agregado");
            }

            // Reset Form
            setDescription("");
            setAmount("");
            setEditingId(null);
            setIsAdding(false);
            fetchExpenses();

        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        }
    };

    const handleEdit = (expense: ExpenseWithSplits) => {
        setDescription(expense.description);
        setAmount(expense.amount.toString());
        setEditingId(expense.id);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este gasto?")) return;

        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Gasto eliminado");
            fetchExpenses();
        } catch (error) {
            toast.error("Error al eliminar gasto");
        }
    };

    const markSplitAsPaid = async (splitId: number) => {
        try {
            const { error } = await supabase
                .from('expense_splits')
                .update({ is_paid: true })
                .eq('id', splitId);

            if (error) throw error;
            toast.success("Deuda marcada como pagada");
            fetchExpenses();
        } catch (error) {
            toast.error("Error al actualizar pago");
        }
    };

    return (
        <div className="space-y-6">
            {/* Add Expense Card */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Gastos Compartidos</span>
                        <Button
                            variant={isAdding ? "secondary" : "default"}
                            onClick={() => {
                                setIsAdding(!isAdding);
                                if (isAdding) {
                                    setEditingId(null);
                                    setDescription("");
                                    setAmount("");
                                }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isAdding ? "Cancelar" : <><Plus className="w-4 h-4 mr-2" /> Nuevo Gasto</>}
                        </Button>
                    </CardTitle>
                    <CardDescription>Registra compras grupales (Pizza, Uber, Insumos) y divide la cuenta.</CardDescription>
                </CardHeader>

                {isAdding && (
                    <CardContent className="space-y-4 animate-in slide-in-from-top-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Descripción</label>
                                <Input
                                    placeholder="Ej. Pizza del Viernes"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Monto Total</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="pl-8"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <Button onClick={handleSaveExpense} className="w-full bg-emerald-600 hover:bg-emerald-700">
                            {editingId ? "Actualizar Gasto" : "Dividir entre 3 y Guardar"}
                        </Button>
                    </CardContent>
                )}
            </Card>

            {/* Expenses List */}
            <div className="space-y-4">
                {expenses.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">
                        <Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No hay gastos compartidos recientes.</p>
                    </div>
                )}

                {expenses.map((expense) => {
                    const payer = ROOMIES.find(r => r.id === expense.paid_by);
                    const isMyExpense = currentRoomie?.id === expense.paid_by;

                    return (
                        <Card key={expense.id} className="bg-black/20 border-white/5 overflow-hidden">
                            <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <Avatar className="mt-1">
                                        <AvatarImage src={payer?.avatar} />
                                        <AvatarFallback>{payer?.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white text-lg">{expense.description}</h4>
                                            {isMyExpense && (
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => handleEdit(expense)}>
                                                        <Pencil className="w-3 h-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-400" onClick={() => handleDelete(expense.id)}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400 flex items-center gap-2">
                                            Pagado por <span className="text-indigo-400">{payer?.name}</span>
                                            <span>•</span>
                                            {format(new Date(expense.created_at), "d MMM, h:mm a", { locale: es })}
                                        </p>
                                        <Badge variant="outline" className="mt-2 border-white/10 text-emerald-400">
                                            Total: ${expense.amount.toFixed(2)}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Splits Status */}
                                <div className="flex-1 md:max-w-md space-y-2">
                                    {expense.splits.map((split) => {
                                        const debtor = ROOMIES.find(r => r.id === split.owed_by);
                                        const isMe = currentRoomie?.id === split.owed_by;

                                        return (
                                            <div key={split.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarImage src={debtor?.avatar} />
                                                    </Avatar>
                                                    <span className={split.is_paid ? "text-gray-500 line-through" : "text-gray-300"}>
                                                        {debtor?.name} debe ${split.amount.toFixed(2)}
                                                    </span>
                                                </div>

                                                {split.is_paid ? (
                                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                                                        <Check className="w-3 h-3 mr-1" /> Pagado
                                                    </Badge>
                                                ) : (
                                                    // Show Pay button if I owe, or "Mark Paid" if I am the payer
                                                    (isMe || isMyExpense) && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 text-xs hover:bg-emerald-500/20 hover:text-emerald-400"
                                                            onClick={() => markSplitAsPaid(split.id)}
                                                        >
                                                            {isMe ? "Marcar Pagado" : "Confirmar Pago"}
                                                        </Button>
                                                    )
                                                )}
                                                {!split.is_paid && !isMe && !isMyExpense && (
                                                    <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                                                        <Clock className="w-3 h-3 mr-1" /> Pendiente
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
