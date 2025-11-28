"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ROOMIES } from "@/lib/bossLogic";
import { Roomie } from "@/types";
import { toast } from "sonner";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    roomie: Roomie | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    linkRoomie: (roomieId: string) => Promise<void>;
    unlinkRoomie: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    roomie: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
    linkRoomie: async () => { },
    unlinkRoomie: async () => { },
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
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setRoomie(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('roomie_id, nickname, avatar_url, bio')
                .eq('id', userId)
                .single();

            if (data?.roomie_id) {
                const foundRoomie = ROOMIES.find(r => r.id === data.roomie_id);
                if (foundRoomie) {
                    setRoomie({
                        ...foundRoomie,
                        name: data.nickname || foundRoomie.name,
                        avatar: data.avatar_url || foundRoomie.avatar,
                    });
                }
            } else {
                setRoomie(null);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const linkRoomie = async (roomieId: string) => {
        if (!user) return;
        try {
            // Upsert profile with new roomie_id
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    roomie_id: roomieId
                }, { onConflict: 'id' });

            if (error) {
                if (error.code === '23505') { // Unique violation
                    toast.error("Este perfil ya está vinculado a otro usuario.");
                } else {
                    throw error;
                }
                return;
            }

            // Update local state
            const foundRoomie = ROOMIES.find(r => r.id === roomieId);
            if (foundRoomie) setRoomie(foundRoomie);
            toast.success("Perfil vinculado exitosamente");
        } catch (error) {
            console.error("Error linking roomie:", error);
            toast.error("Error al vincular perfil");
        }
    };

    const unlinkRoomie = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ roomie_id: null })
                .eq('id', user.id);

            if (error) throw error;

            setRoomie(null);
            toast.success("Perfil desvinculado");
        } catch (error) {
            console.error("Error unlinking roomie:", error);
            toast.error("Error al desvincular perfil");
        }
    };

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error signing in with Google:", error);
            toast.error("Error al iniciar sesión");
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setRoomie(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, roomie, loading, signInWithGoogle, signOut, linkRoomie, unlinkRoomie }}>
            {children}
        </AuthContext.Provider>
    );
}
