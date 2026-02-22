import { useState, useMemo, useEffect } from 'react';
import { useStaffAuth } from '../hooks/useStaffAuth';
import {
  useListAppointments,
  useUpdateAppointmentStatus,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, Phone, Mail, User, Baby, AlertCircle, LogOut } from 'lucide-react';
import StaffLoginForm from '../components/StaffLoginForm';
import AppointmentDateFilter from '../components/AppointmentDateFilter';
import AppointmentSearchBar from '../components/AppointmentSearchBar';
import AppointmentStatusBadge from '../components/AppointmentStatusBadge';
import AppointmentStatusDropdown from '../components/AppointmentStatusDropdown';
import { filterAppointmentsByDate, type DateFilter } from '../utils/dateFilters';
import { filterAppointmentsBySearch } from '../utils/searchFilter';
import { AppointmentStatus } from '../backend';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StaffAppointmentsPage() {
  const { isAuthenticated, logout, isLoggingIn } = useStaffAuth();
  const { data: appointments, isLoading: appointmentsLoading, error: appointmentsError } = useListAppointments();
  const updateStatus = useUpdateAppointmentStatus();

  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'all' });
  const [searchQuery, setSearchQuery] = useState('');

  // Log authentication and data loading state
  useEffect(() => {
    console.log('[StaffAppointmentsPage] Component state:', {
      isAuthenticated,
      isLoggingIn,
      appointmentsLoading,
      appointmentsError: appointmentsError?.toString(),
      appointmentsCount: appointments?.length,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, isLoggingIn, appointmentsLoading, appointmentsError, appointments]);

  // Apply filters
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    
    let filtered = [...appointments];
    
    // Apply date filter
    filtered = filterAppointmentsByDate(filtered, dateFilter);
    
    // Apply search filter
    filtered = filterAppointmentsBySearch(filtered, searchQuery);
    
    return filtered;
  }, [appointments, dateFilter, searchQuery]);

  // Show login form if not authenticated and not currently logging in
  if (!isAuthenticated) {
    return <StaffLoginForm />;
  }

  // Show loading state while checking authentication or loading appointments
  if (isLoggingIn || appointmentsLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">
              {isLoggingIn ? 'Authenticating...' : 'Loading appointments...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (appointmentsError) {
    const errorMessage = appointmentsError instanceof Error ? appointmentsError.message : String(appointmentsError);
    const isAuthError = errorMessage.includes('Unauthorized') || errorMessage.includes('permission');

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-2 border-destructive bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Error Loading Appointments
            </CardTitle>
            <CardDescription>
              {isAuthError ? (
                <>
                  You don't have permission to view appointments. Please log in again with valid staff credentials.
                </>
              ) : (
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
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
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
            Vijaya Children's Clinic Staff Portal
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
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
                        <TableCell className="max-w-xs">
                          <p className="text-sm line-clamp-2">{appointment.reason}</p>
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

          {/* Mobile view */}
          <div className="md:hidden space-y-4">
            {filteredAppointments.map((appointment, index) => {
              const originalIndex = appointments?.indexOf(appointment) ?? index;
              return (
                <Card key={index} className="bg-card/90 backdrop-blur">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{appointment.parentName}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Baby className="w-3 h-3" />
                          {appointment.childName}, {Number(appointment.childAge)} years
                        </CardDescription>
                      </div>
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${appointment.phoneNumber}`} className="hover:underline">
                          {appointment.phoneNumber}
                        </a>
                      </div>
                      {appointment.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <a href={`mailto:${appointment.email}`} className="hover:underline text-muted-foreground">
                            {appointment.email}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{formatDate(appointment.preferredDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.preferredTime}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Reason for visit:</p>
                      <p className="text-sm">{appointment.reason}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Submitted: {formatSubmissionTime(appointment.submissionTime)}
                    </div>
                    <div className="pt-2">
                      <AppointmentStatusDropdown
                        currentStatus={appointment.status}
                        appointmentIndex={originalIndex}
                        onStatusChange={handleStatusChange}
                      />
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
