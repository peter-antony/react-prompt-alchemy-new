
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { GripVertical } from 'lucide-react';
import { PanelConfig, FieldVisibilityConfig } from '@/types/dynamicPanel';

interface FieldVisibilityModalProps {
  open: boolean;
  onClose: () => void;
  panelConfig: PanelConfig;
  onSave: (updatedConfig: PanelConfig) => void;
}

export const FieldVisibilityModal: React.FC<FieldVisibilityModalProps> = ({
  open,
  onClose,
  panelConfig,
  onSave
}) => {
  const [fieldConfigs, setFieldConfigs] = useState<FieldVisibilityConfig[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const configs = Object.entries(panelConfig)
      .map(([fieldId, config]) => ({
        fieldId,
        visible: config.visible,
        order: config.order,
        label: config.label
      }))
      .sort((a, b) => a.order - b.order);
    
    setFieldConfigs(configs);
  }, [panelConfig]);

  const handleVisibilityChange = (fieldId: string, visible: boolean) => {
    setFieldConfigs(prev => 
      prev.map(config => 
        config.fieldId === fieldId ? { ...config, visible } : config
      )
    );
  };

  const handleLabelChange = (fieldId: string, label: string) => {
    setFieldConfigs(prev => 
      prev.map(config => 
        config.fieldId === fieldId ? { ...config, label } : config
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

  const handleSave = () => {
    const updatedConfig: PanelConfig = { ...panelConfig };
    
    fieldConfigs.forEach(fieldConfig => {
      if (updatedConfig[fieldConfig.fieldId]) {
        updatedConfig[fieldConfig.fieldId] = {
          ...updatedConfig[fieldConfig.fieldId],
          visible: fieldConfig.visible,
          order: fieldConfig.order,
          label: fieldConfig.label
        };
      }
    });

    onSave(updatedConfig);
    onClose();
  };

  const handleReset = () => {
    const configs = Object.entries(panelConfig)
      .map(([fieldId, config]) => ({
        fieldId,
        visible: true,
        order: config.order,
        label: fieldId // Reset to original field ID as label
      }))
      .sort((a, b) => a.order - b.order);
    
    setFieldConfigs(configs);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Field Visibility</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {fieldConfigs.map((fieldConfig, index) => {
            const isMandatory = panelConfig[fieldConfig.fieldId]?.mandatory;
            
            return (
              <div
                key={fieldConfig.fieldId}
                className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                
                <Checkbox
                  checked={fieldConfig.visible}
                  onCheckedChange={(checked) => 
                    handleVisibilityChange(fieldConfig.fieldId, checked as boolean)
                  }
                  disabled={isMandatory}
                />
                
                <div className="flex-1">
                  <Input
                    value={fieldConfig.label}
                    onChange={(e) => handleLabelChange(fieldConfig.fieldId, e.target.value)}
                    className="text-sm"
                    placeholder="Field label"
                  />
                  {isMandatory && (
                    <span className="text-xs text-red-600 mt-1">Mandatory field</span>
                  )}
                </div>
              </div>
            );
          })}
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
