import { Badge } from '@/components/ui/badge';
import { AppointmentStatus } from '../backend';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

export default function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.pending:
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case AppointmentStatus.confirmed:
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case AppointmentStatus.completed:
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case AppointmentStatus.cancelled:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge variant="outline" className={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
