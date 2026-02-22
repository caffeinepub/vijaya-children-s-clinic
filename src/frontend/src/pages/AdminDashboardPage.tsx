import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetCallerUserRole } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, LogOut, Shield, UserCog } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserRole } from '../backend';
import ProfileSetupModal from '../components/ProfileSetupModal';

export default function AdminDashboardPage() {
  const { clear, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();

  const isAuthenticated = !!identity;
  const isAdmin = userRole === UserRole.admin;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/admin-login' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await clear();
    navigate({ to: '/admin-login' });
  };

  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Show loading state
  if (profileLoading || roleLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-2 border-destructive bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You do not have administrator privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Unauthorized Access</AlertTitle>
              <AlertDescription>
                This area is restricted to administrators only. Please contact your system administrator if you believe you should have access.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: '/' })}>
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, {userProfile?.name || 'Administrator'}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Staff Management Card */}
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer group" onClick={() => navigate({ to: '/staff-management' })}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vijaya-cyan-500 to-vijaya-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">Staff Management</CardTitle>
              <CardDescription className="text-base">
                Add, edit, or remove staff accounts and manage access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default">
                <UserCog className="mr-2 h-4 w-4" />
                Manage Staff
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vijaya-green-500 to-vijaya-cyan-500 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">System Status</CardTitle>
              <CardDescription className="text-base">
                Your admin account is active and secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Authentication</span>
                <span className="text-sm text-green-600 font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Role</span>
                <span className="text-sm text-vijaya-blue-600 font-semibold">Administrator</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
