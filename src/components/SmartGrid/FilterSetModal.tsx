
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterValue } from '@/types/filterSystem';

interface FilterSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, isDefault: boolean) => void;
  activeFilters: Record<string, FilterValue>;
  existingNames: string[];
}

export function FilterSetModal({ 
  isOpen, 
  onClose, 
  onSave, 
  activeFilters,
  existingNames 
}: FilterSetModalProps) {
  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Filter set name is required');
      return;
    }

    if (existingNames.includes(name.trim())) {
      setError('A filter set with this name already exists');
      return;
    }

    onSave(name.trim(), isDefault);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setIsDefault(false);
    setError('');
    onClose();
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-80 p-4 bg-white rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Save Filter Set</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Save current filters ({activeFilterCount} active) as a reusable set.
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="filterSetName" className="text-sm font-medium">
              Filter Set Name
            </Label>
            <Input
              id="filterSetName"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter filter set name..."
              className="w-full"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="setAsDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked as boolean)}
            />
            <Label htmlFor="setAsDefault" className="text-sm">
              Set as default filter set
            </Label>
          </div>
          
          {isDefault && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              This filter set will be automatically applied when the grid loads.
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Filter Set
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
