import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'teacher' | 'driver' | 'monitor' | 'nurse';
  status: 'pending' | 'approved' | 'suspended';
  schoolId?: string;
  busId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signUp: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          status: data.status,
          schoolId: data.school_id,
          busId: data.bus_id
        });
      } else {
        // No profile found, create a default one or handle gracefully
        console.log('No user profile found for user:', userId);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // First try Supabase authentication with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username, // assuming username is email
        password: password
      });

      if (data.user && !error) {
        // Supabase auth successful, user profile will be fetched by auth state change
        return true;
      }

      // If Supabase auth fails, fall back to test credentials
      const testUsers = {
        'admin': { id: 'admin-1', name: 'Admin User', email: 'admin@test.com', phone: '555-0001', role: 'admin' as const, status: 'approved' as const },
        'teacher': { id: 'teacher-1', name: 'Teacher User', email: 'teacher@test.com', phone: '555-0002', role: 'teacher' as const, status: 'approved' as const },
        'driver': { id: 'driver-1', name: 'Driver User', email: 'driver@test.com', phone: '555-0003', role: 'driver' as const, status: 'approved' as const },
        'monitor': { id: 'monitor-1', name: 'Monitor User', email: 'monitor@test.com', phone: '555-0004', role: 'monitor' as const, status: 'approved' as const },
        'nurse': { id: 'nurse-1', name: 'Nurse User', email: 'nurse@test.com', phone: '555-0005', role: 'nurse' as const, status: 'approved' as const }
      };

      if (password === 'password' && testUsers[username as keyof typeof testUsers]) {
        setUser(testUsers[username as keyof typeof testUsers]);
        setIsLoading(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signUp = async (userData: any) => {
    const { data, error } = await supabase.functions.invoke('auth-operations', {
      body: { action: 'signUp', userData },
    });

    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signUp,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};