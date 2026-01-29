import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { GripVertical } from 'lucide-react';
import { ServerFilter } from '@/types/smartgrid';

interface ServerFilterFieldConfig extends ServerFilter {
  visible: boolean;
  order: number;
}

interface ServerFilterFieldModalProps {
  open: boolean;
  onClose: () => void;
  serverFilters: ServerFilter[];
  visibleFields: string[];
  fieldOrder: string[];
  onSave: (visibleFields: string[], fieldOrder: string[], fieldLabels?: Record<string, string>) => void;
  fieldLabels?: Record<string, string>;
}

export const ServerFilterFieldModal: React.FC<ServerFilterFieldModalProps> = ({
  open,
  onClose,
  serverFilters,
  visibleFields,
  fieldOrder,
  onSave,
  fieldLabels = {}
}) => {
  const [fieldConfigs, setFieldConfigs] = useState<ServerFilterFieldConfig[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Create ordered configs based on fieldOrder, then add any missing fields
    const orderedConfigs: ServerFilterFieldConfig[] = [];
    
    // Add fields in the specified order
    fieldOrder.forEach(fieldKey => {
      const filter = serverFilters.find(f => f.key === fieldKey);
      if (filter) {
        orderedConfigs.push({
          // ...filter,
          ...filter,
          visible: visibleFields.includes(fieldKey),
          order: orderedConfigs.length,
          label: fieldLabels[filter.key] || filter.label
        });
      }
    });
    
    // Add any remaining fields that weren't in the order
    serverFilters.forEach(filter => {
      if (!fieldOrder.includes(filter.key)) {
        orderedConfigs.push({
          // ...filter,
          ...filter,
          visible: visibleFields.includes(filter.key),
          order: orderedConfigs.length,
          label: fieldLabels[filter.key] || filter.label
        });
      }
    });
    
    setFieldConfigs(orderedConfigs);
  }, [serverFilters, visibleFields, fieldOrder, open, fieldLabels]);

  const handleVisibilityChange = (fieldKey: string, visible: boolean) => {
    setFieldConfigs(prev => 
      prev.map(config => 
        config.key === fieldKey ? { ...config, visible } : config
      )
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newConfigs = [...fieldConfigs];
    const draggedItem = newConfigs[draggedIndex];
    newConfigs.splice(draggedIndex, 1);
    newConfigs.splice(index, 0, draggedItem);
    
    // Update order
    const updatedConfigs = newConfigs.map((config, idx) => ({
      ...config,
      order: idx
    }));
    
    setFieldConfigs(updatedConfigs);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleLabelChange = (fieldKey: string, newLabel: string) => {
    setFieldConfigs(prev =>
      prev.map(config =>
        config.key === fieldKey ? { ...config, label: newLabel } : config
      )
    );
  };

  const handleSave = () => {
    const newVisibleFields = fieldConfigs
      .filter(config => config.visible)
      .map(config => config.key);
    
    const newFieldOrder = fieldConfigs.map(config => config.key);


    // Create label map
    const newFieldLabels: Record<string, string> = {};
    fieldConfigs.forEach(config => {
      newFieldLabels[config.key] = config.label;
    });

    onSave(newVisibleFields, newFieldOrder, newFieldLabels);
    onClose();
  };

  const handleReset = () => {
    const configs = serverFilters.map((filter, index) => ({
      ...filter,
      visible: true,
      order: index
    }));
    
    setFieldConfigs(configs);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Configure Search Fields</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {fieldConfigs.map((fieldConfig, index) => (
            <div
              key={fieldConfig.key}
              className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/50"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                opacity: draggedIndex === index ? 0.5 : 1,
                cursor: 'grab'
              }}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              
              <Checkbox
                checked={fieldConfig.visible}
                onCheckedChange={(checked) => 
                  handleVisibilityChange(fieldConfig.key, checked as boolean)
                }
              />
              
              <div className="flex-1">
                {/* <div className="font-medium text-sm">{fieldConfig.label}</div> */}
                <Input
                  value={fieldConfig.label}
                  onChange={(e) => handleLabelChange(fieldConfig.key, e.target.value)}
                  className="mb-1 h-8"
                />
                <div className="text-xs text-muted-foreground">{fieldConfig.key}</div>
                {fieldConfig.type && (
                  <div className="text-xs text-muted-foreground capitalize">
                    Type: {fieldConfig.type}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};