import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

/* ================= TYPES ================= */

export type Role = {
  id: number;
  name: string;
  roleType: string;
};

export type Account = {
  id: number;
  companyName: string;
};

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone: string;
  image: string | null;
  role: Role;
  account: Account;
};

/* ================= CONTEXT TYPE ================= */

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => void;
  refetchProfile: () => Promise<void>;
};

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ========== FETCH PROFILE ========== */
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/user/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok || json.status !== 1) {
        throw new Error("Invalid token");
      }

      setUser(json.data);
    } catch (err) {
      console.error("Profile fetch failed:", err);
      logout(); // token invalid → force logout
    } finally {
      setLoading(false);
    }
  }, []);

  /* ========== LOAD PROFILE ON APP START ========== */
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* ========== LOGOUT ========== */
  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role?.roleType === "ADMIN",
        logout,
        refetchProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
