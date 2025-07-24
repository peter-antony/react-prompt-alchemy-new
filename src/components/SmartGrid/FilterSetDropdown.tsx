
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ChevronDown, Star, Edit, Trash2, FileText } from 'lucide-react';
import { FilterSet } from '@/types/filterSystem';
import { cn } from '@/lib/utils';

interface FilterSetDropdownProps {
  filterSets: FilterSet[];
  onApply: (filterSet: FilterSet) => void;
  onSetDefault: (filterSetId: string) => void;
  onRename: (filterSetId: string, newName: string) => void;
  onDelete: (filterSetId: string) => void;
}

export function FilterSetDropdown({
  filterSets,
  onApply,
  onSetDefault,
  onRename,
  onDelete
}: FilterSetDropdownProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartRename = (filterSet: FilterSet) => {
    setEditingId(filterSet.id);
    setEditingName(filterSet.name);
  };

  const handleSaveRename = () => {
    if (editingId && editingName.trim()) {
      onRename(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (filterSets.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled className="opacity-50">
        <FileText className="h-4 w-4 mr-1" />
        <ChevronDown className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="transition-all">
          <FileText className="h-4 w-4 mr-1" />
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-72 max-h-60 overflow-y-auto bg-white border shadow-lg z-50"
        align="end"
      >
        <div className="p-2 text-xs font-medium text-gray-500 border-b">
          Saved Filter Sets ({filterSets.length})
        </div>
        
        {filterSets.map((filterSet) => (
          <div key={filterSet.id} className="p-2 border-b last:border-b-0">
            {editingId === filterSet.id ? (
              <div className="space-y-2">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename();
                    if (e.key === 'Escape') handleCancelRename();
                  }}
                  className="h-6 text-xs"
                  autoFocus
                />
                <div className="flex space-x-1">
                  <Button size="sm" onClick={handleSaveRename} className="h-6 text-xs">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelRename} className="h-6 text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium truncate">{filterSet.name}</span>
                    {filterSet.isDefault && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Object.keys(filterSet.filters).length} filters
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    onClick={() => onApply(filterSet)}
                    className="h-6 text-xs flex-1"
                  >
                    Apply
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSetDefault(filterSet.id)}
                    className={cn(
                      "h-6 w-6 p-0",
                      filterSet.isDefault 
                        ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                        : "hover:bg-yellow-50"
                    )}
                    title={filterSet.isDefault ? "Default set" : "Set as default"}
                  >
                    <Star className={cn(
                      "h-3 w-3",
                      filterSet.isDefault && "fill-current"
                    )} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartRename(filterSet)}
                    className="h-6 w-6 p-0 hover:bg-blue-50"
                    title="Rename"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(filterSet.id)}
                    className="h-6 w-6 p-0 hover:bg-red-50 hover:border-red-300"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
