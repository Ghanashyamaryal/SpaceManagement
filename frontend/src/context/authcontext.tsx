import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  user: any;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, user: any) => void;
  updateUser: (user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      // Render immediately from the cached user...
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);

      // ...then refresh from the server so approval status (and any other
      // server-side changes) stay current without requiring a re-login.
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          if (data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
          }
        })
        .catch(() => {
          /* keep cached user on transient failure */
        });
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const updateUser = (userData: any) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
