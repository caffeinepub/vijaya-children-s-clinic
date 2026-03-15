import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

const STAFF_AUTH_KEY = "vijaya_clinic_staff_auth";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Hardcoded staff credentials — single shared login for all staff
const VALID_USERNAME = "vijaya";
const VALID_PASSWORD = "vijaya";

interface StaffAuthState {
  isAuthenticated: boolean;
  username: string;
  timestamp: number;
}

export function useStaffAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check for existing valid session on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem(STAFF_AUTH_KEY);
    if (storedAuth) {
      try {
        const authState: StaffAuthState = JSON.parse(storedAuth);
        const isValid = Date.now() - authState.timestamp < SESSION_DURATION;
        if (isValid && authState.isAuthenticated) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(STAFF_AUTH_KEY);
        }
      } catch {
        localStorage.removeItem(STAFF_AUTH_KEY);
      }
    }
  }, []);

  // Validate session on window focus
  useEffect(() => {
    const handleFocus = () => {
      const storedAuth = localStorage.getItem(STAFF_AUTH_KEY);
      if (storedAuth) {
        try {
          const authState: StaffAuthState = JSON.parse(storedAuth);
          const isValid = Date.now() - authState.timestamp < SESSION_DURATION;
          if (!isValid) {
            localStorage.removeItem(STAFF_AUTH_KEY);
            setIsAuthenticated(false);
            setError("Your session has expired. Please log in again.");
          }
        } catch {
          localStorage.removeItem(STAFF_AUTH_KEY);
          setIsAuthenticated(false);
        }
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const login = useCallback(
    async (userId: string, password: string) => {
      setIsLoggingIn(true);
      setError(null);

      try {
        // Pure frontend credential check — no backend call needed
        if (userId.trim() === VALID_USERNAME && password === VALID_PASSWORD) {
          const authState: StaffAuthState = {
            isAuthenticated: true,
            username: userId.trim(),
            timestamp: Date.now(),
          };
          localStorage.setItem(STAFF_AUTH_KEY, JSON.stringify(authState));
          setIsAuthenticated(true);
          // Refresh appointments data after login
          await queryClient.invalidateQueries();
          return true;
        }
        setError(
          "Invalid user ID or password. Please check your credentials and try again.",
        );
        return false;
      } catch (err) {
        console.error("[useStaffAuth] Login error:", err);
        setError("Login failed. Please try again.");
        return false;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    localStorage.removeItem(STAFF_AUTH_KEY);
    setIsAuthenticated(false);
    setError(null);
    queryClient.clear();
    navigate({ to: "/staff" });
  }, [queryClient, navigate]);

  return {
    isAuthenticated,
    isLoggingIn,
    error,
    login,
    logout,
  };
}
