
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Settings } from 'lucide-react';

interface PanelInfo {
  id: string;
  title: string;
  visible: boolean;
}

interface PanelVisibilityManagerProps {
  panels: PanelInfo[];
  onVisibilityChange: (panelId: string, visible: boolean) => void;
}

export const PanelVisibilityManager: React.FC<PanelVisibilityManagerProps> = ({
  panels,
  onVisibilityChange
}) => {
  const [open, setOpen] = useState(false);

  const visiblePanels = panels.filter(panel => panel.visible);
  const hiddenPanels = panels.filter(panel => !panel.visible);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Manage Panels
          {hiddenPanels.length > 0 && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
              {hiddenPanels.length} hidden
            </span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Panel Visibility Manager</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Visible Panels */}
          {visiblePanels.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-600" />
                Visible Panels ({visiblePanels.length})
              </h4>
              <div className="space-y-2">
                {visiblePanels.map((panel) => (
                  <div key={panel.id} className="flex items-center space-x-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <Checkbox
                      checked={panel.visible}
                      onCheckedChange={(checked) => onVisibilityChange(panel.id, checked as boolean)}
                    />
                    <Label className="flex-1 text-sm font-medium text-green-800">
                      {panel.title}
                    </Label>
                    <Eye className="h-4 w-4 text-green-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden Panels */}
          {hiddenPanels.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-red-600" />
                Hidden Panels ({hiddenPanels.length})
              </h4>
              <div className="space-y-2">
                {hiddenPanels.map((panel) => (
                  <div key={panel.id} className="flex items-center space-x-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <Checkbox
                      checked={panel.visible}
                      onCheckedChange={(checked) => onVisibilityChange(panel.id, checked as boolean)}
                    />
                    <Label className="flex-1 text-sm font-medium text-red-800">
                      {panel.title}
                    </Label>
                    <EyeOff className="h-4 w-4 text-red-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => panels.forEach(panel => onVisibilityChange(panel.id, true))}
                className="flex-1"
              >
                Show All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => panels.forEach(panel => onVisibilityChange(panel.id, false))}
                className="flex-1"
              >
                Hide All
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
