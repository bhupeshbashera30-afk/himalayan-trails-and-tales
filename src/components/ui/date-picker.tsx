import React, { useRef } from 'react';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: string;           // stored as YYYY-MM-DD
  onChange: (value: string) => void;
  min?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  required,
  className,
  id,
}) => {
  const nativeRef = useRef<HTMLInputElement>(null);

  // Convert YYYY-MM-DD → DD/MM/YYYY for display
  const display = value
    ? value.split('-').reverse().join('/')
    : '';

  const openPicker = () => {
    const el = nativeRef.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      el.focus();
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-center w-full border border-input rounded-md bg-background text-sm ring-offset-background',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
    >
      {/* Display area — shows DD/MM/YYYY */}
      <span
        onClick={openPicker}
        className={cn(
          'flex-1 px-3 py-2 cursor-pointer select-none min-h-[40px] flex items-center',
          !value && 'text-muted-foreground'
        )}
      >
        {display || 'dd/mm/yyyy'}
      </span>

      {/* Calendar icon */}
      <CalendarIcon
        className="w-4 h-4 mx-3 text-muted-foreground cursor-pointer flex-shrink-0"
        onClick={openPicker}
      />

      {/* Invisible native date input — positioned over the icon to trigger showPicker */}
      <input
        ref={nativeRef}
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        required={required}
        tabIndex={-1}
        className="absolute right-0 top-0 h-full w-10 opacity-0 cursor-pointer"
        style={{ zIndex: 1 }}
      />
    </div>
  );
};
