import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabase } from "@/lib/supabase";
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from "../../../../lib/pushConfig";

export async function POST(request: Request) {
    try {
        const { senderId, title, message, url } = await request.json();

        if (!title || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Fetch ALL subscriptions
        const { data: subscriptions, error } = await supabase
            .from("push_subscriptions")
            .select("*");

        if (error || !subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ message: "No subscriptions found" });
        }

        // Configure web-push
        webpush.setVapidDetails(
            "mailto:admin@roomieapp.com",
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY
        );

        // Send notifications
        const payload = JSON.stringify({ title, message, url });

        const promises = subscriptions.map((sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            return webpush.sendNotification(pushSubscription, payload).catch((err) => {
                console.error("Error sending notification", err);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription is invalid, delete it
                    supabase.from("push_subscriptions").delete().eq("id", sub.id);
                }
            });
        });

        await Promise.all(promises);

        return NextResponse.json({ success: true, count: subscriptions.length });
    } catch (error) {
        console.error("Error in broadcast API", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
