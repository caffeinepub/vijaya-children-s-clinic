import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppointmentStatus } from '../backend';

interface AppointmentStatusDropdownProps {
  currentStatus: AppointmentStatus;
  appointmentIndex: number;
  onStatusChange: (index: number, status: AppointmentStatus) => void;
}

export default function AppointmentStatusDropdown({
  currentStatus,
  appointmentIndex,
  onStatusChange,
}: AppointmentStatusDropdownProps) {
  const statusOptions = [
    { value: AppointmentStatus.pending, label: 'Pending' },
    { value: AppointmentStatus.confirmed, label: 'Confirmed' },
    { value: AppointmentStatus.completed, label: 'Completed' },
    { value: AppointmentStatus.cancelled, label: 'Cancelled' },
  ];

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => onStatusChange(appointmentIndex, value as AppointmentStatus)}
    >
      <SelectTrigger className="w-full sm:w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
