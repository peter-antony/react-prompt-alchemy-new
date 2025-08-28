import React from 'react';
import { ChevronDown } from 'lucide-react';

type ListItem = {
  id: number,
  name: string,
  seqNo: number,
  default: string,
  description: string
};

interface SimpleDropDownProps {
  list: ListItem[];
  value: string;
  onValueChange: (value: string) => void;
}

export const SimpleDropDownSelection = ({ list, value, onValueChange }: SimpleDropDownProps) => {
  console.log(list, value);
  return (
    <div>
      <div className="relative flex border border-gray-300 rounded-md overflow-hidden bg-white text-sm">
        <select
          value={value}
          onChange={e => onValueChange(e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-700 focus:outline-none appearance-none pr-8"
        >
          <option value="">Select Item</option>
          {list.map((item: any) => (
            <option key={item.QuickUniqueID} value={item.QuickUniqueID}>{`${item.QuickOrderNo} || ${item.Status}`}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </span>
      </div>
    </div>
  );
}