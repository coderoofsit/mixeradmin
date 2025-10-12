import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void; // Returns ISO date string
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string; // ISO date string
  maxDate?: string; // ISO date string
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  required = false,
  disabled = false,
  minDate,
  maxDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [dropdownAlignment, setDropdownAlignment] = useState<'left' | 'right'>('left');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert ISO date to MM-DD-YYYY format for display (UTC)
  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return "";
    // Parse as UTC to avoid timezone issues
    const [year, month, day] = isoDate.split('-');
    if (year && month && day) {
      return `${month}-${day}-${year}`;
    }
    return "";
  };

  // Convert MM-DD-YYYY to ISO date (UTC)
  const parseDisplayDate = (displayDate: string): string => {
    if (!displayDate) return "";
    const [month, day, year] = displayDate.split('-');
    if (month && day && year) {
      // Create ISO date string directly to avoid timezone issues
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return "";
  };

  // Initialize display value and selected date
  useEffect(() => {
    if (value) {
      setDisplayValue(formatDateForDisplay(value));
      // Create date in UTC to avoid timezone issues
      const [year, month, day] = value.split('-');
      if (year && month && day) {
        const utcDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
        setSelectedDate(utcDate);
        setCurrentMonth(utcDate);
      }
    } else {
      setDisplayValue("");
      setSelectedDate(null);
    }
  }, [value]);

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    // Validate and convert if complete date is entered
    if (inputValue.length === 10 && inputValue.includes('-')) {
      const isoDate = parseDisplayDate(inputValue);
      if (isoDate) {
        // Validate the date by parsing it
        const [year, month, day] = isoDate.split('-');
        const testDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
        if (testDate.getUTCFullYear() === parseInt(year) && 
            testDate.getUTCMonth() === parseInt(month) - 1 && 
            testDate.getUTCDate() === parseInt(day)) {
          onChange(isoDate);
          setSelectedDate(testDate);
          setCurrentMonth(testDate);
        }
      }
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    // Convert UTC date to ISO string to avoid timezone issues
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;
    
    setSelectedDate(date);
    setDisplayValue(formatDateForDisplay(isoDate));
    onChange(isoDate);
    setIsOpen(false);
  };

  // Check if date is disabled
  const isDateDisabled = (date: Date): boolean => {
    if (minDate) {
      const [minYear, minMonth, minDay] = minDate.split('-');
      const minDateUTC = new Date(Date.UTC(parseInt(minYear), parseInt(minMonth) - 1, parseInt(minDay)));
      if (date < minDateUTC) return true;
    }
    if (maxDate) {
      const [maxYear, maxMonth, maxDay] = maxDate.split('-');
      const maxDateUTC = new Date(Date.UTC(parseInt(maxYear), parseInt(maxMonth) - 1, parseInt(maxDay)));
      if (date > maxDateUTC) return true;
    }
    return false;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getUTCFullYear();
    const month = currentMonth.getUTCMonth();
    
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const startDate = new Date(Date.UTC(year, month, 1 - firstDay.getUTCDay()));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(currentDate);
      const isCurrentMonth = date.getUTCMonth() === month;
      const isToday = date.getUTCFullYear() === new Date().getUTCFullYear() &&
                     date.getUTCMonth() === new Date().getUTCMonth() &&
                     date.getUTCDate() === new Date().getUTCDate();
      const isSelected = selectedDate && 
                        date.getUTCFullYear() === selectedDate.getUTCFullYear() &&
                        date.getUTCMonth() === selectedDate.getUTCMonth() &&
                        date.getUTCDate() === selectedDate.getUTCDate();
      const isDisabled = isDateDisabled(date);
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        isDisabled
      });
      
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    return days;
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setUTCMonth(newMonth.getUTCMonth() - 1);
      } else {
        newMonth.setUTCMonth(newMonth.getUTCMonth() + 1);
      }
      return newMonth;
    });
  };

  // Calculate dropdown position based on available space
  const calculateDropdownPosition = (): { position: 'bottom' | 'top'; alignment: 'left' | 'right' } => {
    if (!inputRef.current) return { position: 'bottom', alignment: 'left' };
    
    const inputRect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dropdownHeight = 400; // Approximate height of the dropdown
    const dropdownWidth = 280; // Approximate width of the dropdown
    
    // Check vertical positioning
    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
    let position: 'bottom' | 'top' = 'bottom';
    
    // If there's more space above and not enough below, position above
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      position = 'top';
    }
    
    // Check horizontal positioning
    const spaceRight = viewportWidth - inputRect.left;
    const spaceLeft = inputRect.right;
    let alignment: 'left' | 'right' = 'left';
    
    // If there's not enough space on the right, align to the right
    if (spaceRight < dropdownWidth && spaceLeft > spaceRight) {
      alignment = 'right';
    }
    
    return { position, alignment };
  };

  // Handle opening dropdown with smart positioning
  const handleOpenDropdown = () => {
    const { position, alignment } = calculateDropdownPosition();
    setDropdownPosition(position);
    setDropdownAlignment(alignment);
    setIsOpen(true);
  };

  // Close dropdown when clicking outside and handle window resize
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen) {
        const { position, alignment } = calculateDropdownPosition();
        setDropdownPosition(position);
        setDropdownAlignment(alignment);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`relative ${className} p-0 border-0 border-none`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleOpenDropdown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="input w-full pr-10"
          style={{ height: 'auto', minHeight: 'auto' }}
        />
        <button
          type="button"
          onClick={handleOpenDropdown}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-var(--text-muted) hover:text-var(--text-primary) transition-colors p-0 m-0 border-0 bg-transparent cursor-pointer"
          style={{ height: 'auto', width: 'auto', minHeight: 'auto', minWidth: 'auto' }}
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className={`absolute bg-white border border-var(--border) rounded-lg shadow-lg z-50 p-4 min-w-[280px] ${
          dropdownPosition === 'top' 
            ? 'bottom-full mb-1' 
            : 'top-full mt-1'
        } ${
          dropdownAlignment === 'right' 
            ? 'right-0' 
            : 'left-0'
        }`}>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-var(--bg-secondary) rounded transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="font-semibold text-var(--text-primary)">
              {monthNames[currentMonth.getUTCMonth()]} {currentMonth.getUTCFullYear()}
            </h3>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-var(--bg-secondary) rounded transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-var(--text-muted) py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => !day.isDisabled && handleDateSelect(day.date)}
                disabled={day.isDisabled}
                className={`
                  w-8 h-8 text-sm rounded transition-colors
                  ${!day.isCurrentMonth ? 'text-var(--text-muted)' : 'text-var(--text-primary)'}
                  ${day.isToday ? 'bg-var(--primary) text-white font-semibold' : ''}
                  ${day.isSelected ? 'bg-var(--primary) text-white font-semibold' : ''}
                  ${!day.isSelected && !day.isToday && day.isCurrentMonth ? 'hover:bg-var(--bg-secondary)' : ''}
                  ${day.isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-3 border-t border-var(--border) flex justify-between">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
                handleDateSelect(utcToday);
              }}
              className="text-sm text-var(--primary) hover:text-var(--primary-dark) transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm text-var(--text-muted) hover:text-var(--text-primary) transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
