import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_BASE = (
  process.env.REACT_APP_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

async function readJson(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || "Yêu cầu không thành công";

    throw new Error(message);
  }

  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        setUser(null);
        return null;
      }

      const data = await readJson(response);

      setUser(data.user || null);

      return data.user || null;
    } catch (error) {
      console.error("Không thể kiểm tra phiên đăng nhập:", error);

      setUser(null);

      return null;
    } finally {
      setSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async ({ email, password, rememberMe }) => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe: Boolean(rememberMe),
        }),
      });

      const data = await readJson(response);

      setUser(data.user || null);

      return data;
    },
    [],
  );

  const register = useCallback(
    async ({ name, email, phone, password }) => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      const data = await readJson(response);

      setUser(data.user || null);

      return data;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      sessionLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshSession,
    }),
    [
      user,
      sessionLoading,
      login,
      register,
      logout,
      refreshSession,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth phải được dùng bên trong AuthProvider",
    );
  }

  return context;
}