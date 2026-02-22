import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Fingerprint, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLoginPage() {
  const { login, loginStatus, identity, isLoginError } = useInternetIdentity();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Redirect to admin dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/admin-dashboard' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Admin login error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="border-2 bg-card/90 backdrop-blur shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-vijaya-cyan-500 to-vijaya-blue-500 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl">Admin Portal</CardTitle>
          <CardDescription className="text-lg">
            Vijaya Children's Clinic - Secure Administrator Access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Fingerprint className="w-4 h-4 text-vijaya-cyan-600" />
              <span>Biometric Authentication</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Use your fingerprint, face ID, or security key to securely access the admin dashboard.
            </p>
          </div>

          {isLoginError && (
            <Alert variant="destructive">
              <AlertDescription>
                Authentication failed. Please try again or contact support if the issue persists.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full h-12 text-lg bg-gradient-to-r from-vijaya-cyan-500 to-vijaya-blue-500 hover:from-vijaya-cyan-600 hover:to-vijaya-blue-600"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Fingerprint className="mr-2 h-5 w-5" />
                Login with Biometric
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Powered by Internet Identity</p>
            <p className="mt-1">Secure, private, and decentralized authentication</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
