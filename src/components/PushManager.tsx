"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BellRing, BellOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { VAPID_PUBLIC_KEY } from "../lib/pushConfig";

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushManager() {
    const { roomie } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(function (registration) {
                registration.pushManager.getSubscription().then(function (subscription) {
                    setIsSubscribed(!(subscription === null));
                });
            });
        }
    }, []);

    const subscribeUser = async () => {
        if (!roomie) return;
        setLoading(true);

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            const sub = JSON.parse(JSON.stringify(subscription));

            const { error } = await supabase.from('push_subscriptions').insert({
                roomie_id: roomie.id,
                endpoint: sub.endpoint,
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth
            });

            if (error) throw error;

            setIsSubscribed(true);
            toast.success("Notificaciones activadas en este dispositivo");
        } catch (error) {
            console.error('Failed to subscribe the user: ', error);
            toast.error("Error al activar notificaciones");
        } finally {
            setLoading(false);
        }
    };

    if (!roomie) return null;

    if (isSubscribed) {
        return (
            <Button variant="ghost" size="icon" className="text-cyan-400" disabled>
                <BellRing className="w-5 h-5" />
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white"
            onClick={subscribeUser}
            disabled={loading}
        >
            <BellOff className="w-4 h-4" />
            {loading ? "Activando..." : "Activar Alertas"}
        </Button>
    );
}
