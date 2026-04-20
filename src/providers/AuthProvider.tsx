import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase/supabaseClient';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session ?? null);
    }).catch(() => {
      if (mounted) setSession(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    if (session === undefined) return undefined;
    return {
      session,
      user: session?.user ?? null,
      signIn: ({ email, password }) => supabase.auth.signInWithPassword({ email, password }),
      signUp: ({ email, password }) => supabase.auth.signUp({ email, password }),
      signOut: () => supabase.auth.signOut(),
    };
  }, [session]);

  if (value === undefined) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
