import React, { createContext, useContext, useState, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'agent';
  company?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithGithub: () => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<string, User> = {
  'admin@chatflow.com': {
    id: '1',
    email: 'admin@chatflow.com',
    name: 'Admin User',
    role: 'admin',
    company: 'ChatFlow Inc.',
  },
  'john@company.com': {
    id: '2',
    email: 'john@company.com',
    name: 'John Doe',
    role: 'user',
    company: 'Acme Corp',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('chatflow_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers[email];
    if (foundUser && password.length >= 6) {
      setUser(foundUser);
      localStorage.setItem('chatflow_user', JSON.stringify(foundUser));
      return true;
    }
    
    // Allow any email/password for demo
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      role: 'user',
    };
    setUser(newUser);
    localStorage.setItem('chatflow_user', JSON.stringify(newUser));
    return true;
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const googleUser: User = {
      id: 'google-' + Date.now(),
      email: 'user@gmail.com',
      name: 'Google User',
      role: 'user',
    };
    setUser(googleUser);
    localStorage.setItem('chatflow_user', JSON.stringify(googleUser));
    return true;
  }, []);

  const loginWithGithub = useCallback(async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const githubUser: User = {
      id: 'github-' + Date.now(),
      email: 'user@github.com',
      name: 'GitHub User',
      role: 'user',
    };
    setUser(githubUser);
    localStorage.setItem('chatflow_user', JSON.stringify(githubUser));
    return true;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user',
    };
    setUser(newUser);
    localStorage.setItem('chatflow_user', JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('chatflow_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        loginWithGoogle,
        loginWithGithub,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
