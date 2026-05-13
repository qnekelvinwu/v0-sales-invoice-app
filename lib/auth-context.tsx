"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface UserInfo {
  name: string;
  displayName: string;
  email: string;
  tenantCode: string;
  roles: string;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "qne_auth_token";

function parseJwtPayload(token: string): UserInfo | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    
    const payload = JSON.parse(jsonPayload);
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    
    return {
      name: payload.name || "",
      displayName: payload.dname || payload.name || "",
      email: Array.isArray(payload.email) ? payload.email[0] : payload.email || "",
      tenantCode: payload.tenantCode || "",
      roles: payload.roles || "",
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from URL token or session storage
  useEffect(() => {
    // Use window.location to get URL params (avoids useSearchParams Suspense requirement)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    
    if (urlToken) {
      // URL token takes priority
      const userInfo = parseJwtPayload(urlToken);
      if (userInfo) {
        setToken(urlToken);
        setUser(userInfo);
        sessionStorage.setItem(SESSION_KEY, urlToken);
        // Remove token from URL for security
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("token");
        window.history.replaceState({}, "", newUrl.toString());
      }
    } else {
      // Check session storage
      const storedToken = sessionStorage.getItem(SESSION_KEY);
      if (storedToken) {
        const userInfo = parseJwtPayload(storedToken);
        if (userInfo) {
          setToken(storedToken);
          setUser(userInfo);
        } else {
          // Token is invalid or expired
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string): boolean => {
    const userInfo = parseJwtPayload(newToken);
    if (userInfo) {
      setToken(newToken);
      setUser(userInfo);
      sessionStorage.setItem(SESSION_KEY, newToken);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
