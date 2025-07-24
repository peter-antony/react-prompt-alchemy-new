
import React, { useState } from 'react';
import { Settings, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SectionProps } from './types';
import { cn } from '@/lib/utils';

const FlexGridSection: React.FC<SectionProps> = ({
  section,
  onToggleCollapse,
  onConfigChange,
  className,
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!section.visible) return null;

  const getToggleIcon = () => {
    switch (section.id) {
      case 'left':
        return section.collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />;
      case 'right':
        return section.collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />;
      case 'top':
        return section.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />;
      case 'bottom':
        return section.collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
      default:
        return <ChevronLeft className="h-4 w-4" />;
    }
  };

  const getTogglePosition = () => {
    switch (section.id) {
      case 'left':
        return 'absolute top-1/2 -translate-y-1/2 -right-3 z-10';
      case 'right':
        return 'absolute top-1/2 -translate-y-1/2 -left-3 z-10';
      case 'top':
        return 'absolute left-1/2 -translate-x-1/2 -bottom-3 z-10';
      case 'bottom':
        return 'absolute left-1/2 -translate-x-1/2 -top-3 z-10';
      default:
        return 'absolute top-1/2 -translate-y-1/2 right-0 z-10';
    }
  };

  const sectionStyle = {
    width: section.collapsed ? (section.minWidth || '40px') : (section.width || 'auto'),
    height: section.collapsed ? (section.minHeight || 'auto') : (section.height || 'auto'),
  };

  return (
    <div
      className={cn(
        'relative bg-white transition-all duration-300 ease-in-out',
        section.collapsed ? 'overflow-visible' : 'overflow-hidden',
        className
      )}
      style={sectionStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gear icon - positioned in top-right corner, only show when not collapsed and on hover */}
      {!section.collapsed && isHovered && (
        <div className="absolute top-2 right-2 z-20">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-200 opacity-70 hover:opacity-100"
                aria-label={`Configure ${section.id} panel`}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Panel Configuration</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor={`visible-${section.id}`} className="text-sm">Visible</Label>
                  <Switch
                    id={`visible-${section.id}`}
                    checked={section.visible}
                    onCheckedChange={(checked) => onConfigChange(section.id, { visible: checked })}
                  />
                </div>

                {section.collapsible && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`collapsible-${section.id}`} className="text-sm">Collapsible</Label>
                    <Switch
                      id={`collapsible-${section.id}`}
                      checked={section.collapsible}
                      onCheckedChange={(checked) => onConfigChange(section.id, { collapsible: checked })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm">Width</Label>
                  <Select
                    value={section.width || '100%'}
                    onValueChange={(value) => onConfigChange(section.id, { width: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25%">25%</SelectItem>
                      <SelectItem value="50%">50%</SelectItem>
                      <SelectItem value="75%">75%</SelectItem>
                      <SelectItem value="100%">100%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Height</Label>
                  <Select
                    value={section.height || '100%'}
                    onValueChange={(value) => onConfigChange(section.id, { height: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25%">25%</SelectItem>
                      <SelectItem value="50%">50%</SelectItem>
                      <SelectItem value="75%">75%</SelectItem>
                      <SelectItem value="100%">100%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Content area - hide when collapsed */}
      {!section.collapsed && (
        <div className="p-4 h-full overflow-auto">
          {children || section.content || (
            <div className="text-gray-500 text-sm">
              {section.id.charAt(0).toUpperCase() + section.id.slice(1)} content area
            </div>
          )}
        </div>
      )}

      {/* Toggle handle - always show for collapsible sections */}
      {section.collapsible && (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 w-8 p-0 bg-white border-2 shadow-md hover:bg-gray-50',
            getTogglePosition()
          )}
          onClick={() => onToggleCollapse(section.id)}
          aria-label={`${section.collapsed ? 'Expand' : 'Collapse'} ${section.id} panel`}
          aria-expanded={!section.collapsed}
        >
          {getToggleIcon()}
        </Button>
      )}

      {/* Collapsed content - show a minimal indicator when collapsed */}
      {section.collapsed && (
        <div className="h-full flex items-center justify-center p-2">
          <div className="transform -rotate-90 text-xs text-gray-500 whitespace-nowrap">
            {section.id.charAt(0).toUpperCase() + section.id.slice(1)}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlexGridSection;
