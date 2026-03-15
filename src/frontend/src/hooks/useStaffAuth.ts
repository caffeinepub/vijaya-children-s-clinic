import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useActor } from "./useActor";

const STAFF_AUTH_KEY = "vijaya_clinic_staff_auth";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface StaffAuthState {
  isAuthenticated: boolean;
  username: string;
  timestamp: number;
}

export function useStaffAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check for existing authentication on mount and validate session
  useEffect(() => {
    const validateSession = () => {
      const storedAuth = localStorage.getItem(STAFF_AUTH_KEY);
      if (storedAuth) {
        try {
          const authState: StaffAuthState = JSON.parse(storedAuth);
          const isValid = Date.now() - authState.timestamp < SESSION_DURATION;

          if (isValid && authState.isAuthenticated) {
            setIsAuthenticated(true);
          } else {
            // Session expired
            localStorage.removeItem(STAFF_AUTH_KEY);
            setIsAuthenticated(false);
          }
        } catch {
          localStorage.removeItem(STAFF_AUTH_KEY);
          setIsAuthenticated(false);
        }
      }
    };

    validateSession();

    // Listen for storage events to sync auth state across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STAFF_AUTH_KEY) {
        validateSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
            // Session expired while user was away
            localStorage.removeItem(STAFF_AUTH_KEY);
            setIsAuthenticated(false);
            setError("Your session has expired. Please log in again.");
            navigate({ to: "/staff" });
          }
        } catch {
          localStorage.removeItem(STAFF_AUTH_KEY);
          setIsAuthenticated(false);
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [navigate]);

  const login = useCallback(
    async (userId: string, password: string) => {
      setIsLoggingIn(true);
      setError(null);

      try {
        // Wait for actor to be ready
        if (!actor || actorFetching) {
          let attempts = 0;
          const maxAttempts = 20;
          while (attempts < maxAttempts && (!actor || actorFetching)) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            attempts++;
          }

          if (!actor) {
            setError("System not ready. Please try again.");
            setIsLoggingIn(false);
            return false;
          }
        }

        // Authenticate with username/password — no Internet Identity required
        const result = await actor.authenticateStaff({ userId, password });

        if (result) {
          // Store authentication state with timestamp
          const authState: StaffAuthState = {
            isAuthenticated: true,
            username: userId,
            timestamp: Date.now(),
          };
          localStorage.setItem(STAFF_AUTH_KEY, JSON.stringify(authState));
          setIsAuthenticated(true);

          // Invalidate all queries to refresh data with new auth state
          await queryClient.invalidateQueries();

          return true;
        }
        setError(
          "Invalid user ID or password. Please check your credentials and try again.",
        );
        return false;
      } catch (err) {
        console.error("[useStaffAuth] Login error:", err);
        setError("Login failed. Please check your credentials and try again.");
        return false;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [actor, actorFetching, queryClient],
  );

  const logout = useCallback(async () => {
    try {
      // Call backend logout to clear server-side session
      if (actor) {
        await actor.logoutStaff();
      }
    } catch (err) {
      console.error("[useStaffAuth] Logout error:", err);
    } finally {
      // Always clear local state regardless of backend call result
      localStorage.removeItem(STAFF_AUTH_KEY);
      setIsAuthenticated(false);
      setError(null);

      // Clear all cached queries
      queryClient.clear();

      // Navigate back to staff login page so staff can log back in
      navigate({ to: "/staff" });
    }
  }, [actor, queryClient, navigate]);

  return {
    isAuthenticated,
    isLoggingIn,
    error,
    login,
    logout,
  };
}
