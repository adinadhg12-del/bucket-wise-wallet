import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpOrIn = async (identifier: string, type: 'phone' | 'email') => {
    const email = type === 'phone'
      ? `${identifier.replace(/[^0-9]/g, '')}@phone.budgetbuddy.app`
      : identifier;
    const password = `BB_${email}_secure_2024`;

    // Try sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInError) return { error: null, isNewUser: false };

    // If sign in fails, try sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (signUpError) return { error: signUpError.message, isNewUser: false };

    return { error: null, isNewUser: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signUpOrIn, signOut };
};
