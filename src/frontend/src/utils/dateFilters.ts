import type { AppointmentRequest } from '../backend';

export type DateFilterType = 'all' | 'today' | 'week' | 'month' | 'custom';

export interface DateFilter {
  type: DateFilterType;
  startDate?: Date;
  endDate?: Date;
}

export function bigintToDate(timestamp: bigint): Date {
  return new Date(Number(timestamp) / 1_000_000);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isWithinRange(date: Date, startDate: Date, endDate: Date): boolean {
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return dateOnly >= startOnly && dateOnly <= endOnly;
}

export function getTodayRange(): { start: Date; end: Date } {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  return { start, end };
}

export function getWeekRange(): { start: Date; end: Date } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export function getMonthRange(): { start: Date; end: Date } {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

export function filterAppointmentsByDate(
  appointments: AppointmentRequest[],
  filter: DateFilter
): AppointmentRequest[] {
  if (filter.type === 'all') {
    return appointments;
  }

  return appointments.filter((appointment) => {
    const appointmentDate = bigintToDate(appointment.preferredDate);

    switch (filter.type) {
      case 'today': {
        const { start } = getTodayRange();
        return isSameDay(appointmentDate, start);
      }
      case 'week': {
        const { start, end } = getWeekRange();
        return isWithinRange(appointmentDate, start, end);
      }
      case 'month': {
        const { start, end } = getMonthRange();
        return isWithinRange(appointmentDate, start, end);
      }
      case 'custom': {
        if (filter.startDate && filter.endDate) {
          return isWithinRange(appointmentDate, filter.startDate, filter.endDate);
        }
        return true;
      }
      default:
        return true;
    }
  });
}
