"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { DynamicLazySelect } from "@/components/DynamicPanel/DynamicLazySelect";

interface PopupField {
  type: "select" | "text" | "textarea" | "date" | "time" | "lazyselect";
  label: string;
  name: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  value: string;
  required?: boolean;
  mappedName?: string; // for API mapping if different from 'name'
  fetchOptions?: (params: { searchTerm: string; offset: number; limit: number }) => Promise<any[]>; // For lazyselect type
}

interface ReasonClaimModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  fields: PopupField[];
  onFieldChange: (name: string, value: string) => void;
  onSubmit: (fields: PopupField[]) => void;
  submitLabel?: string;
  actionType: "cancel" | "amend" | "short close"; // New prop to determine action type
  titleColor?: string;
  titleBGColor?: string;
  submitColor?: string;
  dynamicReasonMessageType?: string; // New prop for dynamic reason fetching
}

const ReasonClaimModal: React.FC<ReasonClaimModalProps> = ({
  open,
  onClose,
  title,
  icon,
  fields,
  onFieldChange,
  onSubmit,
  submitLabel = "Submit",
  actionType = "cancel", // Default to cancel
  dynamicReasonMessageType
}) => {
  const [dates, setDates] = useState<Record<string, Date | undefined>>({});
  const [selectOptions, setSelectOptions] = useState<any>([]);
  const [remarks, setRemarks] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Determine colors based on action type
  const getColors = () => {
    if (actionType === "cancel") {
      return {
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        submitBg: "bg-red-500",
        submitHover: "hover:bg-red-600",
        borderColor: "border-red-200"
      };
    } else if (actionType === "short close") {
      return {
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        submitBg: "bg-[#F79009]",
        submitHover: "hover:bg-[#FF9800]",
        borderColor: "border-orange-200"
      };
    } else { // amend
      return {
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        submitBg: "bg-blue-500",
        submitHover: "hover:bg-blue-600",
        borderColor: "border-blue-200"
      };
    }
  };

  const colors = getColors();

  // Synchronous render log to confirm the component is rendering
  // console.log("ReasonClaimModal render", { open, actionType });

  // Reset + fetch fresh data whenever modal opens
  useEffect(() => {
    if (!open) return;
    // Log fields when modal opens for debugging (do not modify state here)
    // console.log("ReasonClaimModal fields on open:", fields);
    // Clear all field values when the modal opens so previous selections vanish
    try {
      fields.forEach((f) => onFieldChange(f.name, ""));
    } catch (err) {
      console.error("Failed to clear fields on open", err);
    }
    // Reset state
    setDates({});
    setSelectOptions([]);
    setErrors({});
    setRemarks("");
    setResetKey(k => k + 1);

    // Don't reset field values - preserve pre-populated values from parent
    // The parent component sets the field values before opening the modal
    // Only reset if explicitly needed (for new entries without pre-populated data)

    // Remove focus from any auto-focused elements when modal opens
    setTimeout(() => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT')) {
        activeElement.blur();
      }
    }, 0);

    // Fetch select options for each select field
    (async () => {
      for (const f of fields) {
        if (f.type === "select") {
          try {
            // Use different messageType based on action type
            const messageType = dynamicReasonMessageType ||"Cancellation Reason Init";
              
            const res: any = await quickOrderService.getMasterCommonData({
              messageType: messageType,
            });
            const parsedData = JSON.parse(res?.data?.ResponseData || "[]");
            setSelectOptions(parsedData);
          } catch (err) {
            console.error("Failed to load select options", err);
          }
        }
      }
    })();
  }, [open, actionType]); // Removed 'fields' from dependencies to prevent reset when fields change

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach((f) => {
      if (f.required && !f.value.trim()) {
        newErrors[f.name] = `${f.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm w-full p-0 rounded-xl overflow-hidden gap-0"
        aria-describedby="custom-popup-id"
        onOpenAutoFocus={(e) => e.preventDefault()} // Prevent auto-focus on first field
      >
        {/* Header */}
        <DialogTitle>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className={`p-[10px] rounded-full flex items-center justify-center ${colors.iconBg}`}>
                <div className={`${colors.iconColor}`}>
                  {icon}
                </div>
              </div>
              <span className="font-semibold text-[14px] text-Gray-700">
                {title}
              </span>
            </div>
          </div>
        </DialogTitle>
        <DialogDescription></DialogDescription>

        {/* Fields */}
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            if (validateFields()) {
              onSubmit(fields);
            }
          }}
          className="flex flex-col gap-4 px-4 py-4"
          onFocus={(e) => {
            // Only allow focus if user explicitly clicks/tabs to a field
            // Prevent auto-focus on first field
            if (e.target === formRef.current?.querySelector('input, textarea, select')) {
              // Allow focus only if it's user-initiated
            }
          }}
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
                  key={`${resetKey}-${field.name}`}
                  value={dates[field.name]}
                  onChange={(newDate) => {
                    setDates((s) => ({ ...s, [field.name]: newDate }))
                    onFieldChange(field.name, format(newDate, "yyyy-MM-dd HH:mm:00"))
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
                  tabIndex={0}
                  autoFocus={false}
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
                    {selectOptions?.map((opt: any, index) => (
                      (opt.id && opt.name) ? (
                        <SelectItem key={`reason-${index}`} value={String((opt.id && opt.name) ? `${opt.id} || ${opt.name}` : (opt.id || opt.name))}>
                          {opt.id} || {opt.name}
                        </SelectItem>
                      ) : null
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* LazySelect (DynamicLazySelect) */}
              {field.type === "lazyselect" && field.fetchOptions && (
                <DynamicLazySelect
                  fetchOptions={field.fetchOptions}
                  value={field.value}
                  onChange={(value) => onFieldChange(field.name, value as string)}
                  placeholder={field.placeholder || "Select"}
                  className="w-full"
                  hideSearch={false}
                  disableLazyLoading={false}
                />
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
                    tabIndex={0}
                    autoFocus={false}
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
              className={`w-full ${colors.submitBg} ${colors.submitHover} text-white rounded-md px-6 py-2 text-[13px] font-medium`}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReasonClaimModal;
