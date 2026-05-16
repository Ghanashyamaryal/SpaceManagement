import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear token from localStorage
      localStorage.removeItem("token");
      
      // Optional: If you have a backend logout endpoint, call it here
      // await fetch("/api/auth/logout", { method: "POST" });

      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
}
