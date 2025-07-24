import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus } from "lucide-react";
import type { ConfigurableButtonConfig } from "./configurable-button";

interface DropdownButtonProps {
  config: ConfigurableButtonConfig;
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({ config }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* <button
        type="button"
        className="border border-blue-500 text-blue-500 hover:bg-blue-50 h-8 rounded px-3 flex items-center transition-colors duration-200 gap-2"
        onClick={() => {
          if (config.showDropdown) setOpen((v) => !v);
          else config.onClick?.();
        }}
        title={config.tooltipTitle}
      >
        <Plus className="h-4 w-4" />
        <span className="">{config.label}</span>
        <div className="w-px h-8 bg-blue-500 ml-2" />
        {config.showDropdown && (
          <ChevronDown className="w-4 h-4" />
        )}
      </button> */}
      <button
            type="button"
            className="border border-blue-500 text-blue-500 hover:bg-blue-50 h-9 rounded px-3 flex items-center transition-colors duration-200 gap-2"
            // onClick={() => {
            // if (config.showDropdown) setOpen((v) => !v);
            // else config.onClick?.();
            // }}
            title={config.tooltipTitle}
        >
            <span
                onClick={config.onClick}
                className="select-none cursor-pointer flex items-center text-sm font-medium gap-2"
            >
            <Plus className="h-4 w-4" />
            {config.label}
            </span>
            {config.showDropdown && (
            <>
                <div className="w-px h-9 bg-blue-500 ml-2 mr-1" />
                <span
                onClick={() => {
                    if (config.showDropdown) setOpen((v) => !v);
                    else config.onClick?.();
                }}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                tabIndex={0}
                role="button"
                aria-label="Show dropdown"
                >
                <ChevronDown className="w-4 h-4" />
                </span>
            </>
            )}
        </button>
      {open && config.dropdownItems && (
        <div className="absolute left-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {config.dropdownItems.map((item, idx) => (
            <button
              key={idx}
              className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.icon && <span className="mr-3">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownButton;