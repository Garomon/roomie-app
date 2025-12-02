import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ROOMIES } from '@/lib/bossLogic';
import { toast } from 'sonner';

export function useAutoNudge() {
    useEffect(() => {
        const checkAndNudge = async () => {
            try {
                // 1. Get overdue chores that haven't been nudged in the last 24 hours
                const now = new Date();
                const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

                const { data: overdueChores, error } = await supabase
                    .from('chores')
                    .select('*')
                    .eq('completed', false)
                    .lt('due_date', now.toISOString());
                // Call our push API
                await fetch("/api/push/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        roomieId: chore.assigned_to,
                        title: "⏳ Tarea Vencida",
                        message: `Oye ${assigned.name}, se te pasó: "${chore.task}". ¡Ponte las pilas!`,
                        url: "/chores"
                    })
                });

                // Update last_reminder_sent_at
                await supabase
                    .from('chores')
                    .update({ last_reminder_sent_at: new Date().toISOString() })
                    .eq('id', chore.id);
            }
                }

        ```javascript
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ROOMIES } from '@/lib/bossLogic';
import { toast } from 'sonner';

export function useAutoNudge() {
    useEffect(() => {
        const checkAndNudge = async () => {
            const toastId = toast.loading("Buscando tareas vencidas para recordar...");
            let nudgesSentCount = 0;

            try {
                // 1. Get overdue chores that haven't been nudged in the last 24 hours
                const now = new Date();
                const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

                const { data: overdueChores, error } = await supabase
                    .from('chores')
                    .select('*')
                    .eq('completed', false)
                    .lt('due_date', now.toISOString());

                if (error) {
                    console.error('Error fetching overdue chores:', error);
                    toast.error("Error al buscar tareas vencidas.", { id: toastId });
                    return;
                }

                if (!overdueChores || overdueChores.length === 0) {
                    toast.success("No hay tareas vencidas que necesiten un recordatorio.", { id: toastId });
                    return;
                }

                for (const chore of overdueChores) {
                    // Check if we should nudge
                    const lastSent = chore.last_reminder_sent_at ? new Date(chore.last_reminder_sent_at) : null;

                    if (!lastSent || lastSent < twentyFourHoursAgo) {
                        // SEND NUDGE
                        const assigned = ROOMIES.find(r => r.id === chore.assigned_to);
                        if (!assigned) continue;

                        console.log(`Sending auto - nudge for chore: ${ chore.task } to ${ assigned.name } `);

                        // Call our push API
                        await fetch("/api/push/send", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                roomieId: chore.assigned_to,
                                title: "⏳ Tarea Vencida",
                                message: `Oye ${ assigned.name }, se te pasó: "${chore.task}". ¡Ponte las pilas!`,
                                url: "/chores"
                            })
                        });

                        // Update last_reminder_sent_at
                        await supabase
                            .from('chores')
                            .update({ last_reminder_sent_at: new Date().toISOString() })
                            .eq('id', chore.id);
                        
                        nudgesSentCount++;
                    }
                }

                if (nudgesSentCount > 0) {
}
```
