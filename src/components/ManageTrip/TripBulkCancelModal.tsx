"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Calendar as CalendarIcon, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { DateTimePicker } from "@/components/Common/DateTimePicker";
import { quickOrderService, tripService } from "@/api/services";

interface PopupField {
  type: "select" | "text" | "textarea" | "date" | "time";
  label: string;
  name: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  value: string;
  required?: boolean;
  mappedName?: string; // for API mapping if different from 'name'
}

interface TripBulkCancelModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  fields: PopupField[];
  onFieldChange: (name: string, value: string) => void;
  onSubmit: (fields: PopupField[]) => void;
  submitLabel?: string;
  titleColor?: string;
  titleBGColor?: string;
  submitColor?: string;
}

const TripBulkCancelModal: React.FC<TripBulkCancelModalProps> = ({
  open,
  onClose,
  title,
  icon,
  fields,
  onFieldChange,
  onSubmit,
  submitLabel = "Submit",
}) => {
  const [dates, setDates] = useState<Record<string, Date | undefined>>({});
  const [selectOptions, setSelectOptions] = useState<any>([]);
  const [remarks, setRemarks] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState(0); // optional


  // Reset + fetch fresh data whenever modal opens
  useEffect(() => {
    if (!open) return;
    // Reset state
    setDates({});
    setSelectOptions([]);
    setErrors({});
    setRemarks("");
    setResetKey(k => k + 1); // optional: force re-mount children

    // Reset all field values to empty
    fields.forEach((f) => onFieldChange(f.name, ""));

    // Fetch select options for each select field
    (async () => {
      for (const f of fields) {
        if (f.type === "select") {
          try {
            const res: any = await quickOrderService.getMasterCommonData({
              messageType: "Cancellation Reason Init",
            });
            const parsedData = JSON.parse(res?.data?.ResponseData || "[]");
            setSelectOptions(parsedData);
          } catch (err) {
            console.error("Failed to load select options", err);
          }
        }
      }
    })();
  }, [open]);

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach((f) => {
      if (f.required && !f.value.trim()) {
        newErrors[f.name] = `${f.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true if no errors
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm w-full p-0 rounded-xl overflow-hidden gap-0"
        aria-describedby="custom-popup-id"
      >
        {/* Header */}
        <DialogTitle>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="p-[10px] rounded-full flex items-center justify-center bg-red-100">
                {icon}
              </div>
              <span className="font-semibold text-[14px] text-Gray-700">
                {title}
              </span>
            </div>
            {/* <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button> */}
          </div>
        </DialogTitle>
        <DialogDescription></DialogDescription>

        {/* Fields */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (validateFields()) {
              onSubmit(fields); // only submit if valid
            }
          }}
          className="flex flex-col gap-4 px-4 py-4"
        >
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-Gray-600 flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>

              {/* Date Picker */}
              {field.type === "date" && (
                <DateTimePicker
                  key={`${resetKey}-${field.name}`} // optional: guarantees fresh mount
                  value={dates[field.name]}
                  onChange={(newDate) => {
                    setDates((s) => ({ ...s, [field.name]: newDate }))
                    onFieldChange(field.name, format(newDate, "yyyy-MM-dd HH:mm:00")) // update field value
                  }}
                />
              )}

              {/* Textarea */}
              {field.type === "textarea" && (
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(e) => onFieldChange(field.name, e.target.value)}
                  rows={3}
                />
              )}

              {/* Select */}
              {field.type === "select" && (
                <Select
                  value={field.value}
                  onValueChange={(val) => onFieldChange(field.name, val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={field.placeholder || "Select"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {selectOptions.map((opt: any, index) => (
                      opt.id && opt.name ? (
                        <SelectItem key={`reason-${index}`} value={String(opt.id)}>
                          {opt.id} || {opt.name}
                        </SelectItem>
                      ) : null
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Text Input */}
              {field.type === "text" && (
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm text-gray-700 pr-9"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => onFieldChange(field.name, e.target.value)}
                  />
                  {field.name.toLowerCase().includes("reason") && (
                    <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                  )}
                </div>
              )}
              {errors[field.name] && (
                <span className="text-xs text-red-500 mt-1">{errors[field.name]}</span>
              )}
            </div>
          ))}

          {/* Submit button */}
          <div className="border-t pt-4">
            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-md px-6 py-2 text-[13px] font-medium"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TripBulkCancelModal;
