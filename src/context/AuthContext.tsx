import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  usedCapabilities: string[];
  trackCapability: (capabilityName: string) => boolean;
  requireAuthForDownload: () => boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (reason?: string, title?: string, subtitle?: string) => void;
  closeAuthModal: () => void;
  authModalReason: string;
  authModalTitle: string;
  authModalSubtitle: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'satquery_used_capabilities';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Capability tracking for guests (unauthenticated users)
  const [usedCapabilities, setUsedCapabilities] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<string>('general');
  const [authModalTitle, setAuthModalTitle] = useState<string>('Sign In to SatQuery AI');
  const [authModalSubtitle, setAuthModalSubtitle] = useState<string>(
    'Sign in to access unlimited remote sensing analysis and certified reports.'
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (
    reason = 'general',
    title = 'Sign In to SatQuery AI',
    subtitle = 'Sign in to access unlimited remote sensing analysis and certified reports.'
  ) => {
    setAuthModalReason(reason);
    setAuthModalTitle(title);
    setAuthModalSubtitle(subtitle);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  /**
   * Tracks a capability usage for guests.
   * If user is authenticated -> always allowed (returns true).
   * If user is guest:
   *   - If capability was already used or total < 2 -> allowed (returns true).
   *   - If total >= 2 and trying a 3rd new capability -> prompts Auth modal (returns false).
   */
  const trackCapability = (capabilityName: string): boolean => {
    if (user) {
      return true; // Authenticated users have unlimited access
    }

    if (usedCapabilities.includes(capabilityName)) {
      return true; // Already explored this capability within the free tier
    }

    if (usedCapabilities.length < 2) {
      const updated = [...usedCapabilities, capabilityName];
      setUsedCapabilities(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save used capabilities to localStorage', e);
      }
      return true;
    }

    // Attempted 3rd distinct capability as a guest
    openAuthModal(
      'capability_limit',
      'Unlock Unlimited AI Analysis',
      "You've explored 2 free capabilities as a guest. Please sign in to unlock all specialist models, multi-spectral inspection, and GIS tools."
    );
    return false;
  };

  /**
   * Requires authentication for report downloads.
   * Authenticated -> returns true.
   * Guest -> opens auth modal and returns false.
   */
  const requireAuthForDownload = (): boolean => {
    if (user) {
      return true;
    }

    openAuthModal(
      'download_report',
      'Sign In to Download Reports',
      'Certified geospatial intelligence PDF reports require an authenticated account. Please sign in or create a free account to download.'
    );
    return false;
  };

  const signIn = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (!res.error && res.data.user) {
      setUser(res.data.user);
      setIsAuthModalOpen(false);
    }
    return res;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          username: email.split('@')[0]
        }
      }
    });
    if (!res.error && res.data.user) {
      setUser(res.data.user);
      setIsAuthModalOpen(false);
    }
    return res;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        usedCapabilities,
        trackCapability,
        requireAuthForDownload,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalReason,
        authModalTitle,
        authModalSubtitle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
