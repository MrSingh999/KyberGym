import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  setDate: (date?: Date) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Pick a date",
  className,
  disabled
}: DatePickerProps) {
  return (
    <Popover modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9 text-xs border border-border-default hover:border-border-hover bg-background text-text-primary px-3 cursor-pointer",
            !date && "text-text-muted",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-text-muted flex-shrink-0" />
          <span className="truncate">
            {date ? format(date, "PPP") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 border border-border-default bg-background shadow-md rounded-lg" 
        align="start"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target?.closest?.('[data-slot="select-content"]') || target?.closest?.('[data-radix-select-viewport]')) {
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target?.closest?.('[data-slot="select-content"]') || target?.closest?.('[data-radix-select-viewport]')) {
            e.preventDefault();
          }
        }}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          startMonth={new Date(new Date().getFullYear() - 10, 0)}
          endMonth={new Date(new Date().getFullYear() + 25, 11)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
