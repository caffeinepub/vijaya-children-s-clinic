import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff, Info } from 'lucide-react';
import { useStaffAuth } from '../hooks/useStaffAuth';

export default function StaffLoginForm() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn, error } = useStaffAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(userId, password);
    if (success) {
      // Clear form on successful login
      setUserId('');
      setPassword('');
    }
  };

  // Check if error indicates no staff users exist
  const isNoStaffError = error?.includes('Invalid user ID or password');

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="border-2 bg-card/90 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl">Vijaya Children's Clinic</CardTitle>
          <CardDescription className="text-lg">
            Staff Portal - Please sign in to access appointment management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your user ID"
                disabled={isLoggingIn}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoggingIn}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoggingIn}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {isNoStaffError && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>First Time Setup Required</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p>No staff accounts have been created yet. To set up staff access:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
                    <li>An administrator must log in using Internet Identity</li>
                    <li>Navigate to the Staff Management page</li>
                    <li>Create a staff account with a User ID and Password</li>
                    <li>Return here and log in with those credentials</li>
                  </ol>
                  <p className="text-sm mt-2">
                    Contact your system administrator if you need assistance.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
