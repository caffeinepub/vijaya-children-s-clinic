import { useState, useMemo, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useListAppointments,
  useGetCallerUserProfile,
  useGetCallerUserRole,
  useUpdateAppointmentStatus,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, Phone, Mail, User, Baby, AlertCircle } from 'lucide-react';
import LoginButton from '../components/LoginButton';
import AppointmentDateFilter from '../components/AppointmentDateFilter';
import AppointmentSearchBar from '../components/AppointmentSearchBar';
import AppointmentStatusBadge from '../components/AppointmentStatusBadge';
import AppointmentStatusDropdown from '../components/AppointmentStatusDropdown';
import { filterAppointmentsByDate, type DateFilter } from '../utils/dateFilters';
import { filterAppointmentsBySearch } from '../utils/searchFilter';
import { UserRole, AppointmentStatus } from '../backend';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StaffAppointmentsPage() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: appointments, isLoading: appointmentsLoading, error: appointmentsError, isFetched: appointmentsFetched } = useListAppointments();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: userRole, isLoading: roleLoading, isFetched: roleFetched } = useGetCallerUserRole();
  const updateStatus = useUpdateAppointmentStatus();

  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'all' });
  const [searchQuery, setSearchQuery] = useState('');

  const isAuthenticated = !!identity;

  // Log authentication and data loading state
  useEffect(() => {
    console.log('[StaffAppointmentsPage] Component state:', {
      isAuthenticated,
      loginStatus,
      identityPresent: !!identity,
      identityPrincipal: identity?.getPrincipal().toString(),
      appointmentsLoading,
      appointmentsFetched,
      appointmentsError: appointmentsError?.toString(),
      appointmentsCount: appointments?.length,
      profileLoading,
      profileFetched,
      userProfile,
      roleLoading,
      roleFetched,
      userRole,
      timestamp: new Date().toISOString(),
    });
  }, [
    isAuthenticated,
    loginStatus,
    identity,
    appointmentsLoading,
    appointmentsFetched,
    appointmentsError,
    appointments,
    profileLoading,
    profileFetched,
    userProfile,
    roleLoading,
    roleFetched,
    userRole,
  ]);

  // Apply filters - must be called before any conditional returns
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    
    let filtered = [...appointments];
    
    // Apply date filter
    filtered = filterAppointmentsByDate(filtered, dateFilter);
    
    // Apply search filter
    filtered = filterAppointmentsBySearch(filtered, searchQuery);
    
    return filtered;
  }, [appointments, dateFilter, searchQuery]);

  const isLoading = profileLoading || roleLoading || appointmentsLoading;

  // Check if user has admin or user role
  const hasAccess = userRole === UserRole.admin || userRole === UserRole.user;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-2 bg-card/90 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl">Vijaya Children's Clinic - Staff Portal</CardTitle>
            <CardDescription className="text-lg">
              Please sign in to access the appointment management system for DR. K. MANICKAVINAYAGAR's clinic.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <LoginButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading appointments...</p>
            <p className="text-xs text-muted-foreground">
              {appointmentsLoading && 'Fetching appointments...'}
              {profileLoading && 'Loading profile...'}
              {roleLoading && 'Checking permissions...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (roleFetched && !hasAccess) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-2 border-destructive bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view appointments. Only authorized clinic staff can access this page.
              <br />
              <span className="text-xs mt-2 block">Your role: {userRole || 'unknown'}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (appointmentsError) {
    const errorMessage = appointmentsError instanceof Error ? appointmentsError.message : String(appointmentsError);
    const isAuthError = errorMessage.includes('Unauthorized') || errorMessage.includes('permission');
    const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch');

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-2 border-destructive bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Error Loading Appointments
            </CardTitle>
            <CardDescription>
              {isAuthError && (
                <>
                  You don't have permission to view appointments. Please ensure you're logged in with an authorized staff account.
                </>
              )}
              {isNetworkError && (
                <>
                  There was a network error loading the appointments. Please check your connection and try again.
                </>
              )}
              {!isAuthError && !isNetworkError && (
                <>
                  There was an error loading the appointments. Please try refreshing the page or logging in again.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="font-mono text-xs mt-2 break-all">
                {errorMessage}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <LoginButton />
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatSubmissionTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = (index: number, status: AppointmentStatus) => {
    updateStatus.mutate({ index: BigInt(index), status });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Appointment Requests</h1>
          <p className="text-lg text-muted-foreground">
            {userProfile ? `Welcome, ${userProfile.name}` : "Vijaya Children's Clinic Staff Portal"}
          </p>
        </div>
        <LoginButton />
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <AppointmentSearchBar value={searchQuery} onChange={setSearchQuery} />
          <Badge variant="secondary" className="text-base px-4 py-2 whitespace-nowrap">
            {filteredAppointments.length} {filteredAppointments.length === 1 ? 'Result' : 'Results'}
          </Badge>
        </div>
        <AppointmentDateFilter currentFilter={dateFilter} onFilterChange={setDateFilter} />
      </div>

      {!appointments || appointments.length === 0 ? (
        <Card className="bg-card/90 backdrop-blur">
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Appointments Yet</h3>
            <p className="text-muted-foreground">
              There are no appointment requests at the moment. New requests will appear here.
            </p>
          </CardContent>
        </Card>
      ) : filteredAppointments.length === 0 ? (
        <Card className="bg-card/90 backdrop-blur">
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Matching Appointments</h3>
            <p className="text-muted-foreground">
              No appointments match your current filters. Try adjusting your search or date range.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="hidden md:block">
            <Card className="bg-card/90 backdrop-blur">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Parent/Guardian</TableHead>
                    <TableHead>Child</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Preferred Date/Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment, index) => {
                    const originalIndex = appointments?.indexOf(appointment) ?? index;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <AppointmentStatusBadge status={appointment.status} />
                        </TableCell>
                        <TableCell className="font-medium">{appointment.parentName}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{appointment.childName}</div>
                            <div className="text-sm text-muted-foreground">{Number(appointment.childAge)} years</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${appointment.phoneNumber}`} className="hover:underline">
                                {appointment.phoneNumber}
                              </a>
                            </div>
                            {appointment.email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <a href={`mailto:${appointment.email}`} className="hover:underline">
                                  {appointment.email}
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatDate(appointment.preferredDate)}</div>
                            <div className="text-sm text-muted-foreground">{appointment.preferredTime}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm">
                            {appointment.reason || (
                              <span className="text-muted-foreground italic">No reason provided</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatSubmissionTime(appointment.submissionTime)}
                        </TableCell>
                        <TableCell>
                          <AppointmentStatusDropdown
                            currentStatus={appointment.status}
                            appointmentIndex={originalIndex}
                            onStatusChange={handleStatusChange}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="md:hidden space-y-4">
            {filteredAppointments.map((appointment, index) => {
              const originalIndex = appointments?.indexOf(appointment) ?? index;
              return (
                <Card key={index} className="bg-card/90 backdrop-blur">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      {appointment.parentName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Baby className="w-4 h-4" />
                      {appointment.childName} ({Number(appointment.childAge)} years)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <a href={`tel:${appointment.phoneNumber}`} className="hover:underline">
                        {appointment.phoneNumber}
                      </a>
                    </div>
                    {appointment.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${appointment.email}`} className="hover:underline">
                          {appointment.email}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">{formatDate(appointment.preferredDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{appointment.preferredTime}</span>
                    </div>
                    {appointment.reason && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Reason:</p>
                        <p className="text-sm">{appointment.reason}</p>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Update Status:</p>
                      <AppointmentStatusDropdown
                        currentStatus={appointment.status}
                        appointmentIndex={originalIndex}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      Submitted: {formatSubmissionTime(appointment.submissionTime)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
