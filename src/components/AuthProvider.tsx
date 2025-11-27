"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ROOMIES } from "@/lib/bossLogic";
import { Roomie } from "@/types";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    roomie: Roomie | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    roomie: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [roomie, setRoomie] = useState<Roomie | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                identifyRoomie(session.user.email);
            }
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                identifyRoomie(session.user.email);
            } else {
                setRoomie(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const identifyRoomie = (email: string | undefined) => {
        if (!email) return;
        // Simple mapping based on email or just assigning a "Guest" role if not found
        // For now, we will try to match by name if we had emails in the ROOMIES constant
        // Since we don't have emails in ROOMIES yet, we will just log it for now
        // and maybe assign based on a hardcoded list or just let them pick who they are later?
        // For this iteration, let's just store the user.

        // TODO: Add emails to ROOMIES constant in bossLogic.ts to map correctly
        console.log("User logged in:", email);
    };

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error signing in:", error);
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, roomie, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
