import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "student" | "faculty" | "parent" | "admin";

export interface AuthUser {
  name: string;
  email: string;
  role: Role;
  subtitle: string;
  avatar?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  ready: boolean;
  login: (u: AuthUser) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({ user: null, ready: false, login: () => {}, logout: () => {} });
const KEY = "cc_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Synchronously hydrate from localStorage on the client BEFORE first render
  // so protected routes don't bounce to /login on refresh.
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  // `ready` becomes true after the first client effect — SSR/hydration safe.
  const [ready, setReady] = useState<boolean>(typeof window !== "undefined");
  useEffect(() => {
    if (!ready) {
      try {
        const raw = window.localStorage.getItem(KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {}
      setReady(true);
    }
    // Keep tabs in sync
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      try { setUser(e.newValue ? JSON.parse(e.newValue) : null); } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [ready]);
  const login = (u: AuthUser) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };
  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

export const demoUsers: Record<Role, AuthUser> = {
  student: { name: "Ananya Sharma", email: "ananya@campus.edu", role: "student", subtitle: "CSE · 3rd Year" },
  faculty: { name: "Dr. Priya Sharma", email: "priya@campus.edu", role: "faculty", subtitle: "Computer Science Dept." },
  parent: { name: "Rajesh Sharma", email: "rajesh@parent.edu", role: "parent", subtitle: "Parent of Ananya" },
  admin: { name: "Admin User", email: "admin@campus.edu", role: "admin", subtitle: "System Administrator" },
};
