import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Baby,
  Calendar,
  Clock,
  Loader2,
  LogOut,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { AppointmentStatus } from "../backend";
import AppointmentDateFilter from "../components/AppointmentDateFilter";
import AppointmentSearchBar from "../components/AppointmentSearchBar";
import AppointmentStatusBadge from "../components/AppointmentStatusBadge";
import AppointmentStatusDropdown from "../components/AppointmentStatusDropdown";
import StaffLoginForm from "../components/StaffLoginForm";
import {
  useListAppointments,
  useUpdateAppointmentStatus,
} from "../hooks/useQueries";
import { useStaffAuth } from "../hooks/useStaffAuth";
import {
  type DateFilter,
  filterAppointmentsByDate,
} from "../utils/dateFilters";
import { filterAppointmentsBySearch } from "../utils/searchFilter";

export default function StaffAppointmentsPage() {
  // Single auth instance — passed down to login form as props
  const { isAuthenticated, login, isLoggingIn, error, logout } = useStaffAuth();
  const {
    data: appointments,
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useListAppointments();
  const updateStatus = useUpdateAppointmentStatus();

  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: "all" });
  const [searchQuery, setSearchQuery] = useState("");

  // Apply filters
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    let filtered = [...appointments];
    filtered = filterAppointmentsByDate(filtered, dateFilter);
    filtered = filterAppointmentsBySearch(filtered, searchQuery);
    return filtered;
  }, [appointments, dateFilter, searchQuery]);

  const handleLogout = async () => {
    await logout();
  };

  // Show login form if not authenticated — pass auth props to avoid dual-instance bug
  if (!isAuthenticated) {
    return (
      <StaffLoginForm login={login} isLoggingIn={isLoggingIn} error={error} />
    );
  }

  // Show loading state while loading appointments
  if (appointmentsLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (appointmentsError) {
    const errorMessage =
      appointmentsError instanceof Error
        ? appointmentsError.message
        : String(appointmentsError);
    const isAuthError =
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("permission");

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-2 border-destructive bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Error Loading Appointments
            </CardTitle>
            <CardDescription>
              {isAuthError
                ? "Authentication issue detected"
                : "Unable to load appointment data"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="mt-2">
                {errorMessage}
              </AlertDescription>
            </Alert>
            {isAuthError && (
              <Alert>
                <AlertTitle>Session Expired</AlertTitle>
                <AlertDescription>
                  Your session may have expired. Please log out and log in
                  again.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusChange = async (
    index: number,
    newStatus: AppointmentStatus,
  ) => {
    await updateStatus.mutateAsync({ index: BigInt(index), status: newStatus });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Staff Portal
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage appointments for Vijaya Children's Clinic
          </p>
        </div>
        <Button
          data-ocid="staff.secondary_button"
          variant="outline"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-2">
        <CardHeader>
          <CardTitle>Filter Appointments</CardTitle>
          <CardDescription>
            Search and filter appointments by date or patient information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AppointmentSearchBar value={searchQuery} onChange={setSearchQuery} />
          <AppointmentDateFilter
            currentFilter={dateFilter}
            onFilterChange={setDateFilter}
          />
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Appointments ({filteredAppointments.length})</span>
            <Badge variant="outline" className="text-sm">
              Total: {appointments?.length || 0}
            </Badge>
          </CardTitle>
          <CardDescription>
            View and manage all appointment requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div
              data-ocid="staff.appointments.empty_state"
              className="text-center py-12"
            >
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No appointments found
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || dateFilter.type !== "all"
                  ? "Try adjusting your filters"
                  : "Appointments will appear here once patients book"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="staff.appointments.table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Patient Info</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Appointment</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment, index) => {
                    const originalIndex =
                      appointments?.findIndex(
                        (a) =>
                          a.parentName === appointment.parentName &&
                          a.childName === appointment.childName &&
                          a.phoneNumber === appointment.phoneNumber &&
                          a.preferredDate === appointment.preferredDate &&
                          a.preferredTime === appointment.preferredTime,
                      ) ?? index;

                    // preferredDate is stored as nanoseconds — divide by 1_000_000n to get milliseconds
                    const appointmentDate = new Date(
                      Number(appointment.preferredDate / 1_000_000n),
                    );

                    return (
                      <TableRow key={`${appointment.phoneNumber}-${index}`}>
                        <TableCell className="font-medium">
                          {originalIndex + 1}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {appointment.parentName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Baby className="h-4 w-4" />
                              <span>
                                {appointment.childName} ({appointment.childAge}{" "}
                                years)
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={`tel:${appointment.phoneNumber}`}
                                className="hover:underline"
                              >
                                {appointment.phoneNumber}
                              </a>
                            </div>
                            {appointment.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <a
                                  href={`mailto:${appointment.email}`}
                                  className="hover:underline"
                                >
                                  {appointment.email}
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {appointmentDate.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.preferredTime}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm line-clamp-2">
                            {appointment.reason}
                          </p>
                        </TableCell>
                        <TableCell>
                          <AppointmentStatusBadge status={appointment.status} />
                        </TableCell>
                        <TableCell className="text-right">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
