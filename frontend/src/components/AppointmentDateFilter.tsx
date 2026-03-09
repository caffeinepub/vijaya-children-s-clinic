import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import type { DateFilter } from '../utils/dateFilters';

interface AppointmentDateFilterProps {
  currentFilter: DateFilter;
  onFilterChange: (filter: DateFilter) => void;
}

export default function AppointmentDateFilter({ currentFilter, onFilterChange }: AppointmentDateFilterProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handlePresetFilter = (type: 'today' | 'week' | 'month') => {
    onFilterChange({ type });
  };

  const handleCustomRange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onFilterChange({
        type: 'custom',
        startDate: range.from,
        endDate: range.to,
      });
    }
  };

  const handleClearFilters = () => {
    setDateRange(undefined);
    onFilterChange({ type: 'all' });
  };

  const isActive = currentFilter.type !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant={currentFilter.type === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePresetFilter('today')}
        >
          Today
        </Button>
        <Button
          variant={currentFilter.type === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePresetFilter('week')}
        >
          This Week
        </Button>
        <Button
          variant={currentFilter.type === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePresetFilter('month')}
        >
          This Month
        </Button>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant={currentFilter.type === 'custom' ? 'default' : 'outline'} size="sm">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Custom Range
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleCustomRange}
            numberOfMonths={2}
            className="rounded-md"
          />
        </PopoverContent>
      </Popover>

      {isActive && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          <X className="w-4 h-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
