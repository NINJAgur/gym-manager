import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

interface AuthValue {
  session: Session | null;
  profile: Profile | null;
  /** True until both the session and, when signed in, the profile row resolve. */
  loading: boolean;
  /** Set when the profile row can't be read — missing schema, RLS, no row. */
  profileError: Error | null;
  signInWithGoogle: () => Promise<void>;
  /** Emails a one-time sign-in link. */
  sendSignInLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setSessionReady(true);
      if (!next) queryClient.clear();
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  const userId = session?.user.id;

  // The profile row is written by the on_auth_user_created trigger; on a brand
  // new account it can lag the session by a moment, hence the retry.
  const { data: profile, isPending: profilePending, error: profileError } = useQuery({
    queryKey: ['profile', userId],
    enabled: Boolean(userId),
    retry: 3,
    retryDelay: 400,
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, status, created_at, avatar_url')
        .eq('id', userId!)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });

  const value = useMemo<AuthValue>(
    () => ({
      session,
      profile: profile ?? null,
      loading: !sessionReady || (Boolean(userId) && profilePending),
      profileError: profileError as Error | null,
      signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          // /app resolves the role and forwards; `/` is the public homepage.
          options: { redirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
      },
      sendSignInLink: async (email) => {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          // A link rather than a code: editing the template to carry the code
          // needs custom SMTP, which is not set up yet. Swap back when it is.
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });
        if (error) throw error;
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, profile, sessionReady, userId, profilePending, profileError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
