import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListAppointments, useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, Phone, Mail, User, Baby } from 'lucide-react';
import LoginButton from '../components/LoginButton';

export default function StaffAppointmentsPage() {
  const { identity } = useInternetIdentity();
  const { data: appointments, isLoading, error } = useListAppointments();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

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

  if (profileLoading || isLoading) {
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-2 border-destructive bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view appointments. Only authorized clinic staff can access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginButton />
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Appointment Requests</h1>
          <p className="text-lg text-muted-foreground">
            {userProfile ? `Welcome, ${userProfile.name}` : 'Vijaya Children\'s Clinic Staff Portal'}
          </p>
        </div>
        <LoginButton />
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
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="text-base px-4 py-2">
              {appointments.length} {appointments.length === 1 ? 'Request' : 'Requests'}
            </Badge>
          </div>

          <div className="hidden md:block">
            <Card className="bg-card/90 backdrop-blur">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parent/Guardian</TableHead>
                    <TableHead>Child</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Preferred Date/Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment, index) => (
                    <TableRow key={index}>
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
                          {appointment.reason || <span className="text-muted-foreground italic">No reason provided</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatSubmissionTime(appointment.submissionTime)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="md:hidden space-y-4">
            {appointments.map((appointment, index) => (
              <Card key={index} className="bg-card/90 backdrop-blur">
                <CardHeader>
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
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Submitted: {formatSubmissionTime(appointment.submissionTime)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
