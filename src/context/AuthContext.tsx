import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types";

type AuthContextType = {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
    isModerator: boolean;
    isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadProfile(userId: string) {
        const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, apartment, email, role, status, avatar_url, created_at")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            console.error("Error cargando perfil:", error.message);
            setProfile(null);
            return;
        }
        setProfile((data as Profile | null) ?? null);
    }

    async function refreshProfile() {
        if (user) await loadProfile(user.id);
    }

    useEffect(() => {
        let cancelled = false;

        supabase.auth.getSession().then(async ({ data }) => {
            if (cancelled) return;
            setSession(data.session);
            setUser(data.session?.user ?? null);
            if (data.session?.user) await loadProfile(data.session.user.id);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);
                if (newSession?.user) await loadProfile(newSession.user.id);
                else setProfile(null);
                setLoading(false);
            }
        );

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    async function signOut() {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
    }

    const isModerator =
        profile?.role === "moderador" || profile?.role === "administrador";
    const isAdmin = profile?.role === "administrador";

    return (
        <AuthContext.Provider
            value={{ session, user, profile, loading, refreshProfile, signOut, isModerator, isAdmin }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return ctx;
}