"use client";

import { useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '../button';
import { Calendar } from '../calendar';
import { Input } from '../input';
import * as PopoverUI from '../popover';
import { cn } from '../utils';

interface DateRangePickerProps {
  startValue?: string;
  endValue?: string;
  onChange: (values: { startsAt: string; endsAt: string }) => void;
  disabled?: boolean;
  hasError?: boolean;
  placeholder?: string;
}

function parseDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function parseTime(value?: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  const [, timePart = fallback] = value.split('T');
  return timePart.slice(0, 5) || fallback;
}

function toDateString(date: Date, time: string) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T${time}`;
}

function formatDisplay(startValue?: string, endValue?: string) {
  const start = parseDate(startValue);
  const end = parseDate(endValue);

  if (!start) {
    return '';
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (!end) {
    return formatter.format(start);
  }

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function DateRangePicker({
  startValue,
  endValue,
  onChange,
  disabled = false,
  hasError = false,
  placeholder = 'Pick start and end date',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo<DateRange | undefined>(() => {
    const from = parseDate(startValue);
    const to = parseDate(endValue);

    if (!from) {
      return undefined;
    }

    return { from, to };
  }, [startValue, endValue]);
  const displayValue = useMemo(() => formatDisplay(startValue, endValue), [startValue, endValue]);
  const startTime = useMemo(() => parseTime(startValue, '00:00'), [startValue]);
  const endTime = useMemo(() => parseTime(endValue, '23:59'), [endValue]);

  const handleDayClick = (day: Date) => {
    if (disabled) {
      return;
    }

    if (!selected?.from || (selected.from && selected.to)) {
      onChange({
        startsAt: toDateString(day, startTime),
        endsAt: '',
      });
      return;
    }

    if (day < selected.from) {
      onChange({
        startsAt: toDateString(day, startTime),
        endsAt: toDateString(selected.from, endTime),
      });
      return;
    }

    onChange({
      startsAt: toDateString(selected.from, startTime),
      endsAt: toDateString(day, endTime),
    });
  };

  return (
    <PopoverUI.Popover open={open} onOpenChange={setOpen}>
      <PopoverUI.PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-auto w-full justify-between rounded-xl border border-black/10 bg-[#F7F4EC] px-4 py-3 text-left font-["Outfit"] text-sm font-normal text-[#04090C] shadow-none hover:bg-[#F7F4EC]',
            !displayValue && 'text-black/40',
            disabled && 'cursor-default opacity-80',
            hasError && 'border-red-500',
          )}
        >
          <span className="truncate">{displayValue || placeholder}</span>
          <Icons.CalendarDays className="size-4 text-black/50" />
        </Button>
      </PopoverUI.PopoverTrigger>
      <PopoverUI.PopoverContent align="start" className="w-auto border-black/10 bg-[#F7F4EC] p-0">
        <div className="border-b border-black/10 p-2">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={selected}
            onDayClick={handleDayClick}
            disabled={disabled}
            defaultMonth={selected?.from}
            classNames={{
              months: 'flex flex-col gap-4 sm:flex-row sm:gap-6',
            }}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="block text-xs font-medium text-black/60">Start Time</span>
            <Input
              type="time"
              value={startTime}
              onChange={(event) => {
                if (!selected?.from) {
                  return;
                }

                onChange({
                  startsAt: toDateString(selected.from, event.target.value),
                  endsAt: selected.to ? toDateString(selected.to, endTime) : '',
                });
              }}
              disabled={disabled || !selected?.from}
              tone="inverse"
            />
          </div>
          <div className="space-y-2">
            <span className="block text-xs font-medium text-black/60">End Time</span>
            <Input
              type="time"
              value={endTime}
              onChange={(event) => {
                if (!selected?.to) {
                  return;
                }

                onChange({
                  startsAt: toDateString(selected.from as Date, startTime),
                  endsAt: toDateString(selected.to, event.target.value),
                });
              }}
              disabled={disabled || !selected?.to}
              tone="inverse"
            />
          </div>
        </div>
      </PopoverUI.PopoverContent>
    </PopoverUI.Popover>
  );
}
