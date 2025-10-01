"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

interface DateTimePickerProps {
  value?: Date
  onChange: (date: Date) => void
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value);
  const [open, setOpen] = useState(false); // control popover


  const updateTime = (h: number, m: number) => {
    if (!date) return
    const newDate = new Date(date)
    newDate.setHours(h, m, 0, 0)
    setDate(newDate)
    onChange(newDate)
    console.log(format(newDate, "yyyy-MM-dd HH:mm"));
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Date Picker */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal"
          >
            {date ? (
              format(date, "yyyy-MM-dd")  // 👈 formatted date
            ) : (
              <span className="text-gray-400">Select Date</span>
            )}
            <CalendarIcon className="ml-2 h-4 w-4 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (!d) return
              const h = date?.getHours() ?? 0
              const m = date?.getMinutes() ?? 0
              d.setHours(h, m, 0, 0)
              setDate(d)
              onChange(d)
              setOpen(false)
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Time Picker */}
      <div className="flex gap-2 items-center">
        {/* Hour */}
        <Select
          value={date ? String(date.getHours()).padStart(2, "0") : ""}
          onValueChange={(val) =>
            updateTime(Number(val), date?.getMinutes() ?? 0)
          }
        >
          <SelectTrigger className="w-20">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {Array.from({ length: 24 }).map((_, h) => (
              <SelectItem key={h} value={String(h).padStart(2, "0")}>
                {String(h).padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-gray-500">:</span>

        {/* Minute */}
        <Select
          value={date ? String(date.getMinutes()).padStart(2, "0") : ""}
          onValueChange={(val) =>
            updateTime(date?.getHours() ?? 0, Number(val))
          }
        >
          <SelectTrigger className="w-20">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {Array.from({ length: 60 }).map((_, m) => (
              <SelectItem key={m} value={String(m).padStart(2, "0")}>
                {String(m).padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Clock className="h-4 w-4 text-gray-400 ml-1" />
      </div>
    </div>
  )
}