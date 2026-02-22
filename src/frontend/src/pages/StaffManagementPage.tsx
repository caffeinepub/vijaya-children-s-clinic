import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole, useGetCallerUserProfile } from '../hooks/useQueries';
import { useGetAllStaff, useDeleteStaff } from '../hooks/useStaffManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search, Edit, Trash2, LogOut, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserRole, ActivationStatus } from '../backend';
import AddStaffModal from '../components/AddStaffModal';
import EditStaffModal from '../components/EditStaffModal';
import ProfileSetupModal from '../components/ProfileSetupModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function StaffManagementPage() {
  const { clear, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: staffList, isLoading: staffLoading } = useGetAllStaff();
  const deleteStaff = useDeleteStaff();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const isAdmin = userRole === UserRole.admin;

  const handleLogout = async () => {
    await clear();
    navigate({ to: '/admin-login' });
  };

  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Filter staff by search query
  const filteredStaff = useMemo(() => {
    if (!staffList) return [];
    if (!searchQuery.trim()) return staffList;

    const query = searchQuery.toLowerCase();
    return staffList.filter(
      (staff) =>
        staff.userId.toLowerCase().includes(query) ||
        staff.email?.toLowerCase().includes(query)
    );
  }, [staffList, searchQuery]);

  const handleDelete = async () => {
    if (!deletingStaff) return;
    
    try {
      await deleteStaff.mutateAsync(deletingStaff);
      setDeletingStaff(null);
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  // Show loading state
  if (profileLoading || roleLoading || staffLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading staff management...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAuthenticated || !isAdmin) {
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
                This area is restricted to administrators only. Please log in with an administrator account.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate({ to: '/admin-login' })}>
                Admin Login
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

  const staffToEdit = editingStaff ? staffList?.find((s) => s.userId === editingStaff) : null;
  const staffToDelete = deletingStaff ? staffList?.find((s) => s.userId === deletingStaff) : null;

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/admin-dashboard' })}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Staff Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage staff accounts and access permissions
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>

        <Card className="border-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Staff Accounts</CardTitle>
                <CardDescription>
                  {filteredStaff.length} {filteredStaff.length === 1 ? 'account' : 'accounts'} found
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-vijaya-cyan-500 to-vijaya-blue-500 hover:from-vijaya-cyan-600 hover:to-vijaya-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user ID or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Staff Table */}
            {filteredStaff.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {searchQuery ? 'No staff found matching your search' : 'No staff accounts yet'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowAddModal(true)} variant="outline" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Staff Account
                  </Button>
                )}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff) => (
                      <TableRow key={staff.userId}>
                        <TableCell className="font-medium">{staff.userId}</TableCell>
                        <TableCell>{staff.email || <span className="text-muted-foreground italic">No email</span>}</TableCell>
                        <TableCell>
                          <Badge variant={staff.status === ActivationStatus.activated ? 'default' : 'secondary'}>
                            {staff.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingStaff(staff.userId)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingStaff(staff.userId)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <AddStaffModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Staff Modal */}
      {editingStaff && staffToEdit && (
        <EditStaffModal
          open={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          staff={staffToEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingStaff} onOpenChange={(open) => !open && setDeletingStaff(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the staff account for <strong>{staffToDelete?.userId}</strong>? This action will mark the account as deleted and revoke all access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteStaff.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteStaff.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
