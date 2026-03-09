import { useState, useEffect, useCallback } from 'react';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';

const STAFF_AUTH_KEY = 'vijaya_clinic_staff_auth';
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
  const { identity, login: iiLogin, loginStatus } = useInternetIdentity();
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
        } catch (e) {
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

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
            setError('Your session has expired. Please log in again.');
            navigate({ to: '/staff' });
          }
        } catch (e) {
          localStorage.removeItem(STAFF_AUTH_KEY);
          setIsAuthenticated(false);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [navigate]);

  const login = useCallback(async (userId: string, password: string) => {
    setIsLoggingIn(true);
    setError(null);

    try {
      // Step 1: Ensure we have a non-anonymous identity
      if (!identity) {
        console.log('[useStaffAuth] No identity found, requesting Internet Identity authentication...');
        try {
          await iiLogin();
          
          // Wait for the actor to be recreated with the new identity
          console.log('[useStaffAuth] Waiting for actor to be ready with new identity...');
          
          let attempts = 0;
          const maxAttempts = 20; // 10 seconds max
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (actor && !actorFetching) {
              console.log('[useStaffAuth] Actor is ready, proceeding with staff authentication');
              break;
            }
            attempts++;
          }
          
          if (attempts >= maxAttempts) {
            throw new Error('Authentication timeout. Please try again.');
          }
        } catch (iiError) {
          console.error('[useStaffAuth] Internet Identity login failed:', iiError);
          setError('Authentication required. Please allow the authentication prompt to continue.');
          setIsLoggingIn(false);
          return false;
        }
      }

      // Step 2: Wait for actor to be ready if it's still fetching
      if (!actor || actorFetching) {
        console.log('[useStaffAuth] Waiting for actor to be ready...');
        let attempts = 0;
        const maxAttempts = 20;
        while (attempts < maxAttempts && (!actor || actorFetching)) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        
        if (!actor) {
          setError('System not ready. Please try again.');
          setIsLoggingIn(false);
          return false;
        }
      }

      // Step 3: Authenticate with username/password
      console.log('[useStaffAuth] Attempting staff authentication with userId:', userId);
      const result = await actor.authenticateStaff({ userId, password });
      
      console.log('[useStaffAuth] Authentication result:', result);
      
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
        
        // Redirect to staff appointments page
        console.log('[useStaffAuth] Authentication successful, redirecting to /staff');
        navigate({ to: '/staff' });
        
        return true;
      } else {
        setError('Invalid user ID or password. Please check your credentials and try again.');
        return false;
      }
    } catch (err) {
      console.error('[useStaffAuth] Login error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorMessage.includes('timeout')) {
        setError('Authentication timeout. Please try again.');
      } else if (errorMessage.includes('Anonymous') || errorMessage.includes('anonymous')) {
        setError('Authentication required. Please allow the authentication prompt and try again.');
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('permission')) {
        setError('Invalid user ID or password. Please check your credentials and try again.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  }, [actor, actorFetching, identity, iiLogin, queryClient, navigate]);

  const logout = useCallback(async () => {
    try {
      // Call backend logout to clear server-side session
      if (actor) {
        await actor.logoutStaff();
      }
    } catch (err) {
      console.error('[useStaffAuth] Logout error:', err);
    } finally {
      // Always clear local state regardless of backend call result
      localStorage.removeItem(STAFF_AUTH_KEY);
      setIsAuthenticated(false);
      setError(null);
      
      // Clear all cached queries
      queryClient.clear();
      
      // Navigate back to home page
      navigate({ to: '/' });
    }
  }, [actor, queryClient, navigate]);

  return {
    isAuthenticated,
    isLoggingIn: isLoggingIn || loginStatus === 'logging-in',
    error,
    login,
    logout,
  };
}
