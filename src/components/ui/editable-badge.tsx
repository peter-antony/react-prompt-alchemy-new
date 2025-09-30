import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface EditableBadgeProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
}

export const EditableBadge: React.FC<EditableBadgeProps> = ({
  value,
  onSave,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editValue with value prop when it changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    console.log("handle save");
    if (editValue.trim()) {
      onSave(editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-xs bg-blue-100 text-blue-600 border border-blue-300 font-semibold px-3 py-1 rounded-full outline-none focus:ring-2 focus:ring-blue-400 w-32"
        />
        <button
          onClick={handleSave}
          className="p-1 hover:bg-green-100 rounded-full transition-colors"
          title="Save"
        >
          <Check className="h-3 w-3 text-green-600" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-red-100 rounded-full transition-colors"
          title="Cancel"
        >
          <X className="h-3 w-3 text-red-600" />
        </button>
      </div>
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`text-xs bg-blue-100 text-blue-600 border border-blue-300 font-semibold px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition-colors ${className}`}
    >
      {value}
    </span>
  );
};
