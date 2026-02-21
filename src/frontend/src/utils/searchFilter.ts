import type { AppointmentRequest } from '../backend';

export function filterAppointmentsBySearch(
  appointments: AppointmentRequest[],
  searchQuery: string
): AppointmentRequest[] {
  if (!searchQuery.trim()) {
    return appointments;
  }

  const query = searchQuery.toLowerCase().trim();

  return appointments.filter((appointment) => {
    const parentName = appointment.parentName.toLowerCase();
    const childName = appointment.childName.toLowerCase();
    const phoneNumber = appointment.phoneNumber.toLowerCase();

    return (
      parentName.includes(query) ||
      childName.includes(query) ||
      phoneNumber.includes(query)
    );
  });
}
