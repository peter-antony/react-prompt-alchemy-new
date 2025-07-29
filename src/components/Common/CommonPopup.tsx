import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface PopupField {
    type: "select" | "text";
    label: string;
    name: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    value: string;
}

interface CommonPopupProps {
    open: boolean;
    onClose: () => void;
    title: string;
    titleColor?: string;
    titleBGColor?: string;
    icon?: React.ReactNode;
    fields: PopupField[];
    onFieldChange: (name: string, value: string) => void;
    onSubmit: () => void;
    submitLabel?: string;
    submitColor?: string;
}

const CommonPopup: React.FC<CommonPopupProps> = ({
    open,
    onClose,
    title,
    titleColor,
    titleBGColor,
    icon,
    fields,
    onFieldChange,
    onSubmit,
    submitLabel,
    submitColor,
}) => (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm w-full p-0 rounded-xl text-xs" aria-describedby="custom-popup-id">
            <div className="flex flex-col">
                {/* Header */}
                <DialogTitle>
                    <div className="flex items-center justify-between mb-4 border-b border-gray-300 py-4 px-4">
                        <div className="flex items-center gap-2">
                            <span className={`${titleColor} ${titleBGColor} w-8 h-8 py-2 justify-items-center rounded-full`}>{icon}</span>
                            <span className={`font-semibold text-lg text-gray-600`}>{title}</span>
                        </div>
                        <button onClick={onClose} className="p-0.5 rounded-full border border-gray-600 hover:bg-gray-100">
                            <X className="w-3 h-3 text-gray-600" />
                        </button>
                    </div>
                </DialogTitle>
                <DialogDescription></DialogDescription>
                {/* Fields */}
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        onSubmit();
                    }}
                    className="flex flex-col gap-4 pb-4 px-4"
                >
                    {fields.map(field => (
                        <div key={field.name} className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">{field.label}</label>
                            {field.type === "select" ? (
                                <select
                                    className="border rounded px-3 py-2 text-sm text-gray-600"
                                    value={field.value}
                                    onChange={e => onFieldChange(field.name, e.target.value)}
                                >
                                    <option value="">{field.placeholder || "Select"}</option>
                                    {field.options?.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    className="border rounded px-3 py-2 text-sm"
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={e => onFieldChange(field.name, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </form>
                <div className="border-t border-gray-300 mt-4 px-4 mb-4">
                <button
                    type="submit"
                    className={`mt-4 w-full ${submitColor} text-white rounded px-6 py-2 text-sm font-medium`}
                    onClick={onClose}
                >
                    {submitLabel}
                </button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);

export default CommonPopup;