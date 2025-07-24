import React, { useRef, useEffect } from "react";

export interface FilterOption {
  key: string;
  checked: boolean;
  count: number;
  name: string;
  button?: string; // optional, if you want per-filter button
  className?: string; // For card field type color
}

export interface FilterDropdownProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  filterOptions: FilterOption[];
  onFilterChange: (key: string, checked: boolean) => void;
  onReset: () => void;
  onApply: () => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  open,
  anchorRef,
  onClose,
  filterOptions,
  onFilterChange,
  onReset,
  onApply,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute mt-1 right-0 z-50 w-64 bg-white rounded-xl shadow-lg border border-gray-200"
    >
      <div className="px-4 py-3 border-b font-semibold text-gray-700 bg-gray-50 rounded-t-xl">
        Filter
      </div>
      <div className="px-4 py-3 flex flex-col gap-3">
        {filterOptions.map(option => (
          <label key={option.key} className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={option.checked}
                onChange={() => onFilterChange(option.key, !option.checked)}
                className="accent-blue-600 w-4 h-4"
              />
              <span className="text-gray-700 text-sm">{option.name}</span>
            </div>
            <span
              className={option.className}>
              {option.count.toString().padStart(2, "0")}
            </span>
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2 items-center px-4 py-3 border-t bg-gray-50 rounded-b-xl">
        <button
          className="border rounded px-4 py-1 text-gray-700 text-sm hover:bg-gray-100"
          onClick={() => {
            onReset();
            onClose();
          }}
        >
          Reset
        </button>
        <button
          className="bg-blue-600 text-white rounded px-4 py-1 text-sm font-medium"
          onClick={() => {
            onApply();
            onClose();
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};