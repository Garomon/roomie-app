import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ROOMIES } from '@/lib/bossLogic';
import { toast } from 'sonner';

export function useAutoNudge() {
    useEffect(() => {
        const checkAndNudge = async () => {
            let nudgesSentCount = 0;

            try {
                const now = new Date();
                const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

                const { data: overdueChores, error } = await supabase
                    .from('chores')
                    .select('*')
                    .eq('completed', false)
                    .lt('due_date', now.toISOString());

                if (error) {
                    console.error('Error fetching overdue chores:', error);
                    return;
                }

                if (!overdueChores || overdueChores.length === 0) {
                    return;
                }

                for (const chore of overdueChores) {
                    const lastSent = chore.last_reminder_sent_at ? new Date(chore.last_reminder_sent_at) : null;

                    if (!lastSent || lastSent < twentyFourHoursAgo) {
                        const assigned = ROOMIES.find(r => r.id === chore.assigned_to);
                        if (!assigned) continue;

                        console.log(`Sending auto-nudge for chore: ${chore.task} to ${assigned.name}`);

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

                        await supabase
                            .from('chores')
                            .update({ last_reminder_sent_at: new Date().toISOString() })
                            .eq('id', chore.id);

                        nudgesSentCount++;
                    }
                }

                if (nudgesSentCount > 0) {
                    toast.success(`Se enviaron ${nudgesSentCount} recordatorios automáticos.`);
                }

            } catch (error) {
                console.error("Error in auto-nudge:", error);
            }
        };

        checkAndNudge();
    }, []);
}
